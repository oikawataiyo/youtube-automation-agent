# Plan: 描画工程の岡田式統合 + depression動画の作り直し（改訂版 v2）

## 背景 / root cause
- `mychannel/video/` の簡易動画13本は、codexが**全て同一の汎用index.html template**（CSS byte一致・意味のない折れ線グラフ・particle同seed）に台本テキストを流し込んだだけ。台本ごとの `visual_note`（散文の描画意図）が違うのに描画が全部同じ。
- 正解形は `survivorship-v2`: seg毎bespoke composition（bomber blueprint / 弾痕の赤dot / clean-area glow = 内容の意味を符号化）。
- root cause: **台本生成とHTML生成を別contextに分けた**こと。HTML工程が `visual_note` と `mychannel/visual-methodology/`（岡田式playbook）を無視した。

## 分業方針（user確定・改訂）
- **Claude（高価値・委譲不可）**: 台本spec → 描画設計 → bespoke HTML composition + render/concat の background実行。「HTMLさえ決まれば失敗しようがない」工程。render/concatは推論ゼロの単一commandなので `run_in_background` で叩くだけ（token消費ほぼ無し）。
- **codex（機械的・委譲可）**: 台本本文生成（Phase 3）**のみ**。1700語の推論を Claude context 外で消費させるのが旨味。
- **render/concatをcodexに委譲しない理由**: 推論ゼロの単一commandでtoken節約にならず、hang/sandbox-bypassのriskだけ増える。当初「codex=render+concat（将来委譲）」だったが、この session でClaude background実行に確定。

## スコープ宣言（codex review反映: 範囲過大対策）
本計画は**複数セッションに分割**する。各Stageは独立して中断・再開可能で、それぞれ完了判定を持つ。1セッションで全Stage完了を前提にしない。順序は **Stage 0 → Stage 1(縦切り) → Stage 2(横展開) → Stage 3(skill化)**。Part 1(skill改修)はStage 1-2の実体を元に書く（実例駆動）。

---

## Stage 0 — 依存ツール検証ゲート（必須・最初に1回）
以下を確認し、欠けていれば**STOPしてユーザー報告**（mock進行禁止）。
1. hyperframes CLI: `cd mychannel/video/survivorship-v2 && npx --yes hyperframes@0.6.63 --version`
2. render疎通: survivorship-v2 が既に `renders/*.mp4` を持つ（=過去に成功）。`npm run check` が通るか確認。
3. ffmpeg: `ffmpeg -version`（concatに必須）
4. TTS方式の特定: `survivorship-v2/assets/narration/` の wav生成手順を確認（`_transcribe.py` はwhisper transcribe用。TTS本体の生成コマンドを `AGENTS.md`/`production-notes.md` から特定）。不明なら**ユーザーにTTS生成手順を確認**。
5. whisper: `_transcribe.py` の実行依存（python + whisper）を確認。

**完了判定**: 1-5全て✓、またはTTS手順をユーザーから取得。欠落時は代替（手動wav配置等）をユーザーと合意してから次へ。

---

## Stage 1 — depression 縦切り（seg-00 hook のみ・基準固め）

source台本は良質（`data/scripts/1779800000002_depression-is-a-prediction-error.json`、`visual_note`が既に岡田式）。codex版HTML/renderのみ作り直し。

### 1-1. codex版の退避（削除でなくarchive: 誤削除対策）
- 退避元: `mychannel/video/depression-is-a-prediction-error-v1/`（git未追跡）
- 退避先: `mychannel/video/_archive/depression-is-a-prediction-error-v1-codex/`（`git mv`不可なので通常move）
- **保持**: `data/scripts/1779800000002_*.json|.md`（source、触らない）。退避フォルダ内 `meta.json` から `sourceScript`/`topic`/`title`/`estimatedDurationSeconds` を新projectへ転記。
- 復旧: 問題時は退避先を元パスへ戻すだけ。

### 1-2. project scaffold
- 新規 `mychannel/video/depression-is-a-prediction-error-v1/` を survivorship-v2 構造で作成:
  `package.json`(hyperframes@0.6.63), `meta.json`(退避元の値転記), `hyperframes.json`, `assets/narration/`, `compositions/`, `CLAUDE.md`(survivorshipの規約コピー)
- `design.md` 作成: palette(灰dawn `#0a0c10` 系 → 回復で淡blueへ1段階grade)、type stack、motion grammar、per-scene visual register。

### 1-3. seg-00 hook composition（`index.html` = root timeline）
- `visual_note`: 灰の夜明けの枕元、暗い未読phone、半分の水（rimに淡highlight）、duvetの丘。
- 描画核: 「予測を拒む脳」の静止。SVG/DOMで枕元small still + kinetic title。汎用折れ線グラフ禁止。
- hyperframes規約: 全timed要素 `data-start/duration/track-index` + `class="clip"`、`window.__timelines["main"]` paused登録、非決定論禁止（mulberry32 seed固定）。`/hyperframes` `/gsap` skill参照。

### 1-4. seg-00 音声 + caption
- TTS: hook narration（`script.hook.text`）を Stage 0 で確定したTTS手順でwav化 → `assets/narration/seg-00-hook.wav`
- whisper: `seg-00-words.js`（word timing）生成
- wiring: `<audio data-track-index>` + caption phrase（active wordはmarker emphasis、survivorship `#caps` 方式踏襲）
- **TTS失敗時**: 1回再試行→なお失敗ならユーザーに報告し手動wav配置に切替（無音mp4で進めない）。

### 1-5. seg-00 render + 検証
- `npm run check`（対象dir = `mychannel/video/depression-is-a-prediction-error-v1`）error 0
- `npm run dev`(background) → preview snapshot を hook区間の 3時刻（0.5s/中間/終端）で取得
- seg-00 render → `renders/seg-00-hook.mp4`（音声込み）
- screenshotをユーザー共有 → **基準承認を得る**（ここで一旦停止）

### Stage 1 受け入れ条件（測定可能）
- [ ] `index.html` が存在し汎用template由来でない（CSSがcontempt系13本とbyte非一致、折れ線グラフ`.trace`不在）
- [ ] `npm run check` error 0（warningはレビューのみ）
- [ ] `renders/seg-00-hook.mp4` 生成、再生で音声あり・captionがnarrationと一致
- [ ] caption phrase onset が word timing と ±150ms 以内
- [ ] preview snapshot 3枚で要素重なり無し・判読可能

---

## Stage 2 — depression 横展開（seg-01..outro）
Stage 1承認後。各segを `compositions/seg-NN.html` で実装。

### segment → 描画motif（`visual_note`準拠、duration は script値）
| seg | heading | dur | 描画核 |
|---|---|---|---|
| 01 | The Map We Got Wrong | ~100s | SEROTONIN脳poster → **剥がすと**予測符号化の式（反転=原則1） |
| 02 | The Predictive Brain Theory | ~105s | whiteboard: 青の予測曲線 vs 黒の実測flat、開くgapを赤markerで囲む |
| 03 | The Body That Won't Stop Burning | ~100s | 赤血球→vagus神経→basal gangliaのdopamine pulse amber→flicker減衰 |
| 04 | Why "Just Be Positive" Backfires | ~100s | 鏡の廊下、affirmationを唱えるほど予測自己評価値が下がる |
| 05 | What Actually Reaches The Circuit | ~110s | 朝食卓のWALK/CALL/MAKE BED check list、窓外gray→淡blue 1段階 |
| outro | | (script.outro) | reframeの一言で閉じる。反復motif再登場 |

- 各seg: 固定hold>15s禁止、反復motif有り、1 gear-change/seg、PRINCIPLES原則2遵守。
- 各seg完了ごとに `npm run check` → seg render → 逐次commit（`feat: depression seg-NN composition`）。
- 全seg後: ffmpeg concat（`renders/concat.txt`）→ `renders/depression-is-a-prediction-error-v1-full.mp4`

### Stage 2 受け入れ条件
- [ ] composition 6本（seg-01..05 + outro）+ index.html(hook) = 計7 seg
- [ ] 7 seg全て描画核が相異なる（同一motif使い回し無し）
- [ ] `npm run check` error 0、full mp4 が script総尺(~624s)±10%
- [ ] 主要時刻snapshotで判読性OK、screenshotユーザー共有

---

## Stage 3 — Skill改修（実例駆動）
Stage 1-2の実体を元に `.claude/skills/psychology-script-batch/SKILL.md` を改修。

- **Phase 2(spec)強化**: 各sectionに「描画設計block」必須化（PLAYBOOK axis技法1つ + 反復motif + 画面に置く具象物 + gear-change位置）。
- **新Phase 描画設計&build**: scaffold手順、design.md雛形、seg毎bespoke composition（`visual_note`→SVG/DOM+GSAP翻訳、visual-methodology参照）、`npm run check`。Stage 1-2で確定した手順をそのまま文書化。
- **新Phase 音声+captions**: Stage 0で確定したTTS手順 + whisper words.js + caption wiring。
- **新Phase render**: seg毎render→concat。**Claudeが `run_in_background` で叩く機械工程**として手順固定（codex委譲しない）。
- **原則/anti-pattern明記**: 「完成台本を文脈なしtemplate-fillerに渡さない」「全動画同一CSS/同一seed/汎用図版=禁止」。分業表（Claude=設計〜HTML + render/concat background / codex=Phase 3台本生成のみ）。
- **check gate明記**: 最終確認は `npm run check`（lint && validate && inspect）。長尺で inspect timeout 時のみ lint+validate 直叩き+frame QA で代替。

### Stage 3 受け入れ条件
- [x] SKILL.mdに描画〜render工程が追記され、Stage 1-2の実コマンドと一致
- [x] anti-pattern節にtemplate-filler禁止が明記
- [x] 分業表が新方針（codex=台本生成のみ / render=Claude background）と一致
- [x] check gate（`npm run check` + inspect timeout fallback）を明記

> **Stage 3 status: 完了**（SKILL.md を 10-phase pipeline に改修済み。残るは codex impl review の APPROVED 確認 + commit/push）。

---

## カタカナ禁止の適用範囲（codex review反映）
対象: `design.md`/コード comment/`SKILL.md` 等の**日本語散文**。英語由来術語は英単語のまま（例: render, composition）。画面内英語表示テキスト・caption(英語narration)・台本英文は対象外（元々英語）。

## リスク
- bespoke composition 7本は重い → Stage 2でseg単位check+commitで分割消化。
- TTS/whisper toolchain再現性 → Stage 0で実証、欠落時はユーザー合意の代替手順。
- render負荷大 → seg毎render分割。
- 誤削除 → 削除でなくarchive退避（1-1）。

## 進め方
1. この改訂版v2をユーザー承認（**停止して待つ**）。
2. 承認後 Stage 0 → 1 → （基準承認）→ 2 → 3 の順。各Stage完了で報告。
