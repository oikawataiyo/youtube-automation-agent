# Task: Extract discourse / structural techniques from 6 Okada Toshio video transcripts

You will read 6 transcript files from the Obsidian vault and produce ONE consolidated digest file. Do NOT summarize content. Extract STRUCTURE and DISCOURSE TECHNIQUES only.

## Files to read

Read all 6 markdown files in this directory:
`C:/Users/oioce/OneDrive/obsidian_vault/Clippings/`

Specifically these 6 (knowledge / society / self-help focus — MOST RELEVANT to the target script which is about Survivorship Bias):
1. `【UG】神になったサル『ホモ・デウス』（ユヴァル・ノア・ハラリ 著）徹底解説.md`
2. `スマホは「持っているだけ」でバカになる！精神医学最前線『スマホ脳』徹底解説 384  OTAKING explains The Real Happy Pill.md`
3. `サンデル教授の挑戦状！『実力も運のうち～能力主義は正義か？』を語る SDGsを掲げる人類が解決するべき真の課題 岡田斗司夫ゼミ＃404（2021.7.25） OTAKING Seminar 404.md`
4. `【UG】読書特集（３）解説『世にも奇妙な人体実験の歴史』 OTAKING explains Smoking Ears and Screaming Teeth.md`
5. `麻薬中毒が作った！？『コカコーラの黒歴史』全て話します。.md`
6. `岡田斗司夫ゼミ315（201912）95％の悩みを解決する思考方法～悩みのるつぼ卒業記念講演大阪より.md`

The actual transcript content begins after a `## Transcript` heading. The earlier metadata / promotional text can be ignored.

## Background framework

- **16 hook types (H1-H16)**: H1 逆張り命題 / H2 禁断感演出 / H3 定量エスカレーション / H4 予告編トレーラー / H5 結論先行圧縮 / H6 評価二極化提示 / H7 「知ってるのに説明できない」矛盾指摘 / H8 期待裏切り宣言 / H9 衝撃命題先出し / H10 レベル構造予告 / H11 権威者意外行動 / H12 自己体験告白 / H13 「本が足りない」問題提起 / H14 自己開示共感形成 / H15 「聞いたら戻れない」脅迫 / H16 百万再生権威づけ
- **Reveal markers**: 「実はですね」「実は〜なんです」「これあの〜なんですよ」「なんでかっていうと」「ここが面白いんだけども」「普通の人は気づかない」「覚えておいてください」 etc
- **Evidence speed control**: 「後で説明する」「まだ序章」「これだけでもすごいが、もっと深い話がある」
- **Strategic digression**: tangents that loop back
- **Meta connection (M1-M7)**: phrases that scale out from work → society → civilization

## Bonus extraction for this batch

These 6 are knowledge-heavy / book-explanation style — closest in genre to the target script (Survivorship Bias). For each video, ALSO add:

**Number-driven phrasings (1-2 examples):** Verbatim phrases where Okada uses specific numbers/statistics to land a point (e.g. 「1日2600回」「人口の15%」). Note the *form* of the construction.

**Pop-culture translation phrasings (1 example, if found):** Verbatim phrases where Okada translates an abstract idea into a familiar pop-culture reference (e.g. 「アベンジャーズ・シビルウォー」 = 南北戦争).

## Output requirements

Write the digest to: `C:/Users/oioce/dev/youtube-automation-agent/mychannel/output/_research/codex_digest_batch3.md`

Use EXACTLY this template, one section per video:

```markdown
# Batch 3 Digest — Knowledge / Society / Self-help (genre-matched to Survivorship Bias)

## [Video title — short form]
**File:** [filename]
**Hook type identification (1 or 2 from H1-H16):** [type code + 1-2 sentence opening quoted verbatim in Japanese]
**Reveal markers found (3-5 examples):**
- "[Japanese phrase verbatim]" — [brief role]
- ...
**Before-state setup (反転前の共有認識の置き方, 1 example):** [1-2 sentences + verbatim phrase]
**Evidence speed control (1-2 examples):** [verbatim phrases]
**Number-driven phrasings (1-2 examples):** [verbatim phrases with specific numbers]
**Pop-culture translation phrasings (1 example, if any):** [verbatim phrase]
**Strategic digression → return (1 example, if any):** [topic + how it links back]
**Meta connection phrase (1 example, if any):** [verbatim phrase + M-type]
**Voice quirks worth replicating (2-3):** [...]

---

## [Next video]
...
```

## Hard constraints

- **Do not** summarize the content of the videos. Only extract discourse / structural techniques.
- **Quote Japanese verbatim** — do not translate the phrase samples.
- Keep the entire digest under 7000 tokens (slightly larger budget than other batches because of bonus extraction).
- If a file has no `## Transcript` section or has insufficient transcript content, write `**Status:** no usable transcript — skip` for that entry.
- Do not include any preamble, explanation, or postscript.
- Write the file using utf-8 encoding.

## When done

After writing the file, print to stdout ONLY:
- The output path
- A 2-line summary: how many entries had usable content / how many were skipped
