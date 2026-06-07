# Plan: 2チャンネル化 + reddit_for_investor 新設

> Codex plan review (tasks/review_plan.md, NEEDS REVISION) を反映した改訂版 (rev2)。

## ゴール
既存の psychology 3D チャンネル (autopilot) を維持したまま、第2チャンネル
**reddit_for_investor** を追加する。形式は「付加価値型」: Reddit の投資系人気スレッドを
LLM がキュレーション/要約/解説した**オリジナル番組**を、TTS朗読+字幕+reddit風ビジュアルで
量産する。聞き流せる投資ダイジェスト。

## 決定事項 (ユーザー確認済み 2026-06-07)
- **形式**: 付加価値型 (raw朗読でなくLLMキュレーション+解説を載せる)。
- **収集モデル (2026-06-07 改定・収益化前提で確定)**: Reddit は「**トレンド/論点の検出センサー**」
  として**軽量利用**。投稿本文・コメントは**再現しない** (事実/論点のみ抽出)。本文は **100%自作解説**。
  ビジュアルは HyperFrames で **reddit風カードを自作** (実UI/ロゴは使わない)。
  理由: Reddit User Agreement が scraping/商用利用を禁止 + 2025 Reddit が scraper を提訴中 +
  YouTube reused-content 回避 + 商標/トレードドレス回避。**スクレイピング/画面録画は不採用**。
  根拠詳細は `tasks/reddit-api-terms.md`。
- **題材**: 投資全般。subreddit を絞らず人気スレを横断収集。
- **構成**: `channels/` 集約。`mychannel`→`channels/autopilot` に git mv、
  `channels/reddit_for_investor` を新設。投稿層は `--channel` で共有。
- **綴り訂正**: 当初案 `reddit_for_invester` → 正しい英語 `reddit_for_investor` を採用
  (※ユーザー最終確認が必要。NG なら全 path 置換)。

## 推奨デフォルト (未確定・後で上書き可)
- **番組フォーマット**: テーマ別ダイジェスト (人気スレ複数本を1本=15-20分)。originality 高・聞き流し向き。
- **TTS**: Kokoro (既存 `generate-kokoro-narration.py`)。**LLM**: Claude (`@anthropic-ai/sdk`)。

## アーキテクチャ原則
**制作パイプラインは完全別、投稿パイプラインは共有。**
- autopilot = 手作り HyperFrames。reddit = data-driven テンプレ量産。
- 共有 = YouTube認証 / package-to-jobs / publish-queue / upload / set-thumbnail → `--channel` 解決。

## 目標ディレクトリ構成
```
youtube-automation-agent/
├── channels.json                  # 各ch: name/dir/youtubeChannelId/tokenFile/jobsDir/timezone/privacyDefault/publishSlot/brand
├── channels/
│   ├── autopilot/                 # = 旧 mychannel (git mv)
│   └── reddit_for_investor/
│       ├── episodes/<date>/       # threads.json → segments.json → render
│       ├── output/jobs/           # job.json + _publish-state.json
│       ├── brand/                 # brand-spec.md, thumbnail config
│       └── template/              # 量産用 HyperFrames composition (data-driven)
├── scripts/
│   ├── (upload / publish-queue / package-to-jobs / set-thumbnail)  # 共有・channel対応
│   └── reddit/  { collect.js, script.js, build-episode.js }
└── config/  { credentials.json, tokens.autopilot.json, tokens.reddit.json }  # *.json は .gitignore
```

## データ契約 (スキーマ — 後続工程との接合点)
- **threads.json (トレンドシグナル版)** `{ schemaVersion, fetchedAt, source:"reddit", items:[{ id,
  subreddit, title, permalink, author, score, numComments, createdUtc, velocity, topicTags[],
  flags:{nsfw,deleted,edited} }] }`。**selftext/comment body は保存しない** (再現しないため)。
  permalink/author/取得日時は**帰属・監査用に保持**。title はトピック判定の手掛かりとして保持。
- **segments.json** `{ schemaVersion, episodeId, title, description, tags[], thumbnailText,
  disclaimerShown:true, segments:[{ id, kind:"intro|thread|outro", narrationText, sourceRef:{threadId,permalink,author},
  display:{subreddit,score,titleCard,commentCards[]}, quoteCharCount, commentaryCharCount }] }`。
- スキーマは起動時に検証。バージョン不一致は fail-fast。

---

## Phase 0 — channel-aware インフラ refactor (最優先・autopilotを壊さない)
**成果物**: `channels/autopilot/` への移行 + `channels.json` + token/投稿層の `--channel` 対応。
1. **回帰の証拠を先に取る (golden fixture)**: 移行前に現行 autopilot で
   `npm run publish:plan`(dry-run) と `--whoami`、既存 `*.job.json` を `tasks/_golden/` に保存。
2. `git mv mychannel channels/autopilot`。
3. 全スクリプトのデフォルトパス `mychannel/...`→`channels/autopilot/...` 更新
   (`create-video-projects.js` の hardcode VIDEO_DIR 含む)。**旧パス全件検査**:
   `grep -rn "mychannel" scripts tasks utils` がコメント以外でゼロ件になるまで。
4. `channels.json` 新設。各ch: `{ name, dir, youtubeChannelId, tokenFile, jobsDir, timezone,
   privacyDefault, publishSlot }`。起動時にスキーマ検証。
5. `utils/credential-manager.js` / `utils/youtube-upload.js` を **token path + channel binding 対応**に:
   - `tokens.json` 固定 → channels.json の `tokenFile` を読む。既存 `tokens.json` を
     `config/tokens.autopilot.json` に複製 (既存稼働温存)。
   - **誤投稿ガード**: upload 前に `--whoami` の channel ID と channels.json の
     `youtubeChannelId` を照合し、不一致なら **upload 拒否** (CRITICAL safety)。
   - refresh token 失効時の再認証手順を明文化。`config/*.json` は `.gitignore` 済み確認。
6. `package-to-jobs`/`publish-queue`/`set-thumbnail`/`upload` に `--channel` 追加 (channels.json 解決)。
   `--channel` 省略時は autopilot 既定 + **deprecation 警告**を出す (移行期間限定)。
**成功条件**: 移行後 `npm run publish:plan -- --channel autopilot` の出力が golden fixture と一致。
   `--whoami` が autopilot の channel ID を返す。stale `mychannel` 参照ゼロ。
**失敗時の復旧**: git でロールバック (Phase 0 は単独 commit、混ぜない)。

## Phase 1 — Reddit collection (`scripts/reddit/collect.js`)
**事前ゲート (このPhaseのStep 0)**: Reddit API の**商用/収益化利用可否**を利用規約で確認し
`tasks/reddit-api-terms.md` に結論を記録。利用不可なら代替 (公式RSS/データ提供元) に切替える分岐を先に決める。
1. Reddit OAuth (script-type app)。`.env` に `REDDIT_CLIENT_ID/SECRET/USER_AGENT` 追加 (.env は除外済)。
2. subreddit basket (config化) を横断し top/hot 取得、score/comments/velocity でランク。
3. 上位 N スレ + 上位コメント → `episodes/<date>/threads.json` (上記スキーマ)。
**失敗モード対応**: rate limit (指数backoff)、token 失効、削除/編集済み投稿、NSFW/PII 除外、
重複排除、コメント取得部分失敗時の continue、**再実行の冪等性** (同 date は上書きでなく versioned)。
**成功条件**: スキーマ検証 pass の threads.json が生成され、除外ログが残る。

## Phase 2 — 付加価値スクリプト生成 (`scripts/reddit/script.js`) — 収益化の核
**公開ゲート (測定可能な originality 基準)**:
- **本文は100%自作解説**: 投稿/コメント文の再現を禁止 (トレンドシグナルから論点のみ使用)。
  引用が発生する場合も最小限+帰属付き、`quoteCharCount / (quote+commentary)` ≦ 閾値 (例 0.4)。
- 独自解説量: `commentaryCharCount` 下限。複数ソース利用 (1動画 ≧ N スレ)。
- 重複動画検出 (過去 episode とのタイトル/題材近接チェック)。
- **人間レビュー** (=ユーザー) を Phase 2 出力で必須化。
**金融コンテンツ safeguard**: 投資助言でない旨の **disclaimer を台本/概要欄に必須挿入**、
相場操縦的投稿・銘柄宣伝(pump)の除外、断定回避、事実は元スレに帰属。
**成果物**: `segments.json` (上記スキーマ) + title/description/tags/サムネ文言。
**成功条件**: ゲート全 pass + ユーザー台本レビュー OK。

## Phase 2.5 — 暫定ブランド (Phase 3/4/5 の入力)
チャンネル名/handle 候補・色・音声(voice)・レイアウト方針・サムネ規則の**暫定** brand-spec を確定。
正式ブランド (競合調査ベース) は Phase 6 で確定するが、render に必要な最小限を先に固定。

## Phase 3 — narration + caption
Kokoro TTS で segment毎WAV (voice は 2.5 で選定) + whisper word-timing → `words.js`。

## Phase 4 — 量産テンプレ render (最大の作り込み・単独多セッション化可)
**1つの再利用 HyperFrames composition** を segments.json で駆動 (redditカード/upvote/コメントカード)。
`build-episode.js` が tts→caption→segments→render を一括 → `full.mp4`。

## Phase 0.5 — reddit用 YouTubeチャンネル + 認証 (ユーザー作業含む / Phase 5 の前提)
- ユーザー: ブランドアカウントとして新チャンネル作成 (handle は Studio 手動)。
- OAuth フローを reddit ch 選択で実行し `config/tokens.reddit.json` + `youtubeChannelId` を取得・記録。
- channels.json の `reddit_for_investor.youtubeChannelId` を埋める (Phase 5 ガードの基準値)。

## Phase 5 — サムネ + 投稿 (段階的ゲート)
1. reddit ch 用 thumbnail config (既存 designed-thumbnail 流用)。
2. **誤チャンネル投稿防止の段階ゲート**: dry-run → channel ID 照合 (Phase 0 ガード) →
   **unlisted テスト投稿で実機確認** → 予約 (publishAt) 確認 → 本番 public。
**成功条件**: 正しいチャンネルに予約公開され、誤チャンネル投稿が構造的に不可能。

## Phase 6 — 正式ブランド/アイデンティティ
競合調査ベースで名前/handle/ビジュアル確定。brand-spec.md + thumbnail brand rules 正式化。

---

## リスク / 留意
- **誤投稿 (CRITICAL)**: 2ch同居で最大の事故。Phase 0 の channel-ID バインド + Phase 5 段階ゲートで構造的に防ぐ。
- **収益化**: inauthentic content ポリシー。出典・発効日を要確認 (現状 [invideo解説](https://invideo.io/blog/youtube-kills-ai-faceless-channels/) ベース、**YouTube公式で裏取り**)。Phase 2 の測定可能ゲートが生命線。
- **Reddit API規約**: 商用利用可否を Phase 1 ゲートで確定。
- **金融コンテンツ**: 免責・誤情報・pump 対策を Phase 2 に組込み。
- **autopilot退行**: golden fixture + 後方互換 + 単独 commit で担保。

## 進め方 (Phase 順 — Codex 提案反映)
```
Phase 0 → Phase 1(規約ゲート→収集) → Phase 2(台本+ゲート, ユーザーレビュー) →
Phase 2.5(暫定brand) → Phase 3-4(narration/render) → Phase 0.5(reddit認証) → Phase 5(投稿) → Phase 6(正式brand)
```
- 各 Phase 独立 commit/push。Phase 0 は autopilot 退行が怖いので単独完了+golden検証。
- Phase 1-2 を先に通し「台本の質」を早期にユーザーレビュー (ここが OK なら残りは機械的)。
