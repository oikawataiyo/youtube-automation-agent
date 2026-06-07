# Plan: investor_digest チャンネル（英語圏シニア投資・高CPM / 非Reddit・トレンドセンサー型）

> 旧 rev2（Reddit 前提）を**全面改訂**。Reddit Data API は 2025-11-11 にセルフサービス廃止＋
> Responsible Builder 手動承認（2〜4週間・商用却下リスク）化したため**完全離脱**（判断記録:
> `tasks/reddit-api-terms.md`、教訓: `tasks/lessons.md` L11）。価値の核「トレンド検出＋100%自作解説＋
> 自作ビジュアル」は信号源に依存しないので、**承認待ちゼロ・商用OKの非Redditソース**に置き換える。

## ゴール
第2チャンネル **investor_digest**（公開ブランド名は Phase 6 で確定・内部 slug は暫定）を新設。
形式 = **英語圏の高齢投資層**向け「聞き流せる投資ダイジェスト」。複数の公開トレンドソースから
「今ホットな投資テーマ」を検出し、**LLM が100%自作の解説**を載せ、TTS朗読＋字幕＋**自作の
ファイナンス系カードUI**（実サービスのUI/ロゴは使わない）で量産する。

## ターゲットと題材（高CPM 最適化）
- 層: **英語圏シニア**（広告単価が高い）。
- 高CPM テーマ: 配当/インカム・退職(401k/IRA/Roth)・Social Security(COLA)・Medicare・年金(annuity)・
  相続/estate・税・債券/Treasury・インフレ対策(金)・優良株・資産防衛・RMD。
- 編集トーン: 落ち着いた・明快・煽らない。文字大きめ/読みやすい配色（シニア配慮）。

## 確定ソーススタック（アクセスゲート＋商用可否を検証済み / 各コネクタ実装前に再確認＝Phase 1 Step 0）

### 核①: 権威ある事実・カタリスト（public-domain＝無料・再利用自由・最安全）★最優先
| ソース | 用途 | 状態 |
|---|---|---|
| **SEC EDGAR API** (data.sec.gov) | 開示・8-K・Form4(内部者売買) | 公式無料・public domain（fair-access 10 req/s） |
| **FRED** (St. Louis Fed) | 金利・CPI・国債利回り・マネー | 無料APIキー・public domain（一部系列は元データ権利あり→系列単位で確認） |
| **U.S. Treasury** (fiscaldata) / **BLS** | 利回り・I-bond・CPI/雇用 | 無料・public domain |
| **SSA.gov / Medicare.gov** | **COLA・Medicare 保険料改定** | 無料・public domain（シニア×高CPMの鉄板） |

### 核②: ニュース velocity / トピック検出（承認待ちゼロ・商用OK）
| ソース | 用途 | 状態 |
|---|---|---|
| **APITube News API** | 多ソースのニュース量・NLP（sentiment/entity）でトピック velocity | 無料枠で**商用OK**(30req/30min)。著作権物の再公開禁止＝**信号＋自作解説**で使用。登録時に commercial 対応プランを選択 |
| **編集RSS**（Kiplinger / Bogleheads / Morningstar / Seeking Alpha / MarketWatch / Reuters / CNBC / Yahoo Finance） | シニア向けトピックレーダー＋見出し velocity（見出し=事実） | 無料 RSS。本文転載せず話題抽出のみ |

### エンハンサー（任意・依存しない）
| ソース | 用途 | 状態 |
|---|---|---|
| **Google Trends 公式API (alpha)** | 検索 interest velocity | **alpha=テスター限定** → 申請のみ。**核に組み込まず**、許可が出たら足す（pytrends は ToS グレーで商用不可、不採用） |
| 株価/mover API（FMP / Finnhub 等） | 数値の裏取り | 多くは**商用=有料**。当面 EDGAR/FRED で代替、必要回のみ後で有料tier |

**除外**: Reddit（承認制）、StockTwits（新規登録停止中）、NewsAPI.org 無料（非商用のみ）、yfinance（ToS グレー）。

## アーキテクチャ原則（autopilot から不変）
**制作パイプラインは完全別、投稿パイプラインは共有（`--channel` 解決）。**
- 投稿層（package-to-jobs / publish-queue / upload / set-thumbnail）は Phase 0 で channel 対応済み・流用。
- 収集は **source-agnostic**: 各ソースを共通 interface のコネクタにし、正規化 signals に集約。

## 目標ディレクトリ構成
```
youtube-automation-agent/
├── channels.json                       # reddit_for_investor → investor_digest にリネーム
├── channels/
│   ├── autopilot/                      # 既存・不変
│   └── investor_digest/                # = 旧 reddit_for_investor (git mv)
│       ├── episodes/<date>/            # signals.json → segments.json → render
│       ├── output/jobs/                # job.json + _publish-state.json
│       ├── brand/                      # brand-spec.md, thumbnail config
│       └── template/                   # 量産用 HyperFrames composition (自作カードUI)
├── scripts/
│   ├── (upload / publish-queue / package-to-jobs / set-thumbnail)  # 共有・channel対応
│   └── sources/                        # ← 旧 scripts/reddit を置換
│       ├── index.js                    # コネクタ登録 + 集約 runner
│       ├── connector.js                # 共通 interface 定義
│       ├── edgar.js / fred.js / ssa.js / apitube.js / rss.js
│       └── collect.js                  # 全コネクタ実行 → episodes/<date>/signals.json
└── config/  { credentials.json, tokens.autopilot.json, tokens.investor.json, .env }
```

## データ契約（スキーマ）
- **signals.json**（旧 threads.json を置換・トレンドシグナル版）
  `{ schemaVersion, fetchedAt, sources:[{name,ok,fetched,excluded}], items:[{ id, source,
  kind:"filing|macro|news|forum-headline", topic, tickers[], title, url, publishedAt,
  signalStrength, sourceRef:{provider, permalink, author?}, evidence:[{label,value}] }] }`。
  **本文/記事全文は保存しない**（事実・見出し・数値のみ）。url/provider/取得日時は帰属・監査用に必須。
- **segments.json**（既存方針踏襲）
  `{ schemaVersion, episodeId, title, description, tags[], thumbnailText, disclaimerShown:true,
  segments:[{ id, kind:"intro|topic|outro", narrationText(=100%自作),
  sourceRefs:[{provider,url}], display:{titleCard, dataCards[]},
  commentaryCharCount, quoteCharCount }] }`。
- スキーマは起動時検証・バージョン不一致は fail-fast。

---

## Phase 0 — channel-aware インフラ（**完了済み**, commit 7337bbe）
移行・channels.json・誤投稿ガード（assertChannel）・`--channel` 対応は実装済み。本 plan では不変。

## Phase R — Reddit 痕跡の cleanup ＆ リネーム（最初に実施・autopilot に触れない）
1. `scripts/reddit/auth.js` `scripts/reddit/probe.js` 削除（dead code）。`scripts/sources/` を新設。
2. `.env.example` の `REDDIT_*` ブロック削除。`package.json` の `reddit:probe` 削除。
3. channel リネーム `reddit_for_investor` → **`investor_digest`**（暫定・要ユーザー最終確認）:
   - `git mv channels/reddit_for_investor channels/investor_digest`
   - `channels.json` の key / dir / jobsDir / brand path / tokenFile(`tokens.investor.json`) 更新。
   - 非コメントの `reddit_for_investor` 参照ゼロを `grep` で確認。
4. `tasks/reddit-api-terms.md` は**離脱の判断記録として保持**（消さない）。
**成功条件**: stale な `reddit`/`reddit_for_investor` 参照ゼロ。autopilot の publish:plan が無回帰。単独 commit。

## Phase 1 — ソースコネクタ（source-agnostic 収集）
**Step 0（ゲート・教訓 L11）**: 各ソースの **規約（商用/再配布）＋アクセス（key 即発行か）** を
着手直前に確認し `tasks/sources-terms.md` に記録。NG なら当該コネクタを外す/差し替える。
1. 共通 interface `connector.js`: `fetch() → 正規化 items[]`（kind/topic/tickers/url/signalStrength/sourceRef）。
2. コネクタ実装（依存の薄い順）: `edgar.js`(public domain) → `fred.js` → `ssa.js` →
   `rss.js`(複数 feed) → `apitube.js`(要 API key・商用枠)。Google Trends は許可後に追加。
3. `collect.js`: 全コネクタ実行 → 重複排除 → signalStrength でランク → `episodes/<date>/signals.json`。
**失敗モード対応**: rate limit(指数backoff)、key 失効、部分失敗時 continue、再実行の冪等性
（同 date は versioned）、PII/不適切除外、除外ログ保持。
**成功条件**: スキーマ検証 pass の signals.json が複数ソースから生成され、各ソース ok/excluded ログが残る。

## Phase 2 — 100%自作スクリプト生成（収益化の核）
**公開ゲート（測定可能な originality）**: 本文は完全自作（記事/投稿文を再現しない）。引用が出る場合は
最小限＋帰属、`quoteCharCount/(quote+commentary) ≦ 0.4`。`commentaryCharCount` 下限。複数ソース利用。
過去 episode との題材近接チェック。**人間レビュー（ユーザー）必須**。
**金融 safeguard**: 「投資助言でない」**disclaimer を台本＋概要欄に必須**、断定回避、pump/煽り除外、
数値は public-domain ソースに帰属（EDGAR/FRED/SSA）。
**成果物**: `segments.json` + title/description/tags/サムネ文言（シニア向けトーン）。
**成功条件**: ゲート全 pass ＋ ユーザー台本レビュー OK。

## Phase 2.5 — 暫定ブランド（render 入力の最小固定）
voice（落ち着いた英語ナレーション）・配色（高コントラスト・大きめ文字）・**自作カードUI レイアウト**
（ニュース/データ/ティッカーのカード＝自前資産、実サービスUI不使用）・サムネ規則の暫定 spec を確定。

## Phase 3 — narration + caption
Kokoro TTS で segment 毎 WAV（voice は 2.5 で選定）＋ whisper word-timing → `words.js`。

## Phase 4 — 量産テンプレ render（最大の作り込み・多セッション化可）
**1つの再利用 HyperFrames composition** を segments.json で駆動（自作のファイナンスカード/データ可視化/
ティッカー帯）。`build-episode.js` が tts→caption→segments→render を一括 → `full.mp4`。

## Phase 0.5 — investor_digest 用 YouTube チャンネル + 認証（ユーザー作業含む）
新チャンネル作成（handle は Studio 手動）→ OAuth を当 channel で実行 → `config/tokens.investor.json`＋
`youtubeChannelId` 取得 → `channels.json` の `investor_digest.youtubeChannelId` を埋める（Phase 5 ガード基準値）。

## Phase 5 — サムネ + 投稿（段階ゲート）
designed-thumbnail 流用 → dry-run → channel ID 照合（Phase 0 ガード）→ **unlisted 実機確認** →
予約(publishAt) → public。**誤チャンネル投稿が構造的に不可能**であること。

## Phase 6 — 正式ブランド/アイデンティティ
競合調査ベースで名前/handle/ビジュアル確定（[[channel_design_research_first]] の方針）。brand-spec 正式化。

---

## リスク / 留意
- **ソース規約 (各個)**: 商用/再配布可否はソース毎に異なる → Phase 1 Step 0 で着手直前に確認（教訓 L11）。
- **アクセスゲート再発**: Google Trends alpha は許可制 → 核に入れず任意。新ソース追加時も「今 key を取れるか」を先に確認。
- **商用データ API コスト**: 株価系は scale 時に有料化判断（当面 public-domain で代替）。
- **YouTube reused-content**: 100%自作解説＋自作ビジュアルで構造的に回避（収益化の生命線）。
- **金融コンテンツ**: 免責・誤情報・pump 対策を Phase 2 に組込み。事実は政府ソースに帰属。
- **autopilot 退行**: Phase R/全 Phase で autopilot に触れない・単独 commit・grep 検証。

## 進め方
```
Phase 0(済) → Phase R(cleanup/rename) → Phase 1(規約ゲート→多源収集) →
Phase 2(自作台本+ゲート, ユーザーレビュー) → Phase 2.5(暫定brand) →
Phase 3-4(narration/render) → Phase 0.5(認証) → Phase 5(投稿) → Phase 6(正式brand)
```
- 各 Phase 独立 commit/push。Phase 1-2 を先に通し「台本の質」を早期にユーザーレビュー。
