# investor_digest — 競合調査レポート（英語圏投資チャンネル トップ層）

**収集日:** 2026-06-07
**手法:** YouTube Data API。discovery 14 query（投資＋退職/シニア軸）＋ curated 23ch（実在トップ層）。subs≥80k フィルタで clone/discovery noise を除去 → 58ch / 約630本の人気動画を集計。
**ターゲット定義:** 英語圏（特に米国）シニア投資層（退職・配当・Social Security・Medicare・債券）。広告 CPM が高い層。
**スクリプト:** `scripts/research-investors.js`（収集）/ `scripts/analyze-investor-research.js`（集計）/ `utils/investor-domain.js`（トピック分類）
**生データ:** `data/analysis/investor-channels.json` / `investor-top-videos.json`

---

## 0. データ品質の注意（重要）

discovery が**インド系英語ファイナンスチャンネル**を多数拾った（IndiaBonds, Pushkar Raj Thakur, CA Rachana Phadke Ranade, STOCK MARKET CLASSES, Stock Learners, freefincal, Finance Boosan 等）。これらは ₹/ヒンディー語混じりで**我々のターゲット（米英シニア）ではない**。country 分布: US 43 / IN 6 / GB 3 / CA 3 / NL 1。

→ 数値の歪み: トピック需要表の「Bonds & Treasuries」median views/sub=2.247 は **IndiaBonds 単独**で大きく押し上げられている（top動画の上位を IndiaBonds が独占）。**米英シニア軸で読むときはインド系を除外して解釈すること。** 以下の結論は除外後の本物のトップ層に基づく。

---

## 1. トップ層チャンネル（subs 上位・米英ターゲットのみ抜粋）

| subs | 投稿数 | 年齢 | views/vid | 国 | チャンネル | レーン |
| --- | --- | --- | --- | --- | --- | --- |
| 5.2M | 1580 | 9.4y | 887k | US | Graham Stephan | 不動産/個人金融 |
| 3.2M | 1194 | 9.2y | 354k | US | Andrei Jikh | 配当/パッシブ |
| 2.5M | 2410 | 10.6y | 120k | US | Minority Mindset | 金融教育 |
| 1.2M | 466 | 7.4y | 364k | US | Patrick Boyle | 定量金融/解説 |
| 1.2M | 272 | 8.8y | 354k | CA | The Plain Bagel | 投資教育(CFA) |
| 1.1M | 242 | 7.7y | 210k | US | Rose Han | 個人金融 |
| 937k | 2894 | 10.4y | 52k | US | Financial Education | 個別株 |
| 759k | 2379 | 3.5y | 49k | US | **Dr. Ed Weir, PhD (Former SSA Manager)** | **Social Security** |
| 682k | 566 | 8.0y | 94k | US | Our Rich Journey | FIRE/退職 |
| 674k | 5498 | 14.8y | 37k | US | The Money Guy Show | 退職/資産形成 |
| 587k | 173 | 9.3y | 195k | CA | Ben Felix | インデックス/学術 |
| 508k | 452 | 12.7y | 94k | US | Joseph Carlson | 配当/個別株 |
| 455k | 754 | 7.0y | 102k | US | **Holy Schmidt!** | **退職/Social Security** |
| 400k | 262 | 6.1y | 132k | GB | Damien Talks Money | 個人金融 |
| 381k | 2287 | 18.6y | 36k | US | Erin Talks Money | 個人金融/退職 |
| 365k | 1962 | 14.2y | 25k | US | **Medicare School** | **Medicare** |
| 307k | 2429 | 13.4y | 60k | US | Steven Van Metre | マクロ/債券 |
| 300k | 507 | 5.8y | 52k | US | **The Retirement Nerds** | **退職/税/Medicare** |
| 298k | 805 | 14.2y | 47k | US | **Rob Berger** | 退職(元Forbes) |
| 256k | 120 | 12.0y | 199k | GB | James Shack | 退職プランニング |
| 245k | 499 | 3.8y | 13k | US | Joe Schmitz CFP | 退職 |
| 242k | 840 | 5.8y | 39k | US | **Diamond NestEgg** | **債券/Treasury/CD** |
| 217k | 865 | 6.0y | 34k | US | Benefits Insider | Social Security/給付 |
| 215k | 663 | 9.3y | 37k | GB | PensionCraft | 年金/投資 |
| 212k | 459 | 5.5y | 48k | US | Dividend Bull | 配当 |

**観察:**
- **シニア専業レーンが厚い独立クラスタ**として存在: Social Security（Dr. Ed Weir 759k, Holy Schmidt! 455k, Benefits Insider 217k, Devin Carroll）、Medicare（Medicare School 365k, Abt/Senior Savings）、Treasury/債券（Diamond NestEgg 242k, Steven Van Metre）、退職プランニング（The Retirement Nerds, Rob Berger, James Shack, Joe Schmitz）。
- このシニアレーンは **subs 200k〜760k 帯が主戦場**。汎用投資メガチャンネル（Graham 5M 級）とは別市場で、より少ない登録者でも高 views/vid を出す（例: Dr. Ed Weir は 3.5年で759k＝急成長、views/vid 49k）。
- **急成長の証拠:** Dr. Ed Weir（3.5y/759k）, The Retirement Nerds（5.8y/300k）, John's Money Adventures（3.6y/277k）, Nick Invests（1.4y/178k）。シニア金融は**今まさに伸びている**新規参入可能領域。

---

## 2. 命名パターン

| バケツ | 数 | median subs | 語数(median) | 例 |
| --- | --- | --- | --- | --- |
| abstract/evocative | 20 | 631k | 2 | Minority Mindset / Rose Han |
| personal（人名） | 10 | 377k | 2 | Graham Stephan / Andrei Jikh / Rob Berger |
| senior-benefit（Medicare/SS明示） | 8 | 264k | 6 | Medicare School / Dr. Ed Weir, Former SSA Manager |
| money/wealth | 6 | 391k | 3 | Our Rich Journey / The Money Guy Show |
| dividend | 6 | 149k | 2 | Dividendology / Dividend Bull / Dividend Data |
| retire | 3 | 300k | 3 | The Retirement Nerds / Rent To Retirement |
| finance | 2 | 785k | 2 | Financial Education |

語数分布: 2語=21ch（最多）、3語=13、1語=6。**短い名前（1-3語）が圧倒的多数。**

**結論:**
- **2パターンが有効。** ①人名ブランド（Graham Stephan 型）= 顔出し前提なので**匿名量産の我々には不可**。②**abstract/evocative 短名**（Minority Mindset, Rose Han, Our Rich Journey）= median 631k で最強かつ匿名運用可。我々はこちら。
- **senior-benefit 明示名**（Medicare School, "Former SSA Manager"）は median 264k と中位だが、**検索流入と信頼（権威付け）に強い**。語数は長め（6語）。トレードオフ: ブランド拡張性は低いが「この人/局は Social Security の専門家」と即伝わる。
- 配当専業名（Dividend〜）は median 149k と最も低い＝**コモディティ飽和**。「Dividend」を冠に置くのは避ける。

---

## 3. About 文 / キーワード

- subs>50k の 56ch 中、**About 空欄ゼロ**。median 812 文字。トップ層は全員 About をしっかり書く。
- 定型: ①自己紹介＋権威付け（"hedge fund manager", "CFA charterholder", "Former Social Security Manager"）→ ②何を扱うか → ③連絡先 → ④**免責（DISCLAIMER: education only, not financial advice）**。
- キーワード欄はほぼ全員 max（~500字）まで埋める。SEO 全振り。
- **示唆:** investor_digest も About に「権威の代わりに『公的データ（SEC/FRED/SSA/Treasury）に基づく』というデータ駆動の信頼軸」＋必須の投資助言免責を置く。匿名でも「一次ソース準拠」で信頼を作れる。

---

## 4. タイトル定型（views/sub 正規化 = 登録者比の刺さり）

| 定型 | 数 | median views | median views/sub | 例 |
| --- | --- | --- | --- | --- |
| Best / Top… | 14 | 261k | **1.082** | The Best Medicare Supplement Plans in 2024-2025 |
| Number listicle / $数字 | 58 | 264k | **1.062** | 5 Things Medicare Doesn't Cover |
| Why [topic] | 12 | 193k | 1.048 | （インド系trading混入あり） |
| Question | 51 | 266k | 0.942 | Retirees Spend 80% of Income in These 5 Areas? |
| How to / How much | 54 | 195k | 0.855 | How To Make $5000/month with Only $25/week |
| Imperative / 警告 | 24 | 333k | 0.757 | What If You Invest 100k in BEST 5 Fidelity Funds |
| Retirement/benefit 文 | 70 | 99k | 0.638 | Retire To A Hotel - Low Cost Retirement Housing |
| Why you/we/I | 14 | 163k | 0.594 | 最下位 |

**結論:**
- **最強は「Best/Top + 具体年」と「数字リスト/$金額」。** どちらも median views/sub > 1.0。シニア層は「具体的で実用的・今年の最新」を強く好む。
- **"5 Things Medicare Doesn't Cover" 型（数字×固有給付×落とし穴）が黄金。** "Best Medicare Supplement Plans 2024-2025"（年号入り）も同様。
- 心理学チャンネルと逆: 汎用 "Why you…" は**ここでも最下位**（0.594）。抽象問いかけより**具体的な金額・年・固有制度名**が勝つ。
- 警告/命令形（"Avoid these HUGE Medicare mistakes", "Stop doing X")は views 絶対値が高い（median 333k）＝クリック誘発が強い。

---

## 5. トピック需要（views/sub・米英シニア軸で解釈）

| トピック | 数 | median views | median views/sub | 備考 |
| --- | --- | --- | --- | --- |
| Bonds & Treasuries | 17 | 499k | 2.247 | ※IndiaBonds で過大。**米国分（Diamond NestEgg/Steven Van Metre）でも依然強い** |
| Medicare & Healthcare | 32 | 247k | **1.332** | 純シニア・高CPM。落とし穴/プラン比較が刺さる |
| Retirement Planning | 83 | 203k | **1.309** | **最大ボリューム(83本)かつ高 views/sub**。本丸 |
| Financial Freedom & FIRE | 35 | 163k | 1.274 | HSA/早期退職 |
| Index Funds & ETFs | 47 | 240k | 0.887 | "100k を5本に" 型 |
| Taxes & Estate | 23 | 185k | 0.861 | 税法改正×シニア が刺さる |
| Dividend Investing | 70 | 107k | 0.719 | 量は多いが views/sub 中位＝**供給過多気味** |
| Social Security | 38 | 136k | 0.627 | 量多・絶対 views 安定。COLA/制度変更ネタ |
| Stock Market Basics | 88 | 140k | 0.569 | 初心者向け飽和 |
| Inflation & Economy | 11 | 241k | 0.407 | 絶対 views 高いが本数少 |
| Real Estate & Passive Income | 15 | 34k | 0.051 | 弱い |

**白地（white space）= 需要高×供給/飽和度のバランス:**
1. **Retirement Planning が本丸** — 最多本数かつ高 views/sub。需要が太く安定。
2. **Medicare が高CPM×高resonance の宝庫** — 32本で median views/sub 1.33。"何がカバーされないか/プラン比較/今年の変更" が鉄板。一次ソース（CMS/SSA）で 100% 自作解説可能＝我々のモデルと完全適合。
3. **Treasury/債券（Diamond NestEgg レーン）** — 米国分でも強い。T-bill/I-bond/CD ladder/利回り。FRED + Treasury 一次データで作れる＝**ソース確定スタックと直結**。
4. **Taxes & Estate（税法改正×シニア）** — "新税法があなたの税額にどう効くか" が高 views。IRS/議会データ準拠で作れる。
- **避ける/差別化必須:** Dividend と Stock Market Basics は本数最多級だが views/sub 中位＝コモディティ飽和。配当を主軸に据えると埋もれる。

---

## 6. 尺

top動画 630本: shorts(≤60s) 64 / 1-5分 39 / **5-12分 105 / 12-30分 318（最多）** / 30分超 104。**median ≈ 16.4分。**

**結論:** シニア金融は**12-30分のロングフォームが主流**（心理学チャンネルの 11.5分より長い）。腰を据えた解説が好まれる。我々の自作カードUI解説は **10-18分**を狙うと主流帯に乗る。shorts は別軸で discovery 用に併用可。

---

## 7. 採用結論（investor_digest への落とし込み）

1. **ポジショニング = 米英シニア×「退職・Medicare・Treasury/債券・税」の一次データ駆動解説。** 配当/初心者株は飽和なので主軸にしない（補助トピック止まり）。
2. **命名 = abstract/evocative 短名（1-3語、匿名運用可）。** "Dividend" 冠は避ける。権威は名前でなく「公的データ準拠」で作る。公開ブランド名は Phase 6 で本レポート基に確定。
3. **タイトル = 「数字 × 固有制度名 × 落とし穴/今年」型。** 例: "5 Things Medicare Won't Cover in 2026", "The Best Treasury Ladder for Retirees Right Now"。汎用 "Why you" は禁止。
4. **トピック優先度: ①Retirement Planning（本丸・量） ②Medicare（高CPM×resonance） ③Treasury/債券（ソース直結） ④税法×シニア。** 全て公的一次ソース（SSA/CMS/FRED/Treasury/IRS）で 100% 自作解説でき、確定ソーススタックと完全一致。
5. **尺 = 10-18分ロングフォーム**（主流帯 12-30分の下限〜中位）。shorts は discovery 補助。
6. **About に投資助言免責＋「一次公的データ準拠」の信頼軸を明記。** キーワード欄も SEO 全埋め。
7. **市場タイミング良好:** シニア金融レーンは 3-6年で 200k-760k に伸びた新興急成長クラスタ。匿名×データ駆動×高頻度量産で参入余地あり。

---

## 関連
- データソース戦略は `tasks/plan.md`（SSA/FRED/EDGAR/Treasury が本レポートの優先トピックと一致）。
- 心理学チャンネル（autopilot）調査: `channels/autopilot/research/competitive-research.md`。
