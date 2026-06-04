---
name: psychology-script-batch
description: moyo channel の psychology long-form 動画を demand 分析 → 台本 → scaffold/design → 音声/caption(words.js) → bespoke HTML composition → render まで一気通貫で作る end-to-end pipeline。「需要リサーチして台本書いて」「demand分析から台本batch生成」「psychology動画をまとめて作って」で起動。
origin: custom
---

# Psychology Video Batch (Demand → Script → Bespoke Video)

`scripts/analyze-psychology-demand.js` のdemand分析を起点に、未使用pillar/topicのlong-form psychology台本(9分前後 / 1700語前後)をbatch生成し、各台本を **seg毎bespoke HTML composition**(既定 = 3D importmap pipeline、構造/caption は survivorship-v2 式)に起こして、Kokoro音声 + word-level caption付きで render するまでを通す。

**実際の工程順**: 台本生成 → scaffold/design → **音声 + word timing(words.js)生成** → **bespoke HTML composition(captionをwords.jsにwiring)** → render/concat。**音声がHTMLより先**なのは、caption の active-word emphasis に word-level timing(`seg-NN-words.js`)が必要だから(HTMLを先に組むと caption を後から差し込めない)。

**前半(Phase 1-5)= 台本生成**、**後半(Phase 6-10)= 動画化**。台本だけ欲しい時はPhase 5で止めてよい。

## 既定の映像方式（2026-06 以降の default）

動画化の既定は **three.js + bloom / seeded simplex-noise / rough.js を importmap で載せた 3D composition**(正本 = `your-anxiety-is-a-threat-forecast-v1`)。各 seg は `scene-kit.js`(3D scene/chibi/camera/caption) + `fx-kit.js`(bloom/noise/rough) を**動画フォルダにコピー**して組む(per-video copy。完成動画を凍結し再 render で壊さないため。共有 lib 化は将来の別タスク)。

**最重要の演出規律 = 退屈にしない**:
- **同一 framing を 4 秒以上 hold しない**。`makeCameraRig` + `makeCutter.auto(from,to,dur,frames,dolly)` で `dur≤4` の hard cut を全 seg に敷く。**3D seg は framing を 5 種以上**用意する。
- **同一 framing 中も静止させない**。dolly push / simplex displacement / motif animation で被写体を常時動かす。「動かない 4 秒」も禁止(=ほぼ同じ絵の継続を作らない)。
- **暗くしない**。`warmLight` + `makeFill` の floor、exposure ~1.5、bloom `threshold~0.4`(明部だけ光らせ白飛び回避)。
- 2D/SVG seg(例: `depression-is-a-prediction-error-v1` seg-05 blueprint)も**可**。ただし上記の ≤4s / 常時変化 / 明るさ ルールは 2D にも同じく適用する。

詳細 recipe は Phase 8。新規 library を足す時は Phase 8 の **Phase-0 spike gate** を必ず通す。

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
11. **3D importmap pipeline**: install不要(three 0.160 + addons + simplex-noise@4 + roughjs@4.6.6 は `<script type="importmap">` で CDN map)。正本 `your-anxiety-is-a-threat-forecast-v1` の `assets/lib/{scene-kit,fx-kit}.js` が存在し render 済(=過去に成功)を確認。**新規 library を足す時のみ** Phase 8 の Phase-0 spike gate を通す。

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

各specをcodexに**background並列**で委譲(token saving)。**EN JSON** を生成。

```bash
codex exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox "<<EOT
読み込み:
  - tasks/script-spec-shared.md
  - tasks/script-spec-{X}.md
  - data/scripts/1779639127625_survivorship-bias-is-ruining-your-decisions.json (EN reference)
task:
  1. spec {X} の指示通り EN 台本 JSON を生成し、指定 OUTPUT PATH (data/scripts/{ts}_{slug}.json) に書き出せ。
制約:
 - shared specのschema/voiceを厳守
 - citation listからのみ引用 (捏造禁止)
 - total_word_count 1625-1775 (EN)
 - 5 sections exact
報告: JSON path + total_word_count + estimated_duration_minutes の3行のみ。diff返却禁止。
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

**Output**: 3 JSON in `data/scripts/`

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

失敗時は codex に修正委譲(同 spec + 失敗内容)。**Output**: 全 script PASS

## Phase 5 — Commit Scripts (Claude直接)

```bash
git add tasks/script-spec-{X}.md ... data/scripts/{ts}_*.json
git commit -m "feat: add round N psychology scripts ({topic-slugs})"
git push
```
台本だけの依頼ならここで完了報告。動画化まで続ける場合はPhase 6へ。

---

# 後半 — 動画化（1台本ずつ / survivorship-v2式 bespoke）

> 1 sessionで全台本の動画化を前提にしない。**1動画 = 1作業単位**。重い(bespoke 7 seg)ので、台本1本ずつ Stage 完了→報告。順序は **scaffold → 音声/caption → bespoke build(seg単位) → render/concat → commit**。

## Phase 6 — Scaffold + design.md (Claude直接)

1. **project scaffold**: `mychannel/video/<slug>-v1/` を作成 — `package.json`(hyperframes@0.6.63), `meta.json`, `hyperframes.json`, `assets/narration/`, `compositions/`, `CLAUDE.md`(規約copy)。
   - **3D kit をコピー**: 正本 `your-anxiety-is-a-threat-forecast-v1/assets/lib/{scene-kit.js,fx-kit.js}` を `assets/lib/` に**verbatim copy**(per-video copy)。
   - narration txt を `assets/narration/00-hook.txt` … `NN-<slug>.txt` に segment分割して書き出す(source JSON の hook/sections/outro から)。
2. **design.md 作成**(正本 = anxiety-v1 の `design.md`)。以下を必ず含める:
   - **unifying motif**(全seg共通の視覚through-line。例: weather/forecast)+ palette(cold baseline → seg後半で warm へ1段 grade。BG/COLD/accent/DAYLIGHT を hex で)。
   - **global rules**: `composer.render()`(bloom)を `gsap.timeline({onUpdate})` 内で / `window.THREE=THREE` を SceneKit 呼出前 / 非決定論禁止(`Date.now`/`Math.random`/`rAF` 不可、seed固定 mulberry32) / 各 composition が importmap を宣言。
   - **per-seg brief** に **framing register を明記**: 各 3D seg に **framing 5 種以上**を1行ずつ列挙し、`makeCutter.auto(...,dur≤4,...)` で回す前提を書く。各 seg に **gear-change**(画が一段変わる瞬間)1回以上、**反復motif**の再登場、**brightness floor**(exposure~1.5 / `warmLight` / `makeFill`)、**bloom threshold~0.4** を register に転記。
   - Phase 2 の描画設計block(具象物 / PLAYBOOK axis / motif / gear-change)を per-seg visual register に落とす。

**完了判定**: scaffold一式 + `assets/lib/{scene-kit,fx-kit}.js` + narration txt + design.md が存在し、design.md に各segの framing register(5種以上・≤4s明記)がある。CSSが旧13本とbyte非一致(汎用template由来でない)。

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

各segを `compositions/seg-NN.html` で**手書き**。正本 = `your-anxiety-is-a-threat-forecast-v1`(3D importmap)。2D seg は `depression-is-a-prediction-error-v1` seg-05 を参照。**必ず `/hyperframes` `/gsap` `/three` skill を先に開く**(framework規約は generic web docs に無い)。

### 既定の 3D composition recipe（importmap + module）
1. **head に importmap**(three は1 instanceに固定):
   ```html
   <script type="importmap">{ "imports": {
     "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
     "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/",
     "simplex-noise": "https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js",
     "roughjs": "https://unpkg.com/roughjs@4.6.6/bundled/rough.esm.js"
   }}</script>
   ```
2. **`gsap` は UMD `<script src>`**、**`scene-kit.js` は classic IIFE `<script src>`**(THREE 参照は遅延)。**`fx-kit.js` は `<script type="module">` で import**。
3. module 冒頭で **`import * as THREE from "three"; window.THREE = THREE;`** を **SceneKit 呼出前**に実行(L8)。
4. **render は `composer.render()`**(`fx-kit` の `makeBloomComposer`)を `gsap.timeline({ paused:true, onUpdate(){ rig.apply(); /*proxy→scene*/ composer.render(); } })` 内で呼ぶ。`renderer.render` は使わない。
5. caption は `seg-NN-words.js` を読み active word を marker emphasis。`<audio data-track-index>` で seg-NN.wav を鳴らす。timeline は `window.__timelines["<id>"]` 登録。

### 退屈にしない hard rule（user 確定 / 最優先）
- **同一 framing を 4 秒以上 hold しない**: `const rig = SK.makeCameraRig(presets/*5+*/); const cut = SK.makeCutter(tl, rig.state);` → `cut.auto(0, END, 4, [0,1,2,3,4], /*dolly*/true)` で seg 全尺を ≤4s の hard cut で割る。**3D seg は presets 5 種以上**。
- **同一 framing 中も静止させない**: dolly push(`makeCutter` の dolly 引数)/ simplex displacement(`pos_i(t)`)/ motif animation のいずれかで被写体を常時動かす。「動かない 4 秒」も NG(=ほぼ同じ絵の継続禁止)。
- **暗くしない**: `SK.warmLight(key, ambient, warm, COLD, WARM)` + `SK.makeFill(~1.3)` の floor、`renderer.toneMappingExposure ~1.5`、bloom `threshold~0.4` + 控えめ `strength`(0.5-1.2)で白飛び回避(L10)。寄り画は camera を引き発光体で画面を埋めない。暗 object は rim/catchlight を当てる。
- 反復motif有り / gear-change 1回以上/seg / **全 seg 描画核が相異なる**(使い回し禁止)。**描画核 = その seg の意味の符号化**(例: 「予測への反転」= poster を剥がすと予測式)。

### 再利用パターン（anxiety-v1 で実証 / 流用可）
- **rough.js → CanvasTexture**: rough を `canvas` に**固定 seed で1回 bake** → `THREE.CanvasTexture` に貼る。3D camera に勝手に追従し決定論的(`?`-door / chalk DANGER·SAFE / brass dial)。
- **simplex flow-field**: 粒子 i の位置を **`pos_i(t)=base+amp*noise3D(...)+storm*(base-center)`** の **t の純関数**にする(seek 安全。HERO 例 = seg-03 の透明 body から storm)。
- **chalk text** = jittered `fillText`(seeded)で手描き感。**cold→warm** = `warmLight` の warm を 0→1 tween + emissive を上げる。

### Phase-0 spike gate（新規 library を足す時のみ必須）
新しい lib(別 addon 等)を導入する前に **使い捨て probe を headless render**し、**並列 worker(各自 seek)で同一 frame が出る=決定論/seek 安全**を実証してから本番 seg を作る。実証前に7 seg 量産しない。

### 描画の hard rules（過去に踏んだ地雷）
- **非決定論禁止**: `Date.now`/`Math.random`/`performance.now`/`rAF` 不可。乱数は seed 固定 `mulberry32`(`fx-kit`)。noise/bloom は timeline proxy の `t`/値から駆動。
- **DOM/値 mutation は seek-safe に**: timeline 内で `textContent` 等を変える時 GSAP `.call()` は**使わない**(後退 seek で副作用が固着。seg-04 で counter 末尾値が全時刻に出た)。**proxy object + `onUpdate` tween** を使う。build 時1回の静的 textContent は OK。
- **`repeat:-1`(無限repeat)禁止** — lint error `gsap_infinite_repeat`。有限回 `repeat: Math.ceil(dur/cycle)-1` を計算して渡す(L9)。
- **DrawSVGPlugin は未load**(premium)。SVG path reveal は `stroke-dasharray`+`stroke-dashoffset` tween(`getTotalLength()`)で代替。
- 全 timed 要素に `data-start/data-duration/data-track-index` + `class="clip"`。

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
- **≤4s ルール検証**: 4 秒以内差の **近接2時刻**(例 t=10.0/13.5)を取り、**framing か被写体が明確に変化**していることを確認。同じ絵なら hold 過長 → `makeCutter.auto` の `dur` か intra-shot 動きを直す。

**完了判定**: 全 seg(hook含む)lint error 0 + frame検証で描画核が相異なる + ≤4s 検証で「動かない4秒」が無い。

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
| 動画化の自動build | `video:produce` は **`--skip-build` 必須**。`build-wordlevel-video.js` の自動index.html再生成は使わない |
| 描画核 | seg毎bespoke。全 seg 相異なる。汎用折れ線graph/同一CSS/同一seed禁止 |
| 退屈にしない(最優先) | 同一 framing hold **≤4s**(`makeCutter.auto` dur≤4)・**3D seg は framing 5種以上**・同一framing中も dolly/simplex/motif で常時変化(「動かない4秒」も禁止)・gear-change 1回以上/seg |
| 3D loading | importmap で three 0.160+addons+simplex-noise+roughjs を map。`fx-kit` は module import、`gsap`/`scene-kit` は UMD/classic。`window.THREE=THREE` を SceneKit 呼出前。render は `composer.render()` を onUpdate 内 |
| 明るさ/bloom | `warmLight`+`makeFill(~1.3)` floor・exposure~1.5・bloom `threshold~0.4`+控えめ strength(0.5-1.2)。寄り画は camera 引く・暗 object は rim/catchlight |
| 新規 library | 導入前に Phase-0 spike(headless + 並列 worker seek)で決定論実証。未実証で量産禁止 |
| DOM mutation | timeline内のtextContent等は proxy+onUpdate。`.call()` での mutation 禁止(seek-unsafe) |
| check gate | 最終確認は `npm run check`(lint && validate && inspect)。長尺で inspect timeout 時のみ lint+validate 直叩き+frame QA で代替。lint は project単位(単一file path禁止)・audio false-positive を grep除外 |
| frame検証 | re-render後は必ず取り直す。`renders/_frames/` に出す。preview MCP不可 |
| Commit | script/seg 単位で push まで完了 |
| カタカナ禁止 | 日本語散文(design.md/comment/SKILL.md本文等)で英語由来術語は英単語のまま(render, composition)。**対象外**: 画面内英語・caption・台本英文(元々英語) / 「」内の活性化trigger例(需要リサーチ等 = userの実発話の引用) / Phase 4 grep NG-list(検査対象語そのもの)。この skill 本文自体も grep `リサーチ|コンテキスト|エビデンス|コスト|ストーリー|フレームワーク` で確認し、上記対象外を除き 0 hit を保つ |

## Anti-patterns (絶対やらない)

- **完成台本を文脈なしの汎用template-fillerに渡す**(旧13本が全部同じ描画になった root cause)
- **`video:produce` を `--skip-build` 無しで実行**(自動motif再生成で template地獄に逆戻り)
- **同一 framing/被写体を 4 秒以上 hold する**(退屈。≤4s で切るか intra-shot で動かす。user 確定の最優先 rule)
- **three の addon(bloom 等)を UMD `<script src>` で載せようとする**(r149 以降 `examples/js/` 不在。importmap + module が正解。L8)
- **bloom 白飛び**: 寄りすぎ+強 point light+高 bloom で画面飽和(threshold↑ strength↓ camera引く。L10)。暗 object に寄って真っ黒 blob
- **新規 library を Phase-0 spike 無しで本番投入**(決定論/seek 未実証のまま7 seg 量産)
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

- `tasks/script-spec-shared.md` — voice/schema正本
- `tasks/script-spec-A.md` — topic spec template(Libet)
- `tasks/hyperframes-video-production-flow.md` — npm script flow(`video:produce` 等)の詳細
- `data/scripts/1779639127625_survivorship-bias-is-ruining-your-decisions.json` — schema/voice reference
- **`mychannel/video/your-anxiety-is-a-threat-forecast-v1/` — 3D importmap pipeline の正本**(`design.md` = framing register/motif の書き方、`assets/lib/fx-kit.js` = bloom/noise/rough helper、`assets/lib/scene-kit.js` = `makeCameraRig`/`makeCutter`/`warmLight`/`makeFill`)
- `mychannel/video/survivorship-v2/` — caption wiring / 構造の正本
- `mychannel/video/depression-is-a-prediction-error-v1/` — 2D/SVG seg の worked example(seek-safe counter, ffmpeg concat)
- `tasks/lessons.md` L8(importmap/bloom)・L9(gsap 有限 repeat)・L10(bloom 白飛び)・L5-L7(render 直列/cwd/pipe)
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
