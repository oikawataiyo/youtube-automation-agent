---
type: index
extracted_at: 2026-05-30
project: youtube-automation-agent / visual-methodology
sources: Obsidian Clippings 17 file (岡田斗司夫 解説 transcript)
---

# INDEX — 岡田斗司夫メソッド 映像演出 knowledge base

## これは何か
岡田斗司夫が YouTube で語った映像作品・書籍解説 17 本から、
**「面白い映像 / 物語 / 演出を作る再現可能な方法論」** だけを抽出・体系化した knowledge base。

claude (このレポジトリ) が今後動画を企画 / 構成 / 演出指定するときに、
最速で「使える技法」を引けるように設計されている。

## claude のための使い方 (recommended 順序)

1. **PRINCIPLES.md** を読む — 動画企画時、最初に思い出す top-level 原則 7-10 個
2. **PLAYBOOK.md** で目的・状況に合う axis & 技法を逆引き
3. 該当 `axis/*.md` を読み、技法カタログから具体技法を選定
4. 必要なら `extracted/*.md` で原典の岡田の発言を確認
5. 動画 script に演出指定 (`[Visual: ...]`) として落とし込む

## ディレクトリ構成

```
mychannel/visual-methodology/
├── INDEX.md            ← この file (MOC)
├── PRINCIPLES.md       ← top-level 原則 (蒸留)
├── PLAYBOOK.md         ← 逆引き辞書 (状況 → 技法)
├── axis/               ← 7 axis 体系化済 reference
│   ├── A_キャラクター造形.md
│   ├── B_視覚演出.md
│   ├── C_音と間.md
│   ├── D_物語構造.md
│   ├── E_視聴者心理操作.md
│   ├── F_テーマの depth.md
│   └── G_体験設計.md
├── extracted/          ← 作品ごとの抽出済 markdown (原典への入口)
│   └── (17 file)
├── _inventory.md       ← Clippings 21 file の分類記録
├── _extract_prompt.md  ← Phase 2 で使った抽出 prompt template
├── _axis_prompt_common.md ← Phase 3 で使った axis prompt
└── _*_prompt.txt       ← 各 codex 起動用 prompt
```

## extracted 一覧 (17 file、原典への入口)

### アニメ・映画解説 (12)
| file | 1行サマリ |
|---|---|
| [[extracted/火垂るの墓_UG226]] | 現在に囚われる死者の反復構造 |
| [[extracted/火垂るの墓_ゼミ226]] | 涙を疑わせる文学アニメ構造 |
| [[extracted/かぐや姫の物語_UG231]] | 超能力が周囲を歪める罪と罰 |
| [[extracted/千と千尋_UG306_前編]] | 神域廃墟をホラー導入として読む |
| [[extracted/千と千尋_UG307_後編]] | 油屋をジブリの自画像として読む |
| [[extracted/OnYourMark_UG311]] | 希望譚を多層レイヤーで反転させる |
| [[extracted/ブレードランナー_UG]] | 物語より都市体験を主役にする SF |
| [[extracted/もののけ姫_UG]] | 冒頭10分に神話構造を埋める |
| [[extracted/ジョーカー_UG]] | 笑いで不快感と共感を操る映画 |
| [[extracted/ナウシカ_開拓史編_UG]] | 人工生存圏としての風の谷開拓史 |
| [[extracted/となりのトトロ_UG]] | トトロに隠された古代神の敗北史 |
| [[extracted/ディズニーランド_ゼミ61]] | 夢の国を支える没入体験の打算設計 |

### 書籍 / 思考方法論 (5)
| file | 1行サマリ |
|---|---|
| [[extracted/ホモデウス_UG]] | 三大厄克服後の空白を物語化 |
| [[extracted/世にも奇妙な人体実験_UG]] | 不快医学史を知的笑いに変換 |
| [[extracted/能力主義_ゼミ404]] | 能力主義の見えない差別を可視化 |
| [[extracted/スマホ脳_UG]] | スマホ依存を生存本能で説明 |
| [[extracted/思考方法論_ゼミ315]] | 悩みを分解する岡田式メタ思考 |

## axis 一覧 (7 軸、技法カタログ)

| axis | 内容 | 主担当領域 |
|---|---|---|
| [[axis/A_キャラクター造形]] | キャラデフォルメ・表情記号・シンボル・所属の不安定さ | 人物・象徴 |
| [[axis/B_視覚演出]] | 色彩・光影・構図・カメラワーク・カット編集・美術 | 画面そのもの |
| [[axis/C_音と間]] | BGM・効果音・台詞リズム・間・テンポ・楽曲構造同期 | 時間 / 聴覚 |
| [[axis/D_物語構造]] | 起承転結崩し・伏線・メタファー・メタ構造・レイヤー反転 | ストーリー設計 |
| [[axis/E_視聴者心理操作]] | 期待誘導・共感・不快感制御・解釈余白・二重視点 | 観客の認知 |
| [[axis/F_テーマの depth]] | 表層と深層・社会批評・神話援用・抽象を具象化 | 意味 / 主題 |
| [[axis/G_体験設計]] | 動線・没入 trigger・期待値管理・余韻・語りたくなる仕掛け | 体験 / 没入 |

## top-level 文書

- [[PRINCIPLES]] — 7 axis を横断する岡田メソッド top-level 原則
- [[PLAYBOOK]] — 目的・状況からの逆引き辞書

## 統計

- 原典 Clipping: 17 file (約 1.3 MB)
- 抽出済 (extracted): 17 file (約 400 KB)
- 体系化済 (axis): 7 file (約 155 KB)
- 中核原則 (axis 内合計): 44 個
- 技法カタログ (axis 内合計): 210 行
- 岡田 frame (独自命名分析): 146 個
- PLAYBOOK 項目: axis 内 71 + 横断 PLAYBOOK で更に拡張

## 更新方針

### 新しい岡田 Clipping が増えた時
1. `_inventory.md` に追加
2. `_extract_prompt.md` の template で抽出 → `extracted/{name}.md`
3. 関連 `axis/*.md` の技法カタログに該当行を追記 (横断的に再生成は不要)
4. 必要なら PRINCIPLES / PLAYBOOK を refine

### 新しい知見 (岡田以外の演出論) を追加する時
- 別 knowledge base として並列 (例: `shinkai-methodology/`, `oshii-methodology/`) を作る
- この knowledge base は岡田斗司夫メソッドに閉じる

### Obsidian 正本と本 project の関係
- 正本: `C:/Users/oioce/OneDrive/obsidian_vault/tech-knowledge/岡田斗司夫アニメ方法論/`
- 本 project (`mychannel/visual-methodology/`): **読み取り専用 copy**
- 編集は Obsidian 側で行い、`scripts/sync_visual_methodology.sh` で同期 (Git Bash で `bash scripts/sync_visual_methodology.sh`)

## 関連
- 元 Clipping ディレクトリ: `C:/Users/oioce/OneDrive/obsidian_vault/Clippings/`
- 除外 file (4): AI youtube 自動化 / Codex 講座×2 / コカコーラ雑学 — `_inventory.md` 参照
- 既存台本: `mychannel/output/script.md` (survivorship bias long-form) — Phase 4 backtest 対象
