# Reddit Data API — 規約ゲート結論（Phase 1 Step 0）

> 調査日: 2026-06-07。本プロジェクト（reddit_for_investor: 投資系人気スレを LLM で
> キュレーション/要約/解説した付加価値型 YouTube ダイジェスト）が Reddit Data API を
> 利用してよいかの判断記録。`tasks/plan.md` Phase 1 の事前ゲート。
>
> 注意: Reddit 公式ドメイン（redditinc.com / support.reddithelp.com）は自動 fetch が
> 403/ブロックされるため、本記録は **第三者報道 + 公開要約ベース**。確定値は
> 必ず https://www.reddit.com/prefs/apps と開発者ダッシュボード、
> および https://www.redditinc.com/policies/data-api-terms（手動閲覧）で裏取りすること。

## 結論: **条件付き OK（CONDITIONAL）**

開発・検証フェーズ（非収益化での疎通確認・台本品質レビュー）は **free tier で進めてよい**。
ただし以下の条件を満たすこと。**チャンネルを収益化してスケールさせる前に再ゲート**する。

## 確認した現行ルール（2025 改定後）

| 項目 | 内容 | 本プロジェクトへの影響 |
|---|---|---|
| **OAuth 必須** | 匿名アクセス不可。全リクエストが OAuth 2.0 経由。token 有効期限 ≈ 1時間 | auth.js を application-only OAuth で実装（採用済） |
| **free tier レート** | 非商用は **100 QPM / OAuth client ID**（第三者報道値） | ダイジェスト量産には十分。collect は QPM 内に収める |
| **app 事前承認** | 2025 "Responsible Builder Policy" により、**個人プロジェクトでも事前承認が必要**との報道 | ユーザーが script app 作成時に承認フローを通す必要あり |
| **商用利用** | 公開レートカードなし。enterprise sales へ問い合わせ → use case review → 個別見積。**ビジネス用途は有料** | ⚠️ 収益化 YouTube は「商用」と判断され得る → スケール前に要確認 |
| **AI 学習禁止** | Reddit データで ML/AI モデルを**学習**することは明示的に禁止（同意なき限り） | 本件は LLM の**推論/要約**であり学習ではない。モデル学習には一切使わない（遵守） |
| **帰属** | 元コンテンツの権利はユーザーに帰属。再配布は要注意 | threads.json/segments.json に source URL・author・取得日時を必須化済（plan のスキーマ） |

## 本プロジェクトが守る条件（CONDITIONS）

1. **app 事前承認**: ユーザーが reddit.com/prefs/apps で script app を作成し、求められれば
   Responsible Builder の承認フローを通す。
2. **non-commercial の範囲で開発**: 疎通確認〜台本品質レビューまでは free tier（100 QPM 以内）。
3. **AI 学習に使わない**: 取得データは LLM の推論（要約/解説生成）にのみ使用。モデル学習・
   データセット販売・再配布は行わない。
4. **付加価値 + 帰属**: raw 転載でなく LLM 解説を主体化（plan Phase 2 の originality ゲート）。
   各スレの permalink/author を動画・概要欄に帰属表示。
5. **YouTube 側 reused-content 対策**: 元コメント/教育的価値を必ず付与（YouTube の
   reused content ポリシー回避。plan Phase 2 と整合）。

## ⚠️ 再ゲート（収益化スケール前に必須）

YouTube チャンネルを**収益化**すると、Reddit が API 利用を「商用」とみなす可能性がある。
本格運用（収益化 + 量産）に入る前に、以下のいずれかを確定すること:
- (a) Reddit の商用/enterprise tier 契約の要否を sales 問い合わせで確認、または
- (b) 商用条件が折り合わない場合、**代替ソースに切替**（公式 RSS、Pushshift 後継、
  データ提供ベンダー等）。plan Phase 1 Step 0 の「利用不可なら代替へ切替える分岐」に該当。

## 判断

→ **auth 準備（auth.js / probe.js / .env）の実装に進んでよい**。
   ただし上記「再ゲート」を収益化前のチェックポイントとして plan に残す。

## 出典（第三者・要公式裏取り）
- ReplyDaddy: Reddit 2025 API pre-approval crackdown（個人プロジェクトも承認必須）
  https://replydaddy.com/blog/reddit-api-pre-approval-2025-personal-projects-crackdown
- Data365: Reddit API limits / pricing（100 QPM・OAuth・enterprise 見積）
  https://data365.co/blog/reddit-api-limits , https://data365.co/blog/reddit-api-pricing
- PainOnSocial: Reddit API rate limits 2026 guide
  https://painonsocial.com/blog/reddit-api-rate-limits-guide
- 公式（手動裏取り用）: https://www.redditinc.com/policies/data-api-terms
