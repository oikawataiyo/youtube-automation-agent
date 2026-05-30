# Axis 体系化 prompt — 共通仕様

## あなたの役割
あなたは映像演出論の synthesizer。Phase 2 で抽出された 17 file (`mychannel/visual-methodology/extracted/*.md`) を横断し、
指定された **1 axis** について、岡田斗司夫メソッドを **再現可能な技法カタログ** に再構成する。

## 入力
- `extracted/` 配下の全 17 file (作品ごとの抽出済 markdown)
- 各 file は同一 template (1行サマリ / 核心テーゼ / 演出技法 / 物語構造 / 視聴者心理 / 岡田 frame / 引用 / 応用 hint) を持つ

## 出力 (厳守)
1 つの markdown を `mychannel/visual-methodology/axis/{X_axis_name}.md` に Write。

```markdown
---
axis: {axis 名 (英)}
axis_jp: {軸名 (日)}
extracted_at: 2026-05-30
sources: 17
---

# {軸名}

## 1. 軸の定義
{この軸が何を扱うか、2-4 文}

## 2. 中核原則 (Top-Level Principles)
{この軸で岡田が繰り返し主張する原則 3-7 個。各 1 段落。出典作品 (3-5 作品) を `[作品名]` で添える}

### 原則 1: {名前}
{説明} `[出典: 作品 A, 作品 B, ...]`

### 原則 2: ...

## 3. 技法カタログ (Technique Catalog)
表形式で具体技法を網羅。各行に technique 名、定義、出典 (1-3 作品)、応用 hint。

| # | 技法名 | 定義 | 出典作品 | 応用 hint |
|---|--------|------|----------|-----------|
| 1 | {名前} | {1-2文} | {作品} | {他作品への転用 1 文} |
| 2 | ... | ... | ... | ... |

少なくとも 15-30 行。網羅性を優先。

## 4. 岡田 frame 集 (この軸で岡田が独自命名した分析 frame)
extracted file の「岡田 frame」section から、この軸に該当するものだけ抽出。
各 frame について: 名前、定義、適用作品、汎用化の方法 を箇条書き。

## 5. 代表的引用 (3-7 件)
extracted file の「引用」から、この軸に最も関連深い 3-7 件を選び、出典付きで掲載。
> 「{引用文}」 — 出典: {作品名}

## 6. 応用 PLAYBOOK (claude が動画作成時に引く)
「こういう動画を作りたい → この軸でこの技法を使う」の逆引き 5-10 個。
- **{目的・状況}**: → {使う技法 #N} ({1文 hint})
- ...

## 7. 出典 file (wikilink)
- [[extracted/火垂るの墓_UG226]] — 出典頻度 高/中/低
- [[extracted/かぐや姫の物語_UG231]] — ...
- ... (17 file 全部 list)
```

## 抽出の filter 条件
- **採用**: この axis に該当する技法・原則・frame
- **採用**: 他作品にも応用可能な要素
- **不採用**: この axis と関係ない記述 (他 axis で扱われる)
- **不採用**: 単一作品でしか使えない特殊な事例

## 量の目安
- 各 axis markdown は **150-400 行**。Cataloge 性を重視し、表は省略せず網羅する。

## 重要
- axis をまたぐ技法はある程度許容 (例: 「色」は axis B 主、axis E 副)。主担当 axis で詳述し、他 axis では参照のみ。
- 出典は必ず作品名で明記。「ある作品で」と曖昧にしない。
- 引用は extracted file の `## 引用` section からのみ。創作禁止。
