# Plan: 岡田斗司夫メソッドの体系化 → claude 用 visual knowledge base 構築

## 1. 目的 (Restatement)

`C:/Users/oioce/OneDrive/obsidian_vault/Clippings/` 配下の岡田斗司夫関連 15 file (アニメ作品解説 10 + 書籍解説 5) から、
「面白い映像 / 物語 / 演出の方法論」を抽出・体系化し、
**今後 claude がこのレポジトリで動画を企画・制作するときに最も引きやすい形** の knowledge base を構築する。

### 重要 pivot (user 確認済み)
- moyo チャンネルの「シンプルキャラ動画」前提は白紙化
- ビジュアル形式 (キャラ / 抽象 / 実写ライク / モーショングラフィック) は問わない
- 「演出 / 物語 / 心理操作」全般を網羅する

### 最終 deliverable
1. **Obsidian 正本**: `tech-knowledge/岡田斗司夫アニメ方法論/` 配下に taxonomy 化された複数 note + INDEX
2. **Project copy**: `mychannel/visual-methodology/` に同内容を copy (Windows なので symlink 不可)
3. **claude interface**: 「こんな動画を作りたい → 使える技法」を逆引きできる PLAYBOOK.md

---

## 2. 対象 file 一覧 (15 件 + 除外 6 件)

### 採用 (15)
**アニメ・映画解説 (10)**
1. 火垂るの墓 (UG226)
2. 火垂るの墓 (岡田斗司夫ゼミ226) — 同一作品の別 source、補完用
3. かぐや姫の物語 (UG231)
4. 千と千尋の神隠し (UG306)
5. 千と千尋の神隠し (UG307 後編)
6. On Your Mark (UG311)
7. ブレードランナー (UG)
8. もののけ姫 (UG)
9. ジョーカー (UG)
10. ナウシカ (UG 独占公開) — 国宝級のお宝「王蟲の●●」
11. となりのトトロ (ジブリ特集7)
12. ディズニーランド徹底解説 (ゼミ61) — 体験設計の方法論として

**書籍解説 (5)**
13. ホモ・デウス (ハラリ)
14. 世にも奇妙な人体実験の歴史
15. 実力も運のうち〜能力主義は正義か (サンデル)
16. スマホ脳
17. 95%の悩みを解決する思考方法 (ゼミ315)

→ 実数: アニメ 11 (※10 と書いたが On Your Mark 1,2 / ナウシカ Level 1,2 等の連番含めると 11) + 書籍 5 = 16。Phase 1 で再確認する。

### 除外 (6)
- `How I Built a $15,000/Month Faceless YouTube System With AI` — AI youtube 自動化、別 topic
- `Master 97% of Codex in 1 Hour` — Codex 講座
- `NVIDIA が Codex で研究を10倍速にした全手法` — Codex 事例
- `麻薬中毒が作った！？コカコーラの黒歴史` — 雑学系、演出方法論薄い
- `On Your Mark Level 1,2` 補足判定で 1 file 統合可

---

## 3. Phase 設計

### Phase 1: file inventory 確定 (Claude 直、〜10分)
- Clippings 内の岡田斗司夫関連 file を 1 行サマリ化 (作品名 / 主題 / 概算サイズ)
- 重複・続編関係を整理し最終リスト確定 (15±1 file)
- `mychannel/visual-methodology/_inventory.md` に書き出す

### Phase 2: 並列抽出 (Codex 委譲 5並列、〜40-60分)
**Why Codex 委譲**: file が平均 60-100KB と大きく、15 file 全部を Claude context に読むと爆発する。
Codex に file 単位で抽出させ、最終 markdown のみ Claude に戻す (CLAUDE.md §8 の token saving パターン)。

- file を 5 batch に分割 (各 3 file)
- 各 batch を `codex exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox` で並列起動
  (Windows sandbox bypass 必須、stdin に `</dev/null` 添付 — memory: codex_windows_sandbox / codex_background_stdin)
- 抽出 template (各 file ごと):
  ```
  # {作品名} ({監督/著者}, {年})
  ## 1行サマリ
  ## 岡田の核心テーゼ (なぜ刺さるか)
  ## 演出技法 (具体)
    - キャラ造形 / 表情 / シンボル
    - 色 / 光 / 構図 / カット
    - 音 / 間 / リズム
  ## 物語構造の技法
    - 起承転結の崩し / 伏線 / メタファー / メタ構造 / ダブルミーニング
  ## 視聴者心理操作
    - 期待裏切り / 共感誘導 / 不快感制御 / 知識補完欲求
  ## 岡田 frame (独自命名分析)
    - 「○○の法則」「○○構造」など
  ## 引用 (鋭い 1-3 文)
  ```
- 中間 output: `mychannel/visual-methodology/extracted/{filename}.md`
- 各 codex task の戻り: 「変更 file 一覧 + 抽出済 1行サマリ」のみ

### Phase 3: 体系化 (Claude 直、〜30-40分)
Phase 2 の `extracted/*.md` 全部を読み、axis 横断で再構成する。

**Axis 候補 (Phase 3 開始時に refine)**
- **A. キャラクター造形** (デフォルメ・表情記号化・シンボル化)
- **B. 視覚演出** (色彩・光・構図・カメラワーク・カット編集)
- **C. 音と間** (BGM の効果・無音の使い方・テンポ操作)
- **D. 物語構造** (起承転結の崩し方・伏線・メタファー・メタ構造)
- **E. 視聴者心理操作** (期待裏切り・共感・不快感制御・解釈余白)
- **F. テーマの depth** (表層と深層・社会批評・神話的構造)
- **G. 体験設計** (ディズニーランド / 没入設計の汎用化)

各 axis を 1 markdown にまとめ、出典は `[[extracted/{filename}]]` で wikilink。

output: `mychannel/visual-methodology/axis/{A-G}.md`

### Phase 4: claude interface 作成 (Claude 直、〜20-30分)
claude が後で動画を作るときに最速で引ける形を整える。

**生成 file**:
- `INDEX.md` — 全 note の MOC (Map of Content) + 1 行説明
- `PRINCIPLES.md` — 全 axis 横断で蒸留した「岡田メソッド 5-10 原則」(top-level)
- `PLAYBOOK.md` — 逆引き辞書: 「こんな動画を作りたい (例: 退屈な概念を魅力的に / 不快なテーマを見せる / 抽象を具象化する) → 関連 axis & 技法」
- `SKILL.md` (option) — claude の skill として呼べる形に。 `.claude/skills/visual-methodology/SKILL.md` を新設するか、既存 skill に embed するか Phase 4 終盤で判断

**backtest**:
- 既存 `mychannel/script/` の 1-2 本を題材に「この台本に最適な演出は?」と PLAYBOOK で query → 妥当な答えが出るか手動確認

### Phase 5: Obsidian 配置 + project copy (Claude 直、〜10分)
- Obsidian: `tech-knowledge/岡田斗司夫アニメ方法論/` に全 note を copy (Obsidian flavored markdown、wikilink で繋ぐ)
- Project: `mychannel/visual-methodology/` に同じものを copy (Windows 環境 = symlink 不可、cp で同期)
- wikilink 整合性確認 (Obsidian 側で破断しないこと)
- `.claude/skills/visual-methodology/SKILL.md` (Phase 4 で作る場合) は Project 側のみ

---

## 4. Risk & Mitigation

| Risk | 影響 | Mitigation |
|---|---|---|
| Codex 抽出の品質バラつき | 体系化が荒れる | Phase 2 prompt に template + 「岡田の脱線は捨て、方法論のみ」filter 条件を明示 |
| File が長すぎて Codex も落ちる | Phase 2 失敗 | 1 batch = 3 file 程度に制限、Codex 1 instance あたり context 余裕を持たせる |
| Axis 設計が早すぎて再分類が増える | 手戻り | Phase 3 開始時に Phase 2 の全抽出を一度ざっと読み、axis を refine してから本格分類 |
| claude interface が抽象的で使えない | 最終 deliverable 失敗 | Phase 4 で実台本 backtest を必ず実施 |
| Obsidian と Project で乖離 | 二重管理地獄 | 正本は Obsidian、Project は **読み取り専用 copy** と運用ルール化、INDEX.md にその旨記載 |
| 岡田の独自用語 (岡田 frame) が場面依存で再現性低い | 体系化困難 | Phase 3 で「他作品でも応用可能 / 単発分析」を区別して記録 |

---

## 5. Acceptance criteria

- [ ] Phase 1: file inventory が 15±1 file で確定し `_inventory.md` に記録
- [ ] Phase 2: 全 file の抽出 markdown が `extracted/` に揃う
- [ ] Phase 3: 5-7 axis の markdown が `axis/` に揃う
- [ ] Phase 4: INDEX / PRINCIPLES / PLAYBOOK の 3 file が完成、実台本 backtest 1-2 本実施
- [ ] Phase 5: Obsidian と Project の両方に同じ内容が配置、wikilink 健全

---

## 6. Out of scope (今回はやらない)

- 実際の animation 制作 / Adobe AE 等の tool 選定
- 競合チャンネル分析 (YouTube Data API で他 ch の動画を解析する等)
- moyo チャンネル固有の brand guideline 策定
- 岡田斗司夫以外の演出論 (新海誠論、押井守論など) の追加

これらは別 plan で扱う。

---

## 7. 概算工数

| Phase | 工数 | 主体 |
|---|---|---|
| 1. inventory | 10分 | Claude |
| 2. 抽出 | 40-60分 | Codex 5並列 |
| 3. 体系化 | 30-40分 | Claude |
| 4. interface | 20-30分 | Claude |
| 5. 配置 | 10分 | Claude |
| **合計** | **約 2-2.5 時間** | — |

---

## 8. 実行順序の依存

```
Phase 1 (inventory)
   ↓
Phase 2 (Codex 5 並列、互いに独立)
   ↓ (全 5 完了待ち)
Phase 3 (axis 体系化)
   ↓
Phase 4 (interface) — backtest で台本 read が必要
   ↓
Phase 5 (Obsidian + project 配置)
```

Phase 2 内部は完全並列。それ以外は順序依存。
