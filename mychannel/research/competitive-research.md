# 競合心理学チャンネル 客観調査レポート

> **⚠️ 読む順番:** 下に **§v2「focused redo（2026-06-05）」が最新・最も信頼できる**。v2 は登録者≥80kフィルタ＋mental-health/neuroscience に的を絞った再調査で、本家 Einzelgänger・Huberman・Academy of Ideas・Heidi Priebe 等の **本物の上位群**を含む。**§v2 が v1 の一部結論を訂正する**（attachment 飽和説 / personality 強説 / "The psychology of" 弱説 など）。下の §0〜§7 は v1（85ch・量産群混在）で、市場の commodity ゾーンを把握する資料として残す。

---

# v1（初回・全体俯瞰、85ch 量産群混在）

**目的:** 自チャンネルの公開ブランド（名前・About文・サムネ・スタンス・題材）を決める前に、「実際に何が再生されているか」を YouTube Data API の実データで客観把握する。
**収集日:** 2026-06-04 ／ **対象:** 85チャンネル（既知ベンチマーク + `search.list` discovery）、うち subs>1k の 38ch を主分析。各chの再生数上位最大12本（計 ~900本）。
**生データ:** `data/analysis/competitor-channels.json`, `data/analysis/competitor-top-videos.json`
**指標の注記:** 規模差を消すため動画は **views/sub（再生数÷登録者数）= 登録者規模に対しどれだけ伸びたか** で正規化。絶対 views も併記。相関は因果ではない（大手は AI-clone 量産期より前から存在）点は明記する。

---

## 0. 一行結論

データは一貫して **「commodity 群（量産 AI チャンネル）と prestige 群（大手エッセイ/教育）が、名前・サムネ・題材で明確に分かれている」** ことを示す。
量産群の型（"Psychology Explained" 系の説明的な名前 / 2D ゆるキャラ + 黄色文字サムネ / "Why you 〜" 汎用タイトル / 恋愛-attachment 題材）は **登録者中央値 3万前後で頭打ち**。
スケールしている群（School of Life, Pursuit of Wonder, Sisyphus 55, HealthyGamerGG, Better Ideas, Like Stories of Old）は **抽象的で短い独自名 / cinematic で文字少なめのサムネ / 断定リフレーム or 効果名タイトル / neuroscience・personality・philosophy 題材**。
→ **我々の既存の強み（3D HyperFrames の cinematic 映像 + 断定リフレーム台本 + neuroscience 軸）は、偶然にも prestige 側の空white space にぴったり乗る。** 量産群の型を真似ないことが最大の差別化。

---

## 1. チャンネル一覧（subs>1k、登録者降順 抜粋）

| subs | vids | age(y) | views/vid | up/yr | handle | title |
|---:|---:|---:|---:|---:|---|---|
| 13.1M | 4016 | 11.7 | 526k | 344 | @psych2go | Psych2Go |
| 9.7M | 1199 | 16.0 | 826k | 75 | @theschooloflifetv | The School of Life |
| 5.6M | 25 | 9.3 | **19.6M** | 3 | @jcs | JCS - Criminal Psychology |
| 3.4M | 318 | 9.3 | 766k | 34 | @pursuitofwonder | Pursuit of Wonder |
| 3.3M | 2825 | 7.4 | 291k | 383 | @healthygamergg | HealthyGamerGG |
| 3.0M | 128 | 9.4 | 1.2M | 14 | @betterideas | Better Ideas |
| 2.5M | 669 | 9.8 | 270k | 68 | @therapyinanutshell | Therapy in a Nutshell |
| 1.9M | 229 | 11.6 | 730k | 20 | @sprouts | Sprouts |
| 1.3M | 446 | 11.0 | 199k | 41 | @sisyphus55 | Sisyphus 55 |
| 1.0M | 154 | 9.2 | 446k | 17 | @likestoriesofold | Like Stories of Old |
| 701k | 313 | 10.9 | 265k | 29 | @drgexplains | Dr. G Explains |
| 494k | 3662 | 9.4 | 21k | 390 | @thepersonaldevelopmentschool | Thais Gibson (Personal Dev School) |
| 270k | 83 | **0.5** | 256k | 152 | @psychologyissimplified | Psychology Simplified |
| 263k | 95 | 6.6 | 107k | 14 | @rorysbrainworks | Rory's Brainworks |
| 259k | 2113 | 4.8 | 13k | 444 | @attachmentadam | Adam Lane Smith |
| 126k | 159 | 9.8 | 44k | 16 | @psychexplained | Psych Explained |
| 55k | 476 | 5.7 | 17k | 84 | @psych-o | PSYCH-O Psychology |
| 34k | 34 | **0.3** | 69k | 103 | @simplepsychologyexplained | Simple Psychology Explained |
| 20k | 190 | 1.3 | 1k | 150 | @thepsychologyofyour20s | The Psychology of your 20s |

**読み取り:**
- **JCS** は 25本で 5.6M subs（19.6M views/本）。少数精鋭・超高品質の極端な成功例（true crime 寄りで我々の隣接ジャンル外だが「本数より質」の証明）。
- 量産型（**Psychology Simplified 0.5y / Simple Psychology Explained 0.3y** で数万〜数十万）は短期に伸びるが、後述のとおり型が均質で天井が低い。
- 大手エッセイ系（Pursuit of Wonder, Sisyphus, Like Stories of Old）は **本数が少ない（150〜450本）のに 1〜3M subs**。high up/yr（量産）は必須ではない。

---

## 2. 命名パターン（最重要の発見）

各chの名前をキーワードでタグ付けし、バケットごとの **登録者中央値** を出した（重複タグあり）。

| バケット | ch数 | 登録者中央値 | 語数中央値 | 例 |
|---|---:|---:|---:|---|
| **abstract / evocative**（説明語を含まない独自名） | 12 | **1.6M** | 2 | The School of Life, Pursuit of Wonder, HealthyGamerGG, Sisyphus 55, Better Ideas, Sprouts |
| personal（個人名 / Dr・Coach） | 5 | 259k | 3 | Dr. G Explains, Thais Gibson, Adam Lane Smith |
| "psych" を含む | 15 | **34k** | 3 | Psych2Go※, Psychology Simplified, Psych Explained |
| "explain/simplify/decode" 動詞 | 10 | 32k | 3 | Dr. G Explains, Psych Explained, Decode The Brain |
| "brain" を含む | 5 | 29k | 3 | The Brain Maze, Brain.fm |
| "attachment" を含む | 2 | 8k | 3.5 | Stephanie Rigg, Avoidant Attachment |

※Psych2Go は 13.1M の例外だが 11.7年・4000本の先行者。新規が同名型で再現できる枠ではない。

**結論（客観）:**
- **説明的な名前（"Psychology Explained / Psych X / Decode the Brain / 〜 Brain"）は登録者中央値 3万前後の commodity ゾーンに集中。** これは AI 量産チャンネルが全部この型だから（後述 §5）。SEO 的に「psychology」を名前に入れる戦術は、もはや埋もれる方向に作用している。
- **スケールしている名前はほぼ全て「短い・独自・抽象/比喩」**：Sisyphus 55（神話）、Pursuit of Wonder（情緒）、The School of Life（比喩）、Better Ideas（抽象）、Like Stories of Old（詩的）。
- 名前の長さは **1〜3語が主流**（分布: 1語5ch / 2語11ch / 3語10ch / 4語8ch）。勝ち筋は短い。
- → **データは「説明語を避け、短く独自で覚えやすい比喩名」を支持する。** （因果ではないが、commodity 群との視覚的・心理的な差別化に直結する。）

---

## 3. About文（チャンネル説明欄）パターン

subs>50k の 23ch を分析。**About が空のチャンネルは 0/23（全員が書いている）。中央値 359 文字。**

勝っている About に共通する 4ブロック構造:

1. **1行の positioning / mission**（何屋か・どんな気分にするか）
2. **誰が・なぜ信頼できるか**（資格 or 出自 or 哲学）
3. **何が得られるか + 更新頻度**（cadence を明記する所が多い）
4. **リンク / CTA**

実例（引用）:

> **The School of Life (9.7M):** "Self-understanding, calm and emotional maturity. … We publish one film a week, on Wednesdays at 14.00hrs GMT."
> → 1行で情緒的 positioning → 更新曜日まで明記（信頼/習慣化）。

> **Pursuit of Wonder (3.4M):** "Fostering reflection through powerful ideas and stories. Wonder is the feeling of curiosity and appreciation… we explore philosophy, psychology, science, literature, well-being…"
> → **自分の名前の語（Wonder）を定義し直す**。ブランドの世界観を About で言語化。

> **Therapy in a Nutshell (2.5M):** "I'm Emma McAdam, a Licensed Marriage and Family Therapist… I take therapy skills and psychological research and condense them down into bite-sized nuggets…"
> → 資格 → 課題提示 → 提供価値。therapeutic 系は **実名+資格**が効く。

> **JCS (5.6M):** "Forensic Psychology / True Crime / Social Science"（わずか3行）。
> → 強いジャンル定義だけで成立する例（中身が強ければ About は短くてよい）。

**keywords フィールド:** 多くが使用（最大 500字上限まで）。ただし **量産 AI チャンネルほど keywords を 480〜500字に詰め込む**（キーワード stuffing は成長要因ではなく clone の tell）。大手は適度（Therapy in a Nutshell 110字、Better Ideas 41字）。

**結論:** About は必ず書く。**情緒的 1行 positioning + 世界観/信頼の根拠 + 更新頻度 + リンク** の4ブロック。keywords は数語の的確なものだけ（stuffing しない）。

---

## 4. サムネの傾向（上位サムネを画像解析）

上位パフォーマンスのサムネを実際に視認して分類した。**5つの型**に収れんする:

| 型 | 該当ch | 特徴 | 評価 |
|---|---|---|---|
| **A. ゆるキャラ + 黄色文字**（commodity） | Psych2Go, Psychology Simplified, Simple Psychology Explained | 2D 白blob キャラ + 紺/イラスト背景 + 黄色枠の黒太ゴシック 3-5語、1語ハイライト | **量産群の既定。模倣容易＝埋もれる** |
| **B. 平面色 + 巨大文字**（iconic） | The School of Life | 黄/単色背景 + 黒の超太 condensed caps + 切り抜き像 | 高コントラスト・ブランド一貫・強い |
| **C. cinematic ミニマル**（prestige） | Pursuit of Wonder, Sisyphus 55, Like Stories of Old | 実写/絵画的画像・**文字ゼロ〜数語**・余白大・film grain | **最大規模のエッセイ群がここ。高級感** |
| D. トーキングヘッド/podcast | HealthyGamerGG, Psychology of your 20s, Let's Talk | 実人物の顔 + caption（白角丸 or serif） | 人物が必要 |
| E. 投資/true-crime 系 | JCS（実映像+黒文字）, Dr. G（赤矢印・証拠コラージュ） | 高 arousal・調査トーン | 別ジャンル |

**具体観察:**
- **Sisyphus 55:** 温かいフラット色背景に小さな motif（ピンクの花）1つ、**テキスト無し**、大量の余白、film grain。徹底的にミニマルなアートフィルム調。
- **Pursuit of Wonder:** 黒い宇宙背景 + 白い細サンセリフ 3語 "You Are Here" + 赤いピン1つ。抑制的で詩的。
- **Like Stories of Old:** 映画スチルの分割 + 白太 caps ラベル。実映画素材で cinematic。
- **Psych2Go / 量産群:** 白blob キャラ + 黄色ハイライト文字。**3者ほぼ同一テンプレ**（量産の証拠）。
- **Psychology of your 20s:** 実写の cozy 写真（観葉植物・暖色）+ 上品な serif 小文字 "imposter syndrome"。穏やか/aesthetic 系。

**最重要インサイト:**
我々の 3D HyperFrames 映像（bloom / slate-blue / chibi 3D / cinematic framing）は、サムネにすると自然に **型C（cinematic ミニマル, prestige）** に着地する。これは **最大規模のエッセイ群（Pursuit of Wonder, Sisyphus, Like Stories of Old）と同じ象限**であり、飽和した型A（ゆるキャラ）から最も遠い。
しかも **「オリジナル 3D レンダリングの cinematic 心理学」は調査 85ch に1つも存在しない**（型C 勢は実写/絵画/映画素材で、3D 自作ではない）。= 明確に空いている視覚ポジション。

---

## 5. タイトル定型 × 題材需要（views/sub で正規化）

### タイトル定型（subs>5k の上位動画 n=356、views/sub 中央値降順）

| 定型 | 本数 | views中央値 | **views/sub中央値** | 例 |
|---|---:|---:|---:|---|
| **効果/バイアス名を据える** | 10 | 4.7M | **1.745** | "The Pygmalion Effect" |
| **断定/エッセイ文** | 217 | 318k | **1.588** | declarative statement 型 |
| 数字 listicle | 35 | 104k | 0.965 | "9 Weird Habits INFJs Have…" |
| How to / How your… | 25 | 107k | 0.451 | "How to quickly get out of a rut" |
| The psychology of… | 26 | 25k | 0.376 | "The Psychology of People Who…" |
| Question | 13 | 173k | 0.331 | "…So Why Do You Feel So Lost?" |
| People who / Signs you… | 13 | 8k | 0.317 | "If You Have Too Many Interests…" |
| **"Why you/we/I 〜"（汎用）** | 10 | 9k | **0.167** | "Why you're always tired" |

**読み取り:**
- **最強は「特定の効果・バイアス・症候群に名前を据える」**（Pygmalion Effect 等、views/sub 1.75）。次が **断定リフレーム文**（1.59）。
- **逆に "Why you 〜" の汎用形が最下位（0.167）。** これは量産群の既定タイトルで飽和。"The psychology of 〜" も低い（0.38）。
- ※各バケットの n は小さく、small ch の top 動画が混じる偏りはある。だが方向は明確: **「機構に固有名を与える」「断定でリフレームする」が勝ち、汎用 "why you" は負け。**
- **我々の既存タイトルは正しい側にいる**: "Depression Isn't Sadness — It's a Prediction Error"（断定リフレーム+機構命名）、"Your Anxiety Is a Threat Forecast"（機構命名）。"Why You Pull Away" だけは汎用 "why you" 形に寄っているので、機構命名へ寄せる余地あり。

### 題材需要（competitor 上位動画 n=356、views/sub 中央値）

| 題材 | 本数 | views中央値 | views/sub中央値 | 解釈 |
|---|---:|---:|---:|---|
| Social Psychology | 2 | 2.8M | 27.59 | n=2 外れ値、無視 |
| **Personality Types** | 15 | 154k | **2.56** | 強い（INFJ/introvert 等） |
| **Neuroscience & Brain** | 35 | 246k | **2.29** | 強い+よくサンプルされている |
| Modern Life & Technology | 3 | 404k | 1.27 | 母数小 |
| **Philosophy & Meaning** | 12 | **4.3M** | 1.06 | 絶対 views 最大（エッセイ大手の本丸） |
| Procrastination & Habits | 18 | 124k | 0.90 | 中 |
| **Anxiety & Stress** | 11 | **1.6M** | 0.69 | 巨大な絶対需要 |
| **Depression & Mood** | 5 | **1.5M** | 0.65 | 巨大な絶対需要 |
| Self-Improvement | 14 | 15k | 0.45 | 弱め |
| **Relationships & Attachment** | **65** | 21k | **0.45** | **最も供給過多 / 正規化で低い = 飽和** |
| Trauma & PTSD | 6 | 106k | 0.34 | 弱め |

**読み取り:**
- **Neuroscience & Brain と Personality Types** が「規模に対して伸びる」題材（views/sub 高 + サンプル十分）。
- **Anxiety / Depression / Philosophy** は **絶対 views が桁違いに大きい**（1.5〜4.3M 中央値）= 巨大なオーディエンス。エッセイ的 cinematic 処理と相性が良い。
- **Relationships & Attachment は本数65で最多（供給過多）なのに views/sub 0.45 と低い** → 完全に飽和。AI clone が大量参入している領域。**我々の既存 pull-away/attachment 動画はこの激戦区にある**点は要注意。
- 補助データ `psychology-demand.json`（Psych2Go 中心の直近投稿 n=26）でも Depression & Mood が最上位で整合。

### 尺
上位動画の尺 中央値 **約9分（544秒）**。分布: shorts 26 / 1-5分 46 / **5-12分 157（最多）** / 12-30分 92 / 30分超 33。
→ **5-12分の long-form が主戦場。** 我々の 10-15分はやや長いが許容範囲（エッセイ大手は 12-30分も多い）。

---

## 6. スタンス / ポジショニング・マップ

調査 85ch は概ね4象限に分かれる:

```
              説明的・教育的                         エッセイ的・哲学的
            （information）                        （reflection / meaning）
  量産  ┌─────────────────────────┬─────────────────────────┐
 (低天井)│ A: ゆるキャラ explainer       │                          │
        │  Psych2Go / Psychology       │  （ここは量産しにくい =     │
        │  Simplified / "Psych X" 群    │   参入障壁が守りになる）     │
        │  → 飽和・views/sub 低         │                          │
  ──────┼─────────────────────────┼─────────────────────────┤
  prestige│ C: 教育ブランド              │ B: cinematic エッセイ        │
 (高天井)│  School of Life / Sprouts /  │  Pursuit of Wonder /        │
        │  Dr.G・Psych Explained       │  Sisyphus 55 /              │
        │  （実名・図解・人物）          │  Like Stories of Old        │
        │                             │  → 絶対 views 最大・独自名・  │
        │  therapeutic: Therapy in a   │    cinematic ミニマルサムネ    │
        │  Nutshell / HealthyGamerGG   │  ← **我々が乗るべき象限**     │
        └─────────────────────────┴─────────────────────────┘
```

- **左上（A）= レッドオーシャン。** AI 量産の本拠地。名前・サムネ・タイトル・題材が均質で天井 ~3万。**ここの型を真似てはいけない。**
- **右下（B）= 我々の標的。** 絶対 views 最大、独自名、cinematic サムネ、断定/機構命名タイトル。供給は多いが「**オリジナル 3D 映像**」でやっている者はゼロ。
- **左下（C, therapeutic）** は強いが **実名+資格**（Dr K / Emma McAdam）が前提。我々は匿名 3D ブランドなので不利。
- **空white space（我々の固有ポジション）:** 「**Pursuit of Wonder / Sisyphus 級の cinematic エッセイ品質を、オリジナル 3D アニメで、neuroscience のリフレーム（予測誤差・脅威予報など）に適用する匿名ブランド**」。名前・サムネ・タイトル・題材の全てで commodity 群から離れられる。

---

## 7. 客観的含意（データ根拠つきの選択肢 — まだ最終決定ではない）

> 以下は「データがどちらを支持するか」を示すもので、最終決定はこの後ユーザーと行う。

### 7-1. 名前
- **データの支持:** 短い（1-3語）・説明語を避けた・独自/比喩名（§2: abstract 群 中央値1.6M vs psych 群 34k）。
- **避けるべき:** "Psychology Explained / Psych 〜 / 〜 Brain / Decode 〜"（量産群と同型 → 埋もれる）。
- **検討の方向性（例、決定ではない）:** 機構/比喩を1語で背負う独自名。我々の通底テーマ「脳は予測する機械」に合うなら *The Predictive Mind* 系の比喩名、または完全独自の造語/神話語（Sisyphus 型）。handle の空き確認は決定後に実施。

### 7-2. About文
- 4ブロック構造（情緒的1行 positioning → 世界観/信頼の根拠 → 提供価値+更新頻度 → リンク）。
- 更新頻度を明記（School of Life の "one film a week" 型）。keywords は数語のみ、stuffing 禁止。

### 7-3. サムネ
- **型C（cinematic ミニマル）で確定的に有利。** 我々の 3D 映像がそのまま prestige 象限に乗る唯一の競合不在ポジション。
- 文字は少なく（0〜4語）、余白大、1モチーフ、slate-blue/bloom のブランド色を一貫。**ゆるキャラ+黄色文字（型A）は厳禁**（量産群と同一視される）。
- ただし「文字ゼロ」は CTR リスクもあるため、**断定リフレームの数語**（"DEPRESSION ISN'T SADNESS" など §5 の強い型）を cinematic 画の上に最小限置くハイブリッドが穏当。

### 7-4. スタンス
- **エッセイ的リフレーム（右下B）** を軸に。"believe the surface, then flip it"（既存 PRINCIPLES.md）はこの象限の作法と完全に一致。
- 匿名 3D ブランドなので therapeutic（実名資格）路線は取らない。

### 7-5. 題材mix
- **主軸:** Neuroscience & Brain + Personality（views/sub 高）を、Anxiety/Depression/Philosophy（絶対需要 巨大）の **エッセイ的リフレーム**として作る。← 既存の depression/anxiety 動画はこの本丸。
- **注意:** Relationships & Attachment は飽和（§5）。既存の pull-away 系はそこにある。**今後は attachment 偏重を避け、neuroscience 軸へ寄せる**のがデータの示唆。
- タイトルは **機構命名 + 断定リフレーム**（"〜 Is a Threat Forecast" 型）を既定に。汎用 "Why you 〜" は避ける。

---

## 付録: 方法と限界

- **API使用:** `search.list`(discovery 5本 + 各ch top動画 ~85本)、`channels.list`(branding/stats)、`videos.list`(動画stats)。概算クォータ ~1万 unit（日次上限近辺で完走）。
- **スクリプト:** `scripts/research-competitors.js`（収集）、`scripts/research-supplement.js`（名前検索で大手を補完）、`scripts/analyze-competitor-research.js`（集計）。
- **限界:**
  1. `subscriberCount` は3桁概数。規模比較は桁レベルで扱う。
  2. 上位動画は `order=viewCount` だが Psych2Go 等で API が直近投稿を返す揺れがあり、一部 ch の「全期間トップ」は不完全。
  3. 命名バケットの相関は因果ではない（大手は先行者優位を含む）。ただし commodity 群=説明的名前の集中は明確。
  4. discovery が "Psychology Explained" 系を大量に拾い、サンプルが量産群に偏る。これ自体が「この型が飽和している」証拠でもある。
  5. "Einzelganger" は検索が 1-sub の死にチャンネルを誤マッチ（除外済み）。本家エッセイ枠は Sisyphus/Pursuit of Wonder/Like Stories of Old で代表させた。

---
---

# v2 — focused redo（最新・信頼版）

**収集日:** 2026-06-05 ／ **対象:** **34チャンネル（全て登録者≥80k or 著名指名）**。検索語を (b)メンタルヘルス上位＋(c)我々の主戦場 neuroscience/cognitive リフレーム の2クラスタに刷新し、AI量産群（前回 <1k が47ch）を除外。本家 Einzelgänger(2.4M)・Andrew Huberman(7.5M)・Academy of Ideas(2.0M)・Heidi Priebe(498k)・Eternalised(1.1M)・Dr. Tracey Marks(2.4M)・Kati Morton(1.5M)・The Holistic Psychologist(836k)・Crappy Childhood Fairy(1M) など **本物の上位群**を収録。
**生データ:** `data/analysis/competitor-channels-v2.json` / `competitor-top-videos-v2.json`（収集: `research-competitors-v2.js`、集計: `analyze-competitor-research.js -v2`）。

## v2-0. v1 からの訂正（重要）

量産群を除いた「本物の上位群」で見ると、v1 の結論のいくつかは **量産群のノイズが作っていた虚像**だった。以下を訂正する:

| 論点 | v1（量産混在） | **v2（本物の上位）= 採用** |
|---|---|---|
| **Relationships & Attachment** | 「供給過多で飽和、avoid」 | **views/sub 1.49 と良好。** 飽和しているのは clone の底辺だけ。差別化された本物（Heidi Priebe・Crappy Childhood Fairy・Thais Gibson）は伸びている。→ **attachment を一律に避ける必要はない**。clone と違う切り口なら戦える |
| **Personality Types** | 「強い (2.56)」 | **弱い (0.057)。** v1 の強さは clone の INFJ listicle が作った虚像。→ **優先しない** |
| **"The psychology of 〜" タイトル** | 「弱い (0.376)」 | **最強 (1.949, 中央値2.1M views)。** v1 は clone 汚染。本物では "The psychology of X" は効く |
| **尺** | 「5-12分が主戦場、中央値9分」 | **中央値11.5分、12-30分が最多バケット(119)。** 本物の上位はもっと長い。我々の10-15分は完全に適正、むしろ伸ばす余地あり |
| **命名** | 「abstract が支配的」 | 同左を確認。**＋ mental-health では『Dr.実名』ブランドも勝ち筋**（後述）。我々は匿名3Dなので実名路線は不可→ abstract 路線が一層妥当 |

**両データで一貫（=頑健な結論）:**
- **"Why you/we/I 〜" 汎用タイトルは両方で最下位**（v1 0.167 / v2 0.664）。避ける。
- **「効果/機構に固有名」＋「断定文」タイトルは両方で上位**。
- **abstract/独自の短い名前がスケールする**。説明的 "Brain/Explain" 名は中位（v2: brain系 中央値181k vs abstract 1.0M）。

## v2-1. チャンネル一覧（登録者降順 抜粋、全て本物の上位）

| subs | vids | age(y) | views/vid | handle | title | レーン |
|---:|---:|---:|---:|---|---|---|
| 13.1M | 4016 | 11.7 | 526k | @psych2go | Psych2Go | ゆるキャラ explainer |
| 9.7M | 1199 | 16.0 | 826k | @theschooloflifetv | The School of Life | 教育/哲学 |
| 7.5M | 492 | 13.1 | 1.0M | @hubermanlab | Andrew Huberman | **neuroscience** |
| 3.4M | 318 | 9.3 | 767k | @pursuitofwonder | Pursuit of Wonder | **cinematic essay** |
| 3.3M | 2827 | 7.4 | 291k | @healthygamergg | HealthyGamerGG | therapeutic(実名Dr) |
| 2.5M | 669 | 9.8 | 270k | @therapyinanutshell | Therapy in a Nutshell | therapeutic(実名) |
| 2.4M | 1416 | 18.8 | 138k | @drtraceymarks | Dr. Tracey Marks | 精神科医(実名) |
| 2.4M | 343 | 7.5 | 727k | @einzelganger | **Einzelgänger** | **philosophy essay** |
| 2.0M | 277 | 14.0 | 475k | @academyofideas | **Academy of Ideas** | **philosophy essay** |
| 1.9M | 250 | 13.0 | 1.7M | @drjulie | Dr Julie | 心理士(実名) |
| 1.5M | 2547 | 14.5 | 67k | @katimorton | Kati Morton | セラピスト(実名) |
| 1.3M | 446 | 11.0 | 200k | @sisyphus55 | Sisyphus 55 | **cinematic essay** |
| 1.1M | 218 | 6.6 | 354k | @eternalised | **Eternalised** | **philosophy(fine-art)** |
| 1.0M | 135 | 5.4 | 2.6M | @mrbrainjunkie | Mr Brain Junkie | film-clip/brain |
| 1.0M | 154 | 9.2 | 446k | @likestoriesofold | Like Stories of Old | **cinematic essay** |
| 1.0M | 1342 | 9.6 | 68k | @crappychildhoodfairy | Crappy Childhood Fairy | trauma/attachment |
| 836k | 751 | 11.3 | 141k | @theholisticpsychologist | The Holistic Psychologist | trauma/attachment |
| 697k | 205 | 12.1 | 324k | @neurochallenged | Neuroscientifically Challenged | **neuroscience(図解)** |
| 498k | 257 | 13.0 | 141k | @heidipriebe1 | **Heidi Priebe** | **我々の最近接アナログ** |

→ **我々の主戦場（neuroscience + philosophy essay + cognitive リフレーム）は、本物の上位群でぎっしり実証済み**。Huberman・Einzelgänger・Academy of Ideas・Eternalised・Sisyphus・Pursuit of Wonder・Heidi Priebe が同居。**質の高い差別化なら入り込める、証明済みの非飽和スペース**。

## v2-2. 命名（本物の上位で再確認）

| バケット | ch数 | 登録者中央値 | 例 |
|---|---:|---:|---|
| **abstract / evocative** | 22 | **1.0M** | School of Life, Huberman(姓), Pursuit of Wonder, Einzelgänger, Academy of Ideas, Sisyphus 55, Eternalised |
| personal（Dr.実名） | 3 | **1.9M** | Dr. Tracey Marks, Dr Julie |
| brain を含む | 7 | 181k | Mr Brain Junkie, The Brain Titans, Brain Station |

- **スケール名は2系統:** ①短い abstract/独自名（哲学・神話・情緒語） ②**Dr.実名の信頼ブランド**（mental-health 特有）。
- 我々は **匿名3Dブランド**なので②は取れない → **①abstract 路線が確定的に妥当**。
- 名前語数分布: 1語6 / 2語8 / 3語9 / 4語7。**2-3語が主流**。"Brain/Explain" 直球名は中位どまり。

## v2-3. About文（本物の上位、中央値531字 / 空は1/34のみ）

v1 の4ブロック構造を再確認。本物の上位で **追加の重要パターン2つ:**

1. **資格・権威を前面に**（mental-health/neuroscience では信頼が CTR/維持率に効く）:
   > **Huberman:** "...Andrew Huberman, Ph.D., a neuroscientist and tenured professor ... at Stanford School of Medicine..."
   > **Dr. Tracey Marks:** "I'm Dr. Tracey Marks, a psychiatrist with 20+ years..."
   我々は匿名なので「資格」は使えないが、代わりに **方法論の権威**（"research-backed", "studies", "predictive-processing neuroscience"）で代替する。

2. **医療免責（disclaimer）を明記**（脳・メンタルの主張をする上位は入れている）:
   > **Einzelgänger:** "...isn't a clinical/medical service or replacement of mental health professionals, nor an academic resource."
   → **我々も About に "not medical advice / 専門家の代替ではない" を1行入れるべき**（depression/anxiety を扱うため必須級）。

3. 更新頻度の明記（School of Life "one film a week, Wednesdays"）は引き続き有効。keywords は的確な数語のみ（stuffing は clone の tell）。

## v2-4. サムネ — 我々のレーン（neuroscience/philosophy essay）の作法

本物の上位レーンのサムネを画像解析。**4型**に分かれる:

| 型 | 例 | 特徴 |
|---|---|---|
| **fine-art / 絵画**（最高級） | **Eternalised**（古典油彩の道化、文字ゼロ）, **Einzelgänger**（ベクター様式画 + 2語 "NOT TRYING"・1語オレンジaccent） | 名画 or 様式イラスト中心、文字ゼロ〜2語、premium |
| **モノクロ + 最小文字** | **Huberman**（黒背景・B&W顔・白太字 + blue accent ブランド枠）, **Academy of Ideas**（黒地に灰の迷路 + 白文字） | 抑制した配色、太字、知的 |
| **巨大コンセプト語 + 顔** | **Heidi Priebe**（"LIMERENCE" 特大 + 顔） | **機構/概念を1語で特大表示**（最強タイトル型と一致） |
| 図解 explainer | Neuroscientifically Challenged（手描き synapse + 蛍光ボックス） | 教育寄り・文字多。commodity 寄りの端 |

**我々への含意（強い確証）:**
- 我々の **3D cinematic（slate-blue / bloom / chibi3D）+ accent色の2-4語パンチ文字**は、Einzelgänger の "NOT TRYING"（accent語）/ Huberman のモノクロ+accent / Eternalised の art-first と **同じ premium 象限**にぴたりと収まる。
- **「機構を1語で特大」**（Heidi の LIMERENCE 型）を採用価値大 — 我々の "PREDICTION ERROR" "THREAT FORECAST" をサムネの主役語にできる。
- **ゆるキャラ+黄色文字（型A）/ 蛍光ボックス図解は不採用**（commodity に見える）。
- 文字ゼロ（Eternalised/Sisyphus）は最高級だが新規無名には CTR リスク → **cinematic画 + 機構1語 or 断定2-3語**のハイブリッドが最適解。

## v2-5. タイトル定型 & 題材（本物の上位、n=370）

**タイトル定型（views/sub 中央値降順）:**

| 定型 | 本数 | views/sub | 注 |
|---|---:|---:|---|
| **The psychology of 〜** | 8 | **1.949** | v1から逆転。本物では最強（"The Psychology of The Fool" 等） |
| Number listicle | 41 | 1.658 | ※Brain.fm の集中BGM動画が押し上げ（ノイズ）。割り引く |
| **効果/機構に固有名** | 9 | 1.574 | 安定して強い |
| **断定/エッセイ文** | 250 | 1.514 | 最多かつ強い。我々の既定型 |
| Why [topic] 〜 | 7 | 1.279 | |
| How to / How your | 25 | 0.979 | |
| **"Why you/we/I 〜"（汎用）** | 7 | **0.664** | 両データで最下位。避ける |

**題材需要（views/sub 中央値、Social Psychology n=3 は外れ値で除外）:**

| 題材 | 本数 | views中央値 | views/sub | 解釈 |
|---|---:|---:|---:|---|
| Procrastination & Habits | 21 | 913k | 1.63 | 強い |
| **Philosophy & Meaning** | 21 | **3.7M** | 1.56 | **絶対views最大**。essay の本丸 |
| **Relationships & Attachment** | 23 | 636k | 1.49 | **v1訂正: 本物は良好**（clone底辺のみ飽和） |
| **Depression & Mood** | 9 | **1.5M** | 1.40 | 巨大需要 |
| Trauma & PTSD | 28 | 325k | 1.30 | 良好（本数も多い） |
| **Neuroscience & Brain** | **59** | 909k | 1.25 | **最大サンプル**＝レーンが厚い・実証的 |
| **Anxiety & Stress** | 41 | 276k | 1.05 | 巨大需要・本数多 |
| Self-Improvement | 19 | 276k | 1.02 | 中 |
| Mindfulness & Meditation | 14 | 182k | 1.03 | 中（瞑想/BGM系） |
| Personality Types | 3 | 21k | 0.06 | **v1訂正: 弱い。優先しない** |

→ **我々の本丸（neuroscience 軸で Anxiety/Depression/Philosophy をリフレーム）は需要・供給とも厚く、views/sub も健全**。Trauma・Attachment も本物の切り口なら可（既存 pull-away/freeze 系は無駄にならない）。

## v2-6. 結論の更新（v2 採用版）

1. **名前:** 短い(2-3語) abstract/独自/比喩名で確定的に有利。実名Dr路線は匿名我々には不可。"Brain/Explain" 直球は中位。
2. **About:** 4ブロック ＋ **方法論の権威（research-backed/neuroscience）** ＋ **医療免責1行** ＋ 更新頻度。keywords は数語。
3. **サムネ:** 3D cinematic + accent色の **機構1語 or 断定2-3語**（Einzelgänger/Heidi/Huberman の premium 型）。ゆるキャラ・蛍光図解は不採用。
4. **タイトル:** ①機構に固有名 ②断定エッセイ文 ③"The psychology of 〜" を既定。汎用 "Why you 〜" は回避。
5. **スタンス:** philosophy/neuroscience の cinematic エッセイ＋リフレーム。匿名3Dで「Pursuit of Wonder/Einzelgänger 級の質を、オリジナル3D × predictive-brain 神経科学で」やる無競合ポジション。
6. **題材mix:** 主軸 = Neuroscience/Brain × (Anxiety/Depression/Philosophy)。Trauma/Attachment も差別化前提で可（personality は非優先）。尺は12-30分も射程（我々の10-15分は適正）。
