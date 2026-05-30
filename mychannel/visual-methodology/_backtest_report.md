# Backtest Report — PLAYBOOK 適用検証

> 対象: `mychannel/output/script.md` (Survivorship bias 26分 long-form, 1人 narrator, English script)
> 日時: 2026-05-30
> 目的: PRINCIPLES / PLAYBOOK / axis が **既存 script に対して有用な改善案を生成できるか** の検証

---

## 1. 対象 script の自己分類

PLAYBOOK の状況分類で言うと:
- **B5** (心理学・解説系) — メイン
- **B1** (long-form 20分+) — 形式
- **A1** (抽象テーマを面白く語る) — テーマ
- **A4** (哲学・社会・科学テーマの物語化) — テーマ
- **E3** (教育的に伝える) — 目的
- **C5** (再視聴を誘発) — 目的 (末尾でレイヤー予告)

副次的に E1 (バズ) と E5 (感情を揺らす) も狙う構造。

---

## 2. 既に岡田メソッドを実装している点 (good)

PLAYBOOK 観点で **既に満たしている** 設計判断:

| PRINCIPLES 原則 | script 内の実装 |
|---|---|
| 原則 1 (表層→深層) | "the oldest belief" を肯定 → "the world you live in has a problem with the missing hunters" で裏返す |
| 原則 2 (絵に語らせる) | 開幕 `[Visual: silhouette of a WW2 bomber from above]` で抽象を一枚絵に圧縮 |
| 原則 3 (観客に作業させる) | "Hold that. We're going to come back to it" の deferral (3 回設置済) |
| 原則 4 (重さを包む) | Phase 4 の "I am going to admit something" 自己開示で防衛解除 |
| 原則 5 (善悪固定しない) | "The survivor cannot tell signal from noise from inside the sample" — 被害者でも加害者でもない構造批評 |
| 原則 6 (ギアチェンジ) | Phase 1-5 で 章境界を明確化、各 Phase に "principle" 注釈 |
| 原則 7 (神話・歴史接続) | 300,000 年の進化史 → 1943 Wald → 1973 Tversky/Kahneman → 現代 SNS の歴史的弧 |
| 原則 8 (未体験を残す) | "we still haven't reached the deepest layer" のレイヤー予告 |

**結論**: 8 原則中 8 つを既に意識している。岡田メソッドの中核は既に script に染み込んでいる。

---

## 3. PLAYBOOK 適用で見えた改善案 (5 点)

### 改善 1: Visual ディレクティブを岡田 frame で強化
**現状**: `[Visual: silhouette of a WW2 bomber from above, slowly filling with red dots over the wings, tail, fuselage. The engines and cockpit stay clean. The clean areas pulse with a faint, unsettling warning glow.]`
→ 既に強い視覚演出。
**改善案**: [[axis/B_視覚演出]] 原則 1 (絵は説明ではなく証拠) に従い、後の Phase で **同じ bomber の絵を再登場** させて意味を反転 (Phase 1 では「データに見える」、Phase 5 では「あなた自身が clean area に armor していない bomber」)。
**該当**: PRINCIPLES 原則 1 + 原則 8 (再視聴の報酬)

### 改善 2: アバター・キャラクター不在 → 「敵の擬人化」で補強
**現状**: narrator 1 人 + 抽象 viz。
**改善案**: [[axis/A_キャラクター造形#28]] 「敵の擬人化」を適用 — Survivorship bias を「アルゴリズム」「出版社」「インフルエンサー」という 3 体の擬人化された敵キャラとして配置。Phase 3 ですでに "industries that feed on it" と分節されているので、各 industry に specific な擬人キャラを充てると視聴者の記憶定着が劇的に上がる。
**該当**: PLAYBOOK D1 (キャラなし制約) の対処、PRINCIPLES 原則 2 (絵に語らせる)

### 改善 3: 「沈黙の active 化」が script レベルで設計されていない
**現状**: script は narration 連続。`[Visual: ...]` はあるが `[Pacing: silence 2s]` のような明示的な間ディレクティブがない。
**改善案**: [[axis/C_音と間]] 原則 3 (沈黙は観客の作業時間)。各 Phase の最も重い 1 文の **後に 2-3 秒の無音 + 同じ visual の hold** を明示する。
  例: Phase 2 の "Survivorship bias." の直後 → `[Pacing: 3s silence, hold on bomber silhouette]`
**該当**: PRINCIPLES 原則 3

### 改善 4: 「未体験を残す」がやや弱い
**現状**: 末尾の Phase で結論を提示している (full read 必要)。
**改善案**: [[axis/G_体験設計#4]] (80% 理解で満足、20% を次回観察点に) と [[axis/E_視聴者心理操作#22]] を組み合わせ、末尾に **「この動画でも survivorship bias を 1 個入れてある。気づけたか?」** のような メタ仕掛けを置く。コメント駆動 + 再視聴が同時に起きる (PRINCIPLES 原則 8)。
**該当**: PLAYBOOK C4 (語りたくさせる) + C5 (再視聴)

### 改善 5: テンポのギアチェンジが Phase 境界だけ
**現状**: 各 Phase 内では narration テンポ一定。
**改善案**: [[axis/C_音と間]] 原則 4 (ギアチェンジで世界の入口)。各 Phase の **中盤に 1 度、急激なテンポ落ち or 加速** を入れる。例: Phase 3 のレイヤー 1→2→3 切替時に `[Pacing: hard cut, BGM swap, 1s silence]`。
**該当**: PRINCIPLES 原則 6

---

## 4. backtest 結果の評価

### 有用性: ◎
PLAYBOOK の状況 (B5 + B1 + A1 + E3) から該当 axis に飛び、技法 # を引いて改善案を出す流れが **自然に機能した**。新規動画企画でも同じ手順が使えると確認。

### 抽象度: ○
PRINCIPLES (8 原則) は良い精度で動画の総合評価軸として機能。score シートとして使える。

### 改善点 (PLAYBOOK 自身の):
- (a) script に対する **直接的な template** (例: `[Visual: ...]` `[Pacing: ...]` の標準形) が PLAYBOOK にない。後で `_script_directive_template.md` として追加すると良い。
- (b) axis 技法カタログの「技法 #N」が PLAYBOOK 内で linked text として機能しない (markdown anchor の解決が手動)。Obsidian 移植時に block reference に変換すると良い。

---

## 5. 次の応用 hint

この backtest を踏まえると、 PLAYBOOK の **使い方手順** (PLAYBOOK.md `## 使い方の手順`) は概ね妥当。
ただし長尺 script に対しては「**まず PRINCIPLES でスコアする → 弱い原則を特定 → 該当 axis で技法選定**」の方が実践的。
PLAYBOOK 次版 (v2) で「スコアリングシート」を追加する案を保留。

---

## 6. 結論

- 既存 script は岡田メソッド 8 原則を高い水準で実装済 (改めて優秀な script だと確認)
- PLAYBOOK + axis 技法で **5 個の具体的改善案** が短時間で生成できた → 知識 base として **機能している**
- 今後 claude が動画企画する際、この knowledge base を引けば「岡田メソッド準拠 + 具体技法選定」が再現可能
