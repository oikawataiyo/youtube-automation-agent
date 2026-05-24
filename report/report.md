# YouTube Niche Discovery Report

**分析日:** 2026-05-23
**対象region:** US, JP
**sample規模:** US 12 genre / 65 channel / 650 videos, JP 12 genre / 61 channel / 605 videos

---

## 方法論

YouTube Data API v3を使い、以下の4 phaseで分析を実施した。

1. **Genre Discovery** — YouTube公式categoryからtrending動画を取得し、assignable categoryを特定
2. **Channel Sampling** — trending動画のtagsからseed keywordを抽出し、genre別にchannelをsearch → playlist APIで最新動画を収集
3. **Cross-Genre Analysis** — 7指標（Demand PR, Engagement Rate, Competition Density, Upload Cadence, New Channel Growth, Scale Efficiency, Recency Trend）を算出
4. **Niche Scoring** — 指標を0-1に正規化し、重み付けscoreで順位付け（Demand 30%, Growth 25%, Opportunity 20%, Engagement 10%, Scale Efficiency 10%, Recency 5%）

---

## US Region 結果

### Ranking

| # | Genre | Score | Demand PR | Eng% | Trend | 平均再生数 |
|---|-------|-------|-----------|------|-------|-----------|
| 1 | Sports | 0.767 | 2.709 | 1.79% | rising | 1,602,384 |
| 2 | Comedy | 0.767 | 2.709 | 1.79% | rising | 1,602,384 |
| 3 | Music | 0.633 | 2.648 | 3.24% | stable | 211,212 |
| 4 | Autos & Vehicles | 0.629 | 2.091 | 1.64% | rising | 1,460,302 |
| 5 | Howto & Style | 0.629 | 2.091 | 1.64% | rising | 1,460,302 |
| 6 | Science & Technology | 0.617 | 2.079 | 1.33% | rising | 1,454,615 |
| 7 | People & Blogs | 0.175 | 0.370 | 6.53% | stable | 422,886 |
| 8 | Entertainment | 0.119 | 0.336 | 2.74% | rising | 87,008 |
| 9 | Film & Animation | 0.119 | 0.336 | 2.74% | rising | 87,005 |
| 10 | Gaming | 0.106 | 0.284 | 4.10% | rising | 1,726,701 |
| 11 | Pets & Animals | 0.083 | 0.182 | 3.79% | falling | 284,909 |
| 12 | News & Politics | 0.000 | 0.001 | 3.63% | stable | 5,311 |

### US Genre別 sample channel

#### 1. Sports / Comedy（同率1位、Score 0.767）

> **注意:** Sports と Comedy で同一channelが多数重複している。seed keyword `"the"` が汎用すぎるため。詳細は「Data品質の問題」を参照。

代表的なchannel:
- [The Weeknd](https://youtube.com/channel/UC0WP5P-ufpRfjbNrmOWwLBQ) — 39.6M subs, 平均6,857,209再生
- [The Wiggles](https://youtube.com/channel/UC5vVe2R4ucoMzJP53o38Yaw) — 10.5M subs, 平均267,124再生
- [The Люди](https://youtube.com/channel/UCwPzq5yQwczLmivBX8zq7Mw) — 5.4M subs, 平均560,744再生
- [The Reviewer](https://youtube.com/channel/UCOUIsSGwrFY52YctxX0gmEg) — 1.2M subs, 平均64,171再生
- [The Strasdas Family](https://youtube.com/channel/UC-uI0DQjeXu1Q6EQUdzMg5g) — 45K subs, 平均464,094再生（小規模channelでも高再生）

#### 3. Music（Score 0.633）

代表的なchannel:
- [Hip-Hop Universe](https://youtube.com/channel/UCKOlU7SLdtqmOx1w0nyAPtw) — 1.4M subs, 平均18,193再生
- [Rare & Unfamiliar Hip Hop](https://youtube.com/channel/UCEaO-7UaqDm2ojQrrcH-GVw) — 64K subs, 平均416,334再生（niche特化の好例）
- [Việt Hiphop](https://youtube.com/channel/UCYe9RWurx6xQauF_Ww5LOSw) — 195K subs, 平均270,208再生
- [Hungria Hip-Hop - Topic](https://youtube.com/channel/UCT0DGl3I0kYtUoSOvMz2I6g) — 53K subs, 平均140,114再生

#### 6. Science & Technology（Score 0.617）

代表的なchannel（ただしseed keyword `"the"` のため実際のtech channelはほぼ含まれていない）:
- [The Fixies](https://youtube.com/channel/UCnRuuiSVqDF2EmoYS7yE6ZA) — 3.1M subs, 平均36,176再生（子供向けアニメ、実際はSci&Techではない）
- [The Singing Walrus](https://youtube.com/channel/UCe1VpF4wS_kdcjyTRSXBcnQ) — 3.8M subs, 平均7,335,388再生（教育系音楽、誤分類）

#### 7. People & Blogs（Score 0.175）

代表的なchannel:
- [Mia Maples](https://youtube.com/channel/UCzzOKT1SkE7qdycJvPCR3Gg) — 4.8M subs, 平均686,371再生
- [More Mia Maples](https://youtube.com/channel/UCvRhblKpR8SH7VHho0KnT0g) — 621K subs, 平均555,056再生
- [Mia ASMR](https://youtube.com/channel/UC1-APDMA2UhZ1ySUpXvfF-w) — 383K subs, 平均27,232再生

#### 10. Gaming（Score 0.106）

代表的なchannel:
- [Royalty Gaming](https://youtube.com/channel/UCemhZ2At2lgifTJLClGCz9A) — 7.7M subs, 平均9,711,612再生（大channel支配の典型）
- [Hudson's Playground Gaming](https://youtube.com/channel/UC6zzlBIwNS9GJZZ3rBx_WhQ) — 2.4M subs, 平均581,806再生
- [Z1 Gaming](https://youtube.com/channel/UCMPpVtxOI8RtfurfvCcxgyA) — 626K subs, 平均20,531再生
- [Mortismal Gaming](https://youtube.com/channel/UCEQ7KR9enYdQsB6kcMnw0NA) — 474K subs, 平均42,650再生

#### 12. News & Politics（最下位、Score 0.000）

代表的なchannel:
- [BBC News](https://youtube.com/channel/UC16niRr50-MSBwiO3YDb3RA) — 19.7M subs, 平均13,915再生（subs対比で極端に低い再生数）
- [Fox News](https://youtube.com/channel/UCXIJgqnII2ZOINSWNOGFThA) — 15.3M subs, 平均10,926再生
- [DW News](https://youtube.com/channel/UCknLrEdhRCp1aegoMqRaCZg) — 6.3M subs, 平均906再生
- large channel比率100%。新規参入は極めて困難。

---

## JP Region 結果

### Ranking

| # | Genre | Score | Demand PR | Eng% | Trend | 平均再生数 |
|---|-------|-------|-----------|------|-------|-----------|
| 1 | Film & Animation | 0.807 | 23.312 | 1.06% | rising | 674,586 |
| 2 | Pets & Animals | 0.466 | 12.278 | 2.19% | rising | 346,276 |
| 3 | Science & Technology | 0.465 | 20.842 | 1.38% | falling | 1,794,537 |
| 4 | Comedy | 0.314 | 9.734 | 1.29% | rising | 256,541 |
| 5 | Howto & Style | 0.245 | 0.740 | 2.07% | rising | 393,324 |
| 6 | Gaming | 0.200 | 0.237 | 2.84% | rising | 251,959 |
| 7 | People & Blogs | 0.132 | 2.439 | 2.84% | rising | 11,719 |
| 8 | Music | 0.125 | 0.563 | 5.96% | falling | 16,329 |
| 9 | Sports | 0.111 | 0.383 | 0.69% | falling | 22,241 |
| 10 | Autos & Vehicles | 0.093 | 0.918 | 3.18% | falling | 11,135 |
| 11 | Entertainment | 0.086 | 0.369 | 1.82% | rising | 387,697 |
| 12 | News & Politics | 0.000 | 0.008 | 3.48% | stable | 7,110 |

### JP Genre別 sample channel

#### 1. Film & Animation（Score 0.807、PR 23.3x）

代表的なchannel:
- [WOWOWO](https://youtube.com/channel/UCeAF5wm1MJbA0NiwNbpv4IA) — 29K subs, 平均2,248,006再生（subs 29Kで平均225万再生、驚異的なPR）
- [闇金ウシジマくん【公式】](https://youtube.com/channel/UCotZfbYZEgBMFTLmX_Oa9wg) — 577K subs, 平均264,273再生
- [ドラマ「闇金サイハラさん」公式](https://youtube.com/channel/UCOo8Qo3gL6slE5UXqsd0P8w) — 13K subs, 平均183,336再生
- [闇金ウシジマくんから教訓を学ぶチャンネル](https://youtube.com/channel/UCiCabQYbgA8rmBgbSdYHifQ) — 6K subs, 平均2,729再生

> seed keyword `"暗金ウシジマくん外伝"` により、ウシジマくん関連channelに偏っている。genre全体の傾向というよりもこの特定IPの人気を反映している可能性が高い。

#### 2. Pets & Animals（Score 0.466、PR 12.3x）

代表的なchannel:
- [アニマル研究室](https://youtube.com/channel/UClZvMgf99iSgAmdaPAvANYA) — 56K subs, 平均942,583再生（subs対比で非常に高い再生数）
- [卵巣がん女将](https://youtube.com/channel/UCIQaPfjsDVkYFoQYOllr_7g) — 4K subs, 平均86,075再生
- [垢抜け大学](https://youtube.com/channel/UCHTZAvwi69ltfFoJQRcxw5w) — 44K subs, 平均10,171再生（ペット系ではないchannel混入の可能性）

> seed keyword `"遺伝子ガチャに失敗した猫"` はバズっている特定動画タイトルで、genre代表性が低い。

#### 3. Science & Technology（Score 0.465、PR 20.8x）

代表的なchannel:
- [SWITCH* ANIMATION](https://youtube.com/channel/UCX-_naqB1fWzEFaI7mG5jFw) — 794K subs, 平均6,138,057再生（アニメ系で実際はSci&Techではない）
- [Switch - Topic](https://youtube.com/channel/UCpSKmO2Ojt_cUsJYKDzD2iQ) — 2K subs, 平均119,861再生
- [switch - Topic](https://youtube.com/channel/UClOnd10SsPpk4Xeb5IrNFzA) — 108K subs, 平均4,448再生

> seed keyword `"switch"` がNintendo Switch関連channelを引っ張っており、Science & Technology genreの実態を反映していない。

#### 4. Comedy（Score 0.314、PR 9.7x）

代表的なchannel:
- [【広告なし】オードリーのANNラジオ](https://youtube.com/channel/UCwHZ7yDSzbYcEWsZOMEXLGg) — 14K subs, 平均576,745再生（非公式切り抜き系の典型）
- [オードリー若林の東京ドームへの道](https://youtube.com/channel/UCR2-8yf3HYwYCcbA_aUWOJA) — 313K subs, 平均569,904再生
- [【公式】オードリーさん、ぜひ会ってほしい人がいるんです。](https://youtube.com/channel/UCNdhTKY9QYzeVQGF2xtaHKQ) — 637K subs, 平均125,983再生
- [【公式】オードリーのNFL倶楽部](https://youtube.com/channel/UC5bKp_ooXFHvP69gOLk0Pxw) — 62K subs, 平均42,276再生

> seed keyword `"オードリー"` により芸人オードリー関連に集中。Comedy genreの全体像ではない。

#### 6. Gaming（Score 0.200）

代表的なchannel:
- [Minecraft公式](https://youtube.com/channel/UC1sELGmy5jp5fQUugmuYlXQ) — 19.4M subs, 平均1,346,823再生
- [なしろ【マイクラ】](https://youtube.com/channel/UCAgQ4Slp2bvdLbrNnBZyXFw) — 495K subs, 平均100,027再生
- [SEVENのマイクラ建築](https://youtube.com/channel/UCm6PVvurw_4XJjzbyv8hi3Q) — 502K subs, 平均19,577再生
- [True【マイクラ】](https://youtube.com/channel/UCT4UYgOwt5zfqE1UO3nTxAA) — 39K subs, 平均14,910再生

#### 11. Entertainment（Score 0.086）

代表的なchannel:
- [そろ谷のアニメっち](https://youtube.com/channel/UCLqv4vhAFj140bSh4W3EDDA) — 1.2M subs, 平均1,553,262再生
- [【アニメ】あたしンち公式チャンネル](https://youtube.com/channel/UCkwJXqFl-9VVvK9udYCFjMw) — 1.7M subs, 平均110,275再生
- [アニメタイムズ公式](https://youtube.com/channel/UC9iC5kXiHNJCCDjEi1lD3UA) — 1.5M subs, 平均247,953再生
- [東映アニメーションミュージアム](https://youtube.com/channel/UCUUekIrulAiJnUOawqBRwZQ) — 1.5M subs, 平均10,148再生

> large channel比率80%。既存大手が支配しており新規参入は困難。

#### 12. News & Politics（最下位、Score 0.000）

代表的なchannel:
- [TBS NEWS DIG](https://youtube.com/channel/UC6AG81pAkf6Lbi_1VC5NmPA) — 3.3M subs, 平均6,397再生
- [ウェザーニュース](https://youtube.com/channel/UCNsidkYpIAQ4QaufptQBPHQ) — 1.6M subs, 平均5,454再生
- [産経ニュース](https://youtube.com/channel/UC1zYGo1jIIjMVDTLL3dydow) — 692K subs, 平均16,674再生

---

## Cross-Region Ranking（US + JP 総合）

| # | Genre | 平均Score | Viability | US Score | JP Score |
|---|-------|----------|-----------|----------|----------|
| 1 | Comedy | 0.541 | strong | 0.77 | 0.31 |
| 2 | Science & Technology | 0.541 | strong | 0.62 | 0.47 |
| 3 | Film & Animation | 0.463 | regional | 0.12 | 0.81 |
| 4 | Sports | 0.439 | regional | 0.77 | 0.11 |
| 5 | Howto & Style | 0.437 | regional | 0.63 | 0.24 |
| 6 | Music | 0.379 | regional | 0.63 | 0.13 |
| 7 | Autos & Vehicles | 0.361 | regional | 0.63 | 0.09 |
| 8 | Pets & Animals | 0.275 | regional | 0.08 | 0.47 |
| 9 | People & Blogs | 0.154 | regional | 0.17 | 0.13 |
| 10 | Gaming | 0.153 | regional | 0.11 | 0.20 |

- **strong**: 両regionでscoreが安定して高い
- **regional**: 一方のregionに偏っている

---

## Data品質の問題（重要）

今回の分析結果には以下の重大な品質問題があり、数値をそのまま信頼することはできない。

### 1. Seed keyword `"the"` 問題（US）

US regionでは、多くのgenre（Sports, Comedy, Autos & Vehicles, Howto & Style, Science & Technology）でseed keywordが `"the"` になっている。これはtrending動画のtagsから最頻出語を抽出した結果だが、`"the"` は英語の冠詞であり、genreを特徴づける能力がゼロ。

**影響:**
- Sports, Comedy, Autos & Vehicles, Howto & Style が**ほぼ同じchannel群**を分析している
  - 例: [The Weeknd](https://youtube.com/channel/UC0WP5P-ufpRfjbNrmOWwLBQ)がSportsにもComedyにも出現（音楽artist）
  - 例: [The Singing Walrus](https://youtube.com/channel/UCe1VpF4wS_kdcjyTRSXBcnQ)がScience & Technologyに出現（子供向け教育music）
- Sports 1位とComedy 2位のscoreが完全に同一（0.767）なのはこのため
- **これらのgenre間の順位差は意味をなさない**

### 2. Seed keyword `"shorts"` 重複（US, JP）

`"shorts"` というseed keywordにより、Film & Animation と Entertainment が完全に同一のchannel群になっている（US）。

- [DUST](https://youtube.com/channel/UC7sDT8jZ76VLV1u__krUutA), [ReelShort](https://youtube.com/channel/UCTP044C5E93eiI0xFM6eVUQ) 等がどちらにも出現
- Film & Animation = Entertainment のscoreが一致（0.119）

### 3. JP region seed keyword バイアス

JP regionでは、seed keywordがtrending動画の特定タイトルに引きずられている:
- Film & Animation: `"暗金ウシジマくん外伝"` → ウシジマくん関連channel only
- Pets & Animals: `"遺伝子ガチャに失敗した猫"` → バズ動画タイトル、ペット系ではないchannel混入
- Science & Technology: `"switch"` → Nintendo Switch関連、tech channelではない

### 4. CJK tokenization未対応

日本語のtagsはspace区切りでのtokenizeが不可能なため、seed keyword抽出がそもそも正しく動作しない。
例: タグ `"サッカー日本代表"` が1語として扱われ、より汎用的な `"サッカー"` が抽出されない。

### 5. Stopword filterの欠如

英語の一般的なstopword（`the`, `a`, `and`, `is` など）をseed keyword候補から除外する処理がない。

---

## 改善提案

上記の問題を解決するために、以下の改修を推奨する。

### 優先度: HIGH

1. **Stopword filter追加** — 英語stopword list（the, a, an, is, are, of, in, to, for, etc.）をseed keyword抽出から除外
2. **Seed keyword多様性** — 1 genreにつき複数のseed keywordで検索し、channel重複を排除
3. **Channel-genre一致性検証** — 取得したchannelの公式categoryIdが対象genreと一致するかvalidation

### 優先度: MEDIUM

4. **CJK tokenizer導入** — `tiny-segmenter` や `kuromoji` 等の日本語形態素解析libraryでtagsを分割
5. **Channel重複排除** — 同一channelが複数genreにsampleされている場合、最もscoreの高いgenreにのみassign
6. **Sample数の増加** — 1 genre 6 channelでは統計的信頼性が低い。最低20 channelは必要

### 優先度: LOW

7. **Region別seed keyword** — US/JPで独立したseed keyword抽出logic
8. **Trending期間の拡大** — 1回のsnapshotではなく、複数日のtrending dataを蓄積して安定性を確保

---

## 結論

### 信頼できる知見

- **News & Politicsは参入不可**: US/JP共に最下位。大手mediaが独占し、subs対比の再生数が極端に低い
- **Gamingは大channel支配**: US [Royalty Gaming](https://youtube.com/channel/UCemhZ2At2lgifTJLClGCz9A)（9.7M avg views）のような巨大channelが市場を支配
- **JP Film & Animationの高PR**: [WOWOWO](https://youtube.com/channel/UCeAF5wm1MJbA0NiwNbpv4IA)（29K subs, 225万avg views）のように、小規模channelでも爆発的なreachが可能な市場

### 信頼できない知見（要再分析）

- US Top 6 genreの順位（seed keyword問題により、ほぼ同じchannelを分析している）
- JP Film & Animation / Science & Technology / Pets & Animalsの絶対score（seed keywordバイアスが大きい）
- Cross-region viabilityの判定（regionごとの元dataに問題があるため）

### 次のステップ

1. Stopword filter + 複数seed keyword対応を実装
2. 再度 `node scripts/discover-niche.js --skip-cache --regions US,JP` を実行
3. 改善後のdataで再分析・再report
