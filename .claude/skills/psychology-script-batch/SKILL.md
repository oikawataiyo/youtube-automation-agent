---
name: psychology-script-batch
description: moyo channel の psychology long-form 動画を demand 分析 → 台本 → scaffold/design → 音声/caption(words.js) → bespoke HTML composition → render まで一気通貫で作る end-to-end pipeline。「需要リサーチして台本書いて」「demand分析から台本batch生成」「psychology動画をまとめて作って」で起動。
origin: custom
---

# Psychology Video Batch (Demand → Script → Bespoke Video)

`scripts/analyze-psychology-demand.js` のdemand分析を起点に、未使用pillar/topicのlong-form psychology台本(9分前後 / 1700語前後)をbatch生成し、各台本を **survivorship-v2式の seg毎bespoke HTML composition** に起こして、Kokoro音声 + word-level caption付きで render するまでを通す。

**実際の工程順**: 台本生成 → scaffold/design → **音声 + word timing(words.js)生成** → **bespoke HTML composition(captionをwords.jsにwiring)** → render/concat。**音声がHTMLより先**なのは、caption の active-word emphasis に word-level timing(`seg-NN-words.js`)が必要だから(HTMLを先に組むと caption を後から差し込めない)。

**前半(Phase 1-5)= 台本生成**、**後半(Phase 6-10)= 動画化**。台本だけ欲しい時はPhase 5で止めてよい。

## When to Activate

- 「APIで需要リサーチして台本書いて」「demand分析から台本batch生成」
- 「moyo channelの新しい動画」「次のround」「psychology動画をまとめて作って」
- 既存台本JSONを動画化したい(Phase 6から)

## 分業方針（user確定 / 厳守）

| 担当 | 工程 | 理由 |
|------|------|------|
| **Claude(高価値・委譲不可)** | 台本spec → 描画設計 → seg毎bespoke HTML composition + render/concat の background実行 | 「HTMLさえ正しければ render は失敗しようがない」。意味の符号化は人にしか判断できない |
| **codex(機械的・委譲可)** | 台本本文生成(Phase 3)**のみ** | 1700語の推論を Claude context 外で消費させるのが旨味。**render/concatは委譲しない**(推論0の単一commandで、Claudeが `run_in_background` すればtoken消費ほぼ無し。codex経由は hang/sandbox-bypass のriskを足すだけで割に合わない) |
| **npm script / CLI(機械的・非codex)** | Kokoro TTS / Whisper transcribe / `npx hyperframes render` / `ffmpeg concat` | 既存 `scripts/` ・CLI の実証済みcommand。Claudeが background で叩くだけ |

> **最重要 anti-pattern**: 完成台本を「文脈を知らない汎用template-filler」に渡してはいけない。`mychannel/video/` の旧13本は、codexが**全動画同一の汎用index.html(CSS byte一致・意味のない折れ線graph・particle同seed)**に台本textを流し込んだだけで、台本ごとの `visual_note` が違うのに描画が全部同じになった。bespoke composition(`survivorship-v2` / `depression-is-a-prediction-error-v1`)が正解形。

## Shell context（重要）

このskillの code block は2系統。**取り違えると動かない**:
- **```bash``` block** = **Bash tool(git-bash)** で実行。`grep` / `</dev/null` / `node -e` / `ffmpeg` 等のPOSIX系。Win11でもgit-bash経由で動く。
- **```powershell``` block** = **PowerShell tool** で実行。Health probe の `Get-Process` 等。`grep`はここでは使わない(`Where-Object`相当)。

PowerShell tool で `grep` を含む bash block を流さない(逆も同様)。

## Pre-flight Checks (必須)

実行前に**必ず**確認する。欠けていれば該当工程の手前で**STOPしてuser報告**(mock進行禁止)。

### 台本生成(Phase 1-5)に必要

1. **YouTube token生存確認** — `config/tokens.json` の `refresh_token` 存在 + 軽い probe call で API 疎通確認。
   - `refresh_token` があれば googleapis library が API call 時に access_token を**自動 refresh する**。`expiry_date` が過去でも実害なし。`expiry_date` 単独で「失効」と判断して STOP するのは**誤り**。
   - 各 script は `oauth2Client.on('tokens', ...)` listener で refresh 結果を file に永続化する(実装済)。
   - probe で 401 / `invalid_grant` が返った場合のみ **STOP** して refresh_token 再取得を user に依頼。mock cache で進めない。
   - probe (Phase 1 直前に1回):
     ```bash
     node -e "const{google}=require('googleapis');const fs=require('fs');const c=JSON.parse(fs.readFileSync('config/credentials.json','utf8'));const t=JSON.parse(fs.readFileSync('config/tokens.json','utf8'));const o=new google.auth.OAuth2(c.youtube.client_id,c.youtube.client_secret,c.youtube.redirect_uris[0]);o.setCredentials(t.youtube);google.youtube({version:'v3',auth:o}).channels.list({part:'snippet',mine:true}).then(r=>console.log('OK',r.data.items[0].snippet.title)).catch(e=>{console.error('FAIL',e.message);process.exit(1)})"
     ```
2. **既存scriptの覆い読み** — `data/scripts/` 配下のtopic/pillarを抜く(重複回避)。
3. **shared spec読み込み** — `tasks/script-spec-shared.md` (voice/schema rule)。
4. **reference script読み込み** — `data/scripts/1779639127625_survivorship-bias-is-ruining-your-decisions.json` (schemaと voice の正本)。
5. **codex CLI存在確認** — `codex --version`。Win11ではsandbox bypass flag必須(memory: `codex_windows_sandbox`参照)。

### 動画化(Phase 6-10)に必要 — Stage 0 tooling gate

6. **hyperframes CLI**: `cd mychannel/video/survivorship-v2 && npx --yes hyperframes@0.6.63 --version`
7. **render疎通**: `survivorship-v2` が既に `renders/*.mp4` を持つ(=過去に成功)。
8. **ffmpeg**: `ffmpeg -version`(concatに必須)
9. **Kokoro TTS toolchain**: `uv --version`(`generate-kokoro-narration.py` を `uv run --with kokoro==0.7.16` で起動するため)
10. **Whisper**: `python -c "import whisper"`(`small.en` model使用)

欠落時は代替(手動wav配置等)をuserと合意してから次へ。

---

# 前半 — 台本生成

## Phase 1 — Demand Re-analysis (Claude直接)

```bash
node scripts/analyze-psychology-demand.js --skip-cache
```

- `data/analysis/psychology-demand.json` を更新、`opportunities` 上位を読む
- **mock data混在check**: `data/analysis/psychology-channel-data.json` の `videos[].id` が `mock_*` のみなら **STOP**してuserに報告
- 既存scriptに使われているpillar/topic-keyを除外
- 上位**未使用** topic 3本を確定

**Output**: 確定topic 3本 + 各pillar

## Phase 2 — Topic-Specific Spec Writing (Claude直接)

各topicに対して `tasks/script-spec-{X}.md` を新規作成 (X = 次の未使用letter, 既存A..Mの次)。

template: 既存 `tasks/script-spec-A.md` を参照し、以下を埋める:
- `## TOPIC` — 1-2文の核
- `## OUTPUT PATH` — `data/scripts/{>最大既存ts+1}_{kebab-slug}.json`
- `## SCRIPT VALUES` — topic / pillar / title pattern
- `## HOOK CONCEPT` — 視覚的具体image + pivot文
- `## SECTION OUTLINES` — exactly 5 sections × ~320 word, 各sectionに核citation 2-3本
- `## OUTRO BEATS` — 3 beat
- `## CITATION LIST` — **実在研究 10-15本**(著者/年/媒体)、捏造禁止
- `## SEO HINTS` — title keyword / tags / hashtags
- **`## 描画設計block`(各sectionに必須)** — 後半の動画化に直結。各sectionに以下を1行ずつ:
  - **画面に置く具象物**(例: SEROTONIN脳poster、whiteboardの予測曲線) — 抽象語でなく物
  - **PLAYBOOK axis技法を1つ**(`mychannel/visual-methodology/` 参照: 反転 / 剥がす / gap可視化 等)
  - **反復motif**(全seg共通で再登場させる視覚要素)
  - **gear-change位置**(seg内で画が一段変わる瞬間 / seg毎1回)

> 描画設計blockは「`visual_note`(散文の描画意図)」を構造化したもの。これが無いとPhase 8で描画核が決まらず、template-filler地獄に逆戻りする。

**critical rule**: citationはClaudeが自信を持って実在を断言できる文献のみ。怪しければ別文献に差し替える。

**Output**: spec file 3本 (例 N/O/P)

## Phase 3 — Script Generation (Codex並列 x3)

各specをcodexに**background並列**で委譲(token saving)。**EN JSON と JP MD の dual output** を生成。

```bash
codex exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox "<<EOT
読み込み:
  - tasks/script-spec-shared.md
  - tasks/script-spec-{X}.md
  - tasks/script-jp-md-template.md (JP MD format + 翻訳 rule + カタカナ NG list)
  - data/scripts/1779639127625_survivorship-bias-is-ruining-your-decisions.json (EN reference)
task:
  1. spec {X} の指示通り EN 台本 JSON を生成し、指定 OUTPUT PATH (data/scripts/{ts}_{slug}.json) に書き出せ。
  2. 同じ {ts}_{slug} prefix で JP 意訳 MD を data/scripts/{ts}_{slug}.md に書き出せ (template に従う)。
制約:
 - shared specのschema/voiceを厳守
 - citation listからのみ引用 (捏造禁止)
 - total_word_count 1625-1775 (EN)
 - 5 sections exact
 - JP MD: citation は原文ママ、カタカナ語禁止、narration 意訳
報告: JSON path + MD path + total_word_count + estimated_duration_minutes の4行のみ。diff返却禁止。
EOT
" </dev/null
```

**MUST**: command末尾に `</dev/null` を付けて stdin を切る。これが無いと background 起動時に codex は対話入力待ちに入り、CPU 0秒のまま無限に hang する(2026-05-30 round 2 で 14時間 hang 事故。kill して `</dev/null` 付き再起動で2-3分で完了)。

- 3つ並列起動 (Bash `run_in_background: true`)
- Codexの中間reasoningはClaude contextに戻さない / 完了通知を待つ(polling禁止)
- **Health probe (launch直後 60-180秒で1回のみ)**: output file size と codex processの CPU 秒数を見る。`size == 0 && cpu < 1s` なら hang 確定。kill して `</dev/null` 付きで relaunch。
  ```powershell
  Get-Process | Where-Object { $_.ProcessName -eq 'codex' -and $_.StartTime -gt (Get-Date).AddMinutes(-30) } |
    Select-Object Id, CPU, @{N='RAM_MB';E={[math]::Round($_.WorkingSet64/1MB,1)}}
  ```

**Output**: 3 JSON + 3 MD in `data/scripts/` (合計 6 files)

## Phase 4 — Script Verification (Claude直接)

#### JSON 検証
```bash
node -e "const s=require('./data/scripts/{file}.json');
const c=s.script;
let words=c.hook.text.split(/\s+/).length;
for(const sec of c.sections) words+=sec.narration.split(/\s+/).length;
words+=c.outro.narration.split(/\s+/).length;
console.log('file:', '{file}');
console.log('words:', words, words>=1625&&words<=1775?'OK':'OUT-OF-RANGE');
console.log('sections:', c.sections.length, c.sections.length===5?'OK':'WRONG');
console.log('citations:', s.script.metadata.key_studies_referenced.length);
"
```
- word count 1625-1775 / sections=5 / hook 35-65語 / outro 80-130語 / citation 2-3本をspec listと突合

#### JP MD 検証
- file 存在、`## Hook`/`## Section 1..5`/`## Outro`/`## 参考研究`/`## SEO` headings 全部存在
- カタカナ NG grep で 0 hit: `Grep 'リサーチ|コンテキスト|エビデンス|コスト|ストーリー|フレームワーク'` glob `data/scripts/*.md`
- citation block 英文行数 ≈ JSON `key_studies_referenced.length`

失敗時は codex に修正委譲(同 spec + 失敗内容)。**Output**: 全 script PASS

## Phase 5 — Commit Scripts (Claude直接)

```bash
git add tasks/script-spec-{X}.md ... data/scripts/{ts}_*.json data/scripts/{ts}_*.md
git commit -m "feat: add round N psychology scripts ({topic-slugs})"
git push
```
台本だけの依頼ならここで完了報告。動画化まで続ける場合はPhase 6へ。

---

# 後半 — 動画化（1台本ずつ / survivorship-v2式 bespoke）

> 1 sessionで全台本の動画化を前提にしない。**1動画 = 1作業単位**。重い(bespoke 7 seg)ので、台本1本ずつ Stage 完了→報告。順序は **scaffold → 音声/caption → bespoke build(seg単位) → render/concat → commit**。

## Phase 6 — Scaffold + design.md (Claude直接)

1. **codex版/旧版があれば archive(削除でなく退避)**: 旧 `mychannel/video/<slug>-v1/` は `mychannel/video/_archive/<slug>-v1-codex/` へ通常move。source `data/scripts/{ts}_*.json|.md` は触らない。
2. **project scaffold**: `mychannel/video/<slug>-v1/` を `survivorship-v2` 構造で作成 — `package.json`(hyperframes@0.6.63), `meta.json`, `hyperframes.json`, `assets/narration/`, `compositions/`, `CLAUDE.md`(survivorship規約copy)。
   - narration txt を `assets/narration/00-hook.txt` … `NN-<slug>.txt` に segment分割して書き出す(source JSON の hook/sections/outro から)。
3. **design.md 作成**: palette(動画topicに合わせ、回復系なら1段階grade)、type stack、motion grammar、Phase 2 描画設計blockを per-scene visual register に転記。

**完了判定**: scaffold一式 + narration txt + design.md が存在し、CSSが旧13本とbyte非一致(汎用template由来でない)。

## Phase 7 — 音声 + word-level caption (npm script / Claude直接)

機械工程。**`--skip-build` を必ず付ける**(後述)。

```bash
# repo root から。Kokoro am_adam wav + Whisper words.js を生成し、
# 旧来の自動 index.html 再生成(build-wordlevel-video.js)は SKIP する
npm run video:produce -- mychannel/video/<slug>-v1 --skip-build
```

- これで生成される: `assets/narration/seg-NN.wav`(Kokoro am_adam) + `seg-NN-words.js`(Whisper `small.en`、形式 `window.<var>=[[word,start,end],...]`)
- **`--skip-build` が肝**: `build-wordlevel-video.js` は index.html を機械再生成して汎用motifを埋める = 旧13本を壊した anti-pattern そのもの。bespoke では使わない。TTS(`--skip-audio`で抑止)とtranscript(`--skip-transcript`)だけを使い、buildは人(Phase 8)が担う。
- 個別に叩くなら: TTS = `uv run --python 3.12 --with kokoro==0.7.16 --with soundfile -- python scripts/generate-kokoro-narration.py mychannel/video/<slug>-v1`、transcribe = `python scripts/transcribe-word-timings.py mychannel/video/<slug>-v1`。
- **TTS失敗時**: 1回再試行→なお失敗ならuserに報告し手動wav配置に切替(無音mp4で進めない)。

**完了判定**: 全segに `.wav` + `-words.js` が揃い、words.js の first/last timing が妥当。

## Phase 8 — Bespoke Composition Build (Claude直接 / seg単位)

各segを `compositions/seg-NN.html` で**手書き**。`survivorship-v2` と `depression-is-a-prediction-error-v1` を worked example として参照。**必ず `/hyperframes` `/gsap` skill を先に開く**(framework規約は generic web docs に無い)。

各 seg の作り方:
- design.md の visual register(Phase 2 描画設計block)を SVG/DOM + GSAP に翻訳。**描画核 = その seg の意味の符号化**(例: 「予測符号化への反転」= SEROTONIN poster を剥がすと予測式)。
- caption は `seg-NN-words.js` を読み、active word を marker emphasis(survivorship `#caps` 方式)。`<audio data-track-index>` で seg-NN.wav を鳴らす。
- hyperframes規約: 全timed要素に `data-start/data-duration/data-track-index` + `class="clip"`、timeline は `paused` で `window.__timelines["<id>"]` 登録、非決定論禁止(`Date.now`/`Math.random` 不可、seed固定 mulberry32)。
- 制約: 固定hold>15s禁止、反復motif有り、gear-change 1回/seg、7 seg全て描画核が相異なる(使い回し禁止)。

### 描画の hard rules（過去に踏んだ地雷）
- **DOM mutation は seek-safe にする**: timeline 内で `textContent` 等を変える時、GSAP `.call()` は**使わない**。deterministic render は非単調(後退)seek するが `.call` の副作用は後退で巻き戻らず固着する(seg-04でcounter末尾値が全時刻に出た)。**interpolated proxy object + `onUpdate` tween** を使う(これは seek-reversible)。build時に1回だけ設定する静的textContentはOK。
- **`repeat:-1`(無限repeat)禁止** — lint error `gsap_infinite_repeat`。deterministic renderer が禁じる。
- **DrawSVGPlugin は未load**(premium)。SVG path reveal は `stroke-dasharray` + `stroke-dashoffset` tween(`getTotalLength()`)で代替。

### seg完了ごとの check + render + commit

**正規 gate は `npm run check`**(= `lint && validate && inspect`、project の package.json に定義)。全 seg 揃った段階の最終確認はこれを使う。
```bash
cd mychannel/video/<slug>-v1
npm run check
```
ただし **長尺 project では `inspect` が page navigation timeout で落ちることがある**(seg数が多い / DOM 重い時。`tasks/hyperframes-video-production-flow.md` 参照)。その場合は `inspect` を諦め、**`lint` + `validate` を直接叩き + frame QA で代替**する:
```bash
# lint は project単位(単一file pathを渡すと "Not a directory" error)。audio false-positive を除外:
npx --yes hyperframes@0.6.63 lint 2>&1 | grep -vi "duplicate_audio_track\|layered audio\|non-overlapping\|Fix: Use"
npx --yes hyperframes@0.6.63 validate
```
seg単位の反復中は lint だけ回し、最終で `npm run check`(or 上記 fallback)。
```bash
# 個別 render(background, stdin切る)
npx --yes hyperframes@0.6.63 render --composition compositions/seg-NN.html --output renders/seg-NN.mp4 --quiet </dev/null
git add compositions/seg-NN.html assets/narration/seg-NN* && git commit -m "feat: add <slug> seg-NN composition" && git push
```

### frame検証（render後・必須）
```bash
ffmpeg -ss <t> -i renders/seg-NN.mp4 -frames:v 1 -y renders/_frames/sNN-<t>.png -loglevel error
```
その後 PNG を Read。
- frame は**必ず `renders/_frames/` の中**に出す(Read は git-bash の /tmp に届かない)。
- **re-render後は必ず frame を取り直す**(古いPNGはstale。修正前の画を見て「直ってない」と誤判定した事故あり)。
- preview MCP は使わない(port競合)。
- 3時刻程度(序/中/終)で要素重なり無し・判読可能・citation on cue を確認。

**完了判定**: 7 seg(hook含む)全て lint error 0 + frame検証で描画核が相異なる。

## Phase 9 — Render concat (Claude直接 / background。codex委譲しない)

全seg render後、stream-copy concat(全seg同一 stream params なので `-c copy` で lossless・高速)。render(Phase 8)もconcatも **Claude が `run_in_background` で叩く**。推論0の単一commandなのでcodex委譲しない(待つだけでtoken消費ほぼ無し)。
```bash
# renders/concat.txt は seg-00..NN を列挙(file 'seg-00-hook.mp4' 形式)
ffmpeg -f concat -safe 0 -i renders/concat.txt -c copy -y renders/<slug>-v1-full.mp4
```
- full mp4 が script総尺 ±10% に収まるか、sample frame(序盤/中盤/終盤)で正しい seg が出るか確認。
- full mp4 は gitignore(commitしない)。`renders/concat.txt` は commit。

**完了判定**: full mp4 が video+audio stream を持ち、尺が想定内、sample frame判読OK。

## Phase 10 — Commit & Push (Claude直接)

seg単位でcommit済みなら、残り(design.md / concat.txt / production-notes.md / meta.json 等)をまとめてcommit + push。
- `production-notes.md` に outputs と render caveat を記録。
- push まで完了(global rule: unpushed = 存在しない)。

---

## Hard Constraints

| 項目 | rule |
|------|------|
| Token失効判定 | `expiry_date` 単独で判定禁止。`refresh_token` 存在 + probe call で判定。401/`invalid_grant` のみ STOP |
| Citation | 実在のみ。Claude/Codex問わず捏造禁止 |
| Word count / Sections | 1625-1775 (hard) / exact 5 |
| Pillar重複 | 既存scriptの pillar/topic-key を必ず除外 |
| Codex呼び出し | `--dangerously-bypass-approvals-and-sandbox` 必須(Win11 sandbox) |
| Codex stdin | background起動は `</dev/null` 必須。無いと無限 hang |
| Codex output | path + word_count + duration の数行のみ返却。full diff 禁止 |
| JP MD twin | EN JSON 1本につき JP 意訳 MD 1本(`{ts}_{slug}.md`)。citation原文ママ・カタカナ語禁止 |
| 動画化の自動build | `video:produce` は **`--skip-build` 必須**。`build-wordlevel-video.js` の自動index.html再生成は使わない |
| 描画核 | seg毎bespoke。7 seg全て相異なる。汎用折れ線graph/同一CSS/同一seed禁止 |
| DOM mutation | timeline内のtextContent等は proxy+onUpdate。`.call()` での mutation 禁止(seek-unsafe) |
| check gate | 最終確認は `npm run check`(lint && validate && inspect)。長尺で inspect timeout 時のみ lint+validate 直叩き+frame QA で代替。lint は project単位(単一file path禁止)・audio false-positive を grep除外 |
| frame検証 | re-render後は必ず取り直す。`renders/_frames/` に出す。preview MCP不可 |
| Commit | script/seg 単位で push まで完了 |
| カタカナ禁止 | 日本語散文(design.md/comment/SKILL.md本文等)で英語由来術語は英単語のまま(render, composition)。**対象外**: 画面内英語・caption・台本英文(元々英語) / 「」内の活性化trigger例(需要リサーチ等 = userの実発話の引用) / Phase 4 grep NG-list(検査対象語そのもの)。この skill 本文自体も grep `リサーチ|コンテキスト|エビデンス|コスト|ストーリー|フレームワーク` で確認し、上記対象外を除き 0 hit を保つ |

## Anti-patterns (絶対やらない)

- **完成台本を文脈なしの汎用template-fillerに渡す**(旧13本が全部同じ描画になった root cause)
- **`video:produce` を `--skip-build` 無しで実行**(自動motif再生成で template地獄に逆戻り)
- timeline内で `.call()` で DOM mutation(後退seekで固着する)
- `npx hyperframes lint <single-file.html>`("Not a directory" error。pathを渡さず project全体をlint)
- re-render後に古い `_frames` PNG を信用する(stale)
- mock dataのdemand resultでtopic選定 / token失効を握りつぶしてmock progress
- `expiry_date` 過去だけを理由に STOP(refresh_token validなら auto-refresh。probeで実証)
- **render/concat を codex に委譲する**(推論0の単一commandでtoken節約にならず、hang/sandbox-bypassのriskだけ増える。codexはPhase 3台本生成のみ)
- codexにfull diff返却させる / 委譲後にClaudeで同file再Read
- citation捏造(spec list外を勝手に追加)
- script/動画をpushせずsession終了
- background codex を `</dev/null` 無しで起動(stdin待ちで hang)
- hang した codex を「まだ生成中」と推測して待ち続ける(CPU 0秒を見たら kill)

## Reference Files

- `tasks/script-spec-shared.md` — voice/schema正本(EN JSON + JP MD dual output 要件)
- `tasks/script-spec-A.md` — topic spec template(Libet)
- `tasks/script-jp-md-template.md` — JP 意訳 MD format + 翻訳 rule + カタカナ NG list
- `tasks/hyperframes-video-production-flow.md` — npm script flow(`video:produce` 等)の詳細
- `data/scripts/1779639127625_survivorship-bias-is-ruining-your-decisions.json|.md` — schema/voice reference
- `mychannel/video/survivorship-v2/` — bespoke composition の正本(描画 register / caption wiring / 構造)
- `mychannel/video/depression-is-a-prediction-error-v1/` — 直近の worked example(seg毎bespoke, seek-safe counter, ffmpeg concat)
- `mychannel/visual-methodology/` — 岡田式 PLAYBOOK(axis技法 / 原則)
- `scripts/analyze-psychology-demand.js` — demand pipeline entry
- `scripts/produce-video-project.js` / `generate-kokoro-narration.py` / `transcribe-word-timings.py` — 音声/transcript の機械工程
- `utils/psychology-domain.js` — PSYCHOLOGY_CHANNELS / TOPIC_RULES / pillar mapping

## Recovery / Re-plan Triggers

以下でSTOPして re-plan:
- token失効 / API quota超過 / demand cache全mock
- codex並列で2/3以上failure / citation捏造を verification で検知
- **codex hang 検知**(起動後180秒で output 0 bytes かつ CPU 0秒): 該当processを `Stop-Process -Force` で kill(codex本体 + 親node)、`</dev/null` 付きで relaunch
- Kokoro/Whisper toolchain欠落 / render が seg単位で繰り返し失敗 → user合意の代替手順へ

## Session-end Report

完了時に1 messageで報告:
- 生成 script path(JSON+MD) / 各 (topic / pillar / word count / duration)
- 動画化した場合: project path / full mp4 尺 / seg数 / commit hash
- push status
