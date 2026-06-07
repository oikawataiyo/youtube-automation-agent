# 競合心理学チャンネル 客観調査レポート

**目的:** 自チャンネルの公開ブランド（名前・About文・サムネ・スタンス・題材）を決める前に、「実際に何が再生されているか」を YouTube Data API の実データで客観把握する。

**収集日:** 2026-06-05 ／ **対象:** **34チャンネル（全て登録者≥80k or 著名指名）**。検索語を (b)メンタルヘルス上位＋(c)我々の主戦場 neuroscience/cognitive リフレーム の2クラスタに設計し、AI量産群（登録者≦数千の clone）を登録者≥80kフィルタで除外。本家 Einzelgänger(2.4M)・Andrew Huberman(7.5M)・Academy of Ideas(2.0M)・Heidi Priebe(498k)・Eternalised(1.1M)・Dr. Tracey Marks(2.4M)・Kati Morton(1.5M)・The Holistic Psychologist(836k)・Crappy Childhood Fairy(1M) など **本物の上位群**を収録。各chの再生数上位最大12本（計 ~370本）。

**生データ:** `data/analysis/competitor-channels-v2.json` / `competitor-top-videos-v2.json`（収集: `scripts/research-competitors-v2.js`、集計: `scripts/analyze-competitor-research.js -v2`）。

**指標の注記:** 規模差を消すため動画は **views/sub（再生数÷登録者数）= 登録者規模に対しどれだけ伸びたか** で正規化。絶対 views も併記。命名バケットの相関は因果ではない（大手は先行者優位を含む）。

> **補足:** 本調査の前に、検索語を広く取った初回スキャン（85ch・AI量産群を多数含む）も実施した。そちらは「量産群が密集する commodity ゾーン」の把握には有用だったが、量産 clone のノイズで一部指標が歪んだ（下表 §0）。本レポートは量産群を除いた**本物の上位群のみ**を採用する。

---

## 0. 初回の広域スキャン（量産群込み）からの訂正

量産群を除いた「本物の上位群」で見ると、広域スキャンの結論のいくつかは **量産 clone のノイズが作っていた虚像**だった。以下を訂正し、本レポートでは右列を採用する。

| 論点 | 広域スキャン（量産混在） | **本調査（本物の上位）= 採用** |
|---|---|---|
| **Relationships & Attachment** | 「供給過多で飽和、avoid」 | **views/sub 1.49 と良好。** 飽和しているのは clone の底辺だけ。差別化された本物（Heidi Priebe・Crappy Childhood Fairy・Thais Gibson）は伸びている。→ **attachment を一律に避ける必要はない**。clone と違う切り口なら戦える |
| **Personality Types** | 「強い (2.56)」 | **弱い (0.057)。** その強さは clone の INFJ listicle が作った虚像。→ **優先しない** |
| **"The psychology of 〜" タイトル** | 「弱い (0.376)」 | **最強 (1.949, 中央値2.1M views)。** clone 汚染を除くと、本物では "The psychology of X" は効く |
| **尺** | 「5-12分が主戦場、中央値9分」 | **中央値11.5分、12-30分が最多バケット(119本)。** 本物の上位はもっと長い。我々の10-15分は完全に適正、むしろ伸ばす余地あり |
| **命名** | 「abstract が支配的」 | 同左を確認。**＋ mental-health では『Dr.実名』ブランドも勝ち筋**（§2）。我々は匿名3Dなので実名路線は不可→ abstract 路線が一層妥当 |

**両スキャンで一貫（=頑健な結論）:**
- **"Why you/we/I 〜" 汎用タイトルは両方で最下位**（広域 0.167 / 本調査 0.664）。避ける。
- **「効果/機構に固有名」＋「断定文」タイトルは両方で上位**。
- **abstract/独自の短い名前がスケールする**。説明的 "Brain/Explain" 名は中位（本調査: brain系 中央値181k vs abstract 1.0M）。

---

## 1. チャンネル一覧（登録者降順 抜粋、全て本物の上位）

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

---

## 2. 命名パターン

| バケット | ch数 | 登録者中央値 | 例 |
|---|---:|---:|---|
| **abstract / evocative** | 22 | **1.0M** | School of Life, Huberman(姓), Pursuit of Wonder, Einzelgänger, Academy of Ideas, Sisyphus 55, Eternalised |
| personal（Dr.実名） | 3 | **1.9M** | Dr. Tracey Marks, Dr Julie |
| brain を含む | 7 | 181k | Mr Brain Junkie, The Brain Titans, Brain Station |

- **スケール名は2系統:** ①短い abstract/独自名（哲学・神話・情緒語） ②**Dr.実名の信頼ブランド**（mental-health 特有）。
- 我々は **匿名3Dブランド**なので②は取れない → **①abstract 路線が確定的に妥当**。
- 名前語数分布: 1語6 / 2語8 / 3語9 / 4語7。**2-3語が主流**。"Brain/Explain" 直球名は中位どまり。

---

## 3. About文（中央値531字 / 空は1/34のみ）

勝っている About に共通する 4ブロック構造:

1. **1行の positioning / mission**（何屋か・どんな気分にするか）
2. **誰が・なぜ信頼できるか**（資格 or 出自 or 哲学）
3. **何が得られるか + 更新頻度**
4. **リンク / CTA**

実例（引用）:

> **The School of Life (9.7M):** "Self-understanding, calm and emotional maturity. … We publish one film a week, on Wednesdays at 14.00hrs GMT."
> → 1行で情緒的 positioning → 更新曜日まで明記。

> **Pursuit of Wonder (3.4M):** "Fostering reflection through powerful ideas and stories. Wonder is the feeling of curiosity and appreciation… we explore philosophy, psychology, science, literature, well-being…"
> → **自分の名前の語（Wonder）を定義し直す**。世界観を About で言語化。

本物の上位で特に効いている **追加パターン2つ:**

1. **資格・権威を前面に**（mental-health/neuroscience では信頼が CTR/維持率に効く）:
   > **Huberman:** "...Andrew Huberman, Ph.D., a neuroscientist and tenured professor ... at Stanford School of Medicine..."
   > **Dr. Tracey Marks:** "I'm Dr. Tracey Marks, a psychiatrist with 20+ years..."
   我々は匿名なので「資格」は使えないが、代わりに **方法論の権威**（"research-backed", "studies", "predictive-processing neuroscience"）で代替する。

2. **医療免責（disclaimer）を明記**（脳・メンタルの主張をする上位は入れている）:
   > **Einzelgänger:** "...isn't a clinical/medical service or replacement of mental health professionals, nor an academic resource."
   → **我々も About に "not medical advice / 専門家の代替ではない" を1行入れるべき**（depression/anxiety を扱うため必須級）。

**keywords:** 的確な数語のみ。stuffing（480〜500字詰め込み）は量産 clone の tell であり成長要因ではない。

---

## 4. サムネ — 我々のレーン（neuroscience / philosophy essay）の作法

本物の上位レーンのサムネを画像解析。**4型**に分かれる:

| 型 | 例 | 特徴 |
|---|---|---|
| **fine-art / 絵画**（最高級） | **Eternalised**（古典油彩の道化、文字ゼロ）, **Einzelgänger**（ベクター様式画 + 2語 "NOT TRYING"・1語オレンジaccent） | 名画 or 様式イラスト中心、文字ゼロ〜2語、premium |
| **モノクロ + 最小文字** | **Huberman**（黒背景・B&W顔・白太字 + blue accent ブランド枠）, **Academy of Ideas**（黒地に灰の迷路 + 白文字） | 抑制した配色、太字、知的 |
| **巨大コンセプト語 + 顔** | **Heidi Priebe**（"LIMERENCE" 特大 + 顔） | **機構/概念を1語で特大表示**（最強タイトル型と一致） |
| 図解 explainer | Neuroscientifically Challenged（手描き synapse + 蛍光ボックス） | 教育寄り・文字多。commodity 寄りの端 |

参考（commodity 側＝避ける型）: Psych2Go や量産 clone（Psychology Simplified / Simple Psychology Explained）は **2D 白blob キャラ + 黄色枠の黒太ゴシック**。模倣容易で埋もれる。

**我々への含意（強い確証）:**
- 我々の **3D cinematic（slate-blue / bloom / chibi3D）+ accent色の2-4語パンチ文字**は、Einzelgänger の "NOT TRYING"（accent語）/ Huberman のモノクロ+accent / Eternalised の art-first と **同じ premium 象限**にぴたりと収まる。
- **「機構を1語で特大」**（Heidi の LIMERENCE 型）を採用価値大 — 我々の "PREDICTION ERROR" "THREAT FORECAST" をサムネの主役語にできる。
- **ゆるキャラ+黄色文字 / 蛍光ボックス図解は不採用**（commodity に見える）。
- 文字ゼロ（Eternalised/Sisyphus）は最高級だが新規無名には CTR リスク → **cinematic画 + 機構1語 or 断定2-3語**のハイブリッドが最適解。

---

## 5. タイトル定型 × 題材需要（n=370、views/sub 正規化）

**タイトル定型（views/sub 中央値降順）:**

| 定型 | 本数 | views/sub | 注 |
|---|---:|---:|---|
| **The psychology of 〜** | 8 | **1.949** | 本物では最強（"The Psychology of The Fool" 等） |
| Number listicle | 41 | 1.658 | ※Brain.fm の集中BGM動画が押し上げ（ノイズ）。割り引く |
| **効果/機構に固有名** | 9 | 1.574 | 安定して強い |
| **断定/エッセイ文** | 250 | 1.514 | 最多かつ強い。我々の既定型 |
| Why [topic] 〜 | 7 | 1.279 | |
| How to / How your | 25 | 0.979 | |
| **"Why you/we/I 〜"（汎用）** | 7 | **0.664** | 両スキャンで最下位。避ける |

**題材需要（views/sub 中央値、Social Psychology n=3 は外れ値で除外）:**

| 題材 | 本数 | views中央値 | views/sub | 解釈 |
|---|---:|---:|---:|---|
| Procrastination & Habits | 21 | 913k | 1.63 | 強い |
| **Philosophy & Meaning** | 21 | **3.7M** | 1.56 | **絶対views最大**。essay の本丸 |
| **Relationships & Attachment** | 23 | 636k | 1.49 | 本物は良好（clone底辺のみ飽和） |
| **Depression & Mood** | 9 | **1.5M** | 1.40 | 巨大需要 |
| Trauma & PTSD | 28 | 325k | 1.30 | 良好（本数も多い） |
| **Neuroscience & Brain** | **59** | 909k | 1.25 | **最大サンプル**＝レーンが厚い・実証的 |
| **Anxiety & Stress** | 41 | 276k | 1.05 | 巨大需要・本数多 |
| Self-Improvement | 19 | 276k | 1.02 | 中 |
| Mindfulness & Meditation | 14 | 182k | 1.03 | 中（瞑想/BGM系） |
| Personality Types | 3 | 21k | 0.06 | 弱い。優先しない |

**尺:** 中央値 **約11.5分（689秒）**。分布: shorts 55 / 1-5分 46 / 5-12分 94 / **12-30分 119（最多）** / 30分超 56。
→ **本物の上位は long-form（12-30分も主力）**。我々の10-15分は完全適正、伸ばす余地あり。

→ **我々の本丸（neuroscience 軸で Anxiety/Depression/Philosophy をリフレーム）は需要・供給とも厚く、views/sub も健全**。Trauma・Attachment も本物の切り口なら可（既存 pull-away/freeze 系は無駄にならない）。

---

## 6. ポジショニング・マップと white space

```
              説明的・教育的                         エッセイ的・哲学的
            （information）                        （reflection / meaning）
  量産  ┌─────────────────────────┬─────────────────────────┐
 (低天井)│ ゆるキャラ explainer          │                          │
        │  Psych2Go / 量産 clone 群     │  （量産しにくい = 障壁が守りに）│
        │  → 飽和・views/sub 低         │                          │
  ──────┼─────────────────────────┼─────────────────────────┤
  prestige│ 教育/実名 Dr                 │ cinematic / neuroscience essay │
 (高天井)│  School of Life / Sprouts /  │  Pursuit of Wonder / Sisyphus / │
        │  Dr.Julie / Dr.Tracey Marks /│  Einzelgänger / Academy of      │
        │  Kati Morton / Therapy in a  │  Ideas / Eternalised / Huberman /│
        │  Nutshell（実名+資格が前提）   │  Heidi Priebe                   │
        │                             │  → 絶対views最大・独自名・       │
        │                             │    premium サムネ ← **我々の象限** │
        └─────────────────────────┴─────────────────────────┘
```

- **左上 = レッドオーシャン。** AI量産の本拠地（名前・サムネ・タイトル・題材が均質で天井が低い）。**ここの型を真似ない。**
- **左下（実名 Dr）** は強いが **実名+資格**が前提。匿名3Dの我々は不利。
- **右下 = 我々の標的。** 絶対 views 最大、独自名、premium サムネ、断定/機構命名タイトル。Huberman/Einzelgänger/Academy of Ideas らが実証。供給は多いが「**オリジナル3D映像**」でやっている者はゼロ。
- **我々の固有ポジション:** 「**Pursuit of Wonder / Einzelgänger 級の cinematic エッセイ品質を、オリジナル3Dアニメで、predictive-brain 神経科学のリフレーム（予測誤差・脅威予報など）に適用する匿名ブランド**」。名前・サムネ・タイトル・題材の全てで commodity 群から離れられる、実証済み・非飽和の白white space。

---

## 7. 客観的含意（データ根拠つきの選択肢 — 最終決定はこの後ユーザーと）

1. **名前:** 短い(2-3語) abstract/独自/比喩名で確定的に有利。実名Dr路線は匿名我々には不可。"Brain/Explain" 直球は中位。
2. **About:** 4ブロック ＋ **方法論の権威（research-backed/neuroscience）** ＋ **医療免責1行** ＋ 更新頻度。keywords は的確な数語、stuffing 禁止。
3. **サムネ:** 3D cinematic + accent色の **機構1語 or 断定2-3語**（Einzelgänger/Heidi/Huberman の premium 型）。ゆるキャラ・蛍光図解は不採用。
4. **タイトル:** ①機構に固有名 ②断定エッセイ文 ③"The psychology of 〜" を既定。汎用 "Why you 〜" は回避。
5. **スタンス:** philosophy/neuroscience の cinematic エッセイ＋リフレーム。匿名3Dで「Pursuit of Wonder/Einzelgänger 級の質を、オリジナル3D × predictive-brain 神経科学で」やる無競合ポジション。
6. **題材mix:** 主軸 = Neuroscience/Brain × (Anxiety/Depression/Philosophy)。Trauma/Attachment も差別化前提で可（personality は非優先）。尺は12-30分も射程（我々の10-15分は適正）。

---

## 付録: 方法と限界

- **API使用:** `search.list`(discovery 12本 + 各ch top動画)、`channels.list`(branding/stats)、`videos.list`(動画stats)。
- **スクリプト:** `scripts/research-competitors-v2.js`（収集・登録者≥80kフィルタ+著名指名）、`scripts/analyze-competitor-research.js -v2`（集計）。
- **限界:**
  1. `subscriberCount` は3桁概数。規模比較は桁レベルで扱う。
  2. 上位動画は `order=viewCount` だが Psych2Go / Dr Julie / School of Life 等で API が一部直近投稿を返す揺れがあり、「全期間トップ」は不完全な ch がある。
  3. 命名バケットの相関は因果ではない（大手は先行者優位を含む）。
  4. discovery にメンタルヘルス周辺の隣接（Brain.fm の集中BGM・瞑想/breathwork 等）が一部混入。題材分類と views/sub 正規化で影響を抑制したが、Number listicle 等は割り引いて読む。
  5. "Patrick Teahan" は検索が別 ch を誤マッチ（除外）。trauma 枠は Crappy Childhood Fairy / The Holistic Psychologist で代表。
