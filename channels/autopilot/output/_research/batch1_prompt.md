# Task: Extract discourse / structural techniques from 6 Okada Toshio video transcripts

You will read 6 transcript files from the Obsidian vault and produce ONE consolidated digest file. Do NOT summarize content. Extract STRUCTURE and DISCOURSE TECHNIQUES only.

## Files to read

Read all 6 markdown files in this directory:
`C:/Users/oioce/OneDrive/obsidian_vault/Clippings/`

Specifically these 6 (Ghibli / Hayao / Takahata animation focus):
1. `【UG 226】祝100万再生突破！「本当は10倍怖い『火垂るの墓』」OTAKING explains Grave of the Fireflies.md`
2. `岡田斗司夫ゼミ226（2018.4）本当は10倍怖い『火垂るの墓』～アニメ界の怪物・高畑勲監督追悼特集.md`
3. `【UG 306】究極のホラー映画その名は千と千尋の神隠し  OTAKING explains Spirited Away.md`
4. `リクエストに応えて『千と千尋』解説の後編を公開します【UG 307】 OTAKING explains about Spirited Away.md`
5. `【UG】もののけ姫はナウシカの裏側を覗く作品である OTAKING explains  Princess Mononoke.md`
6. `ジブリ特集７ 君はまだ"本当のトトロ"を知らない！『となりのトトロ』のダークサイドとは何か？【UG動画】 OTAKING explains My Neighbor Totoro.md`

The actual transcript content begins after a `## Transcript` heading. The earlier metadata / promotional text can be ignored.

## Background framework (what you are extracting against)

The Okada framework these videos exemplify:

- **16 hook types (H1-H16)**: H1 逆張り命題 / H2 禁断感演出 / H3 定量エスカレーション / H4 予告編トレーラー / H5 結論先行圧縮 / H6 評価二極化提示 / H7 「知ってるのに説明できない」矛盾指摘 / H8 期待裏切り宣言 / H9 衝撃命題先出し / H10 レベル構造予告 / H11 権威者意外行動 / H12 自己体験告白 / H13 「本が足りない」問題提起 / H14 自己開示共感形成 / H15 「聞いたら戻れない」脅迫 / H16 百万再生権威づけ
- **Reveal markers**: phrases like 「実はですね」「実は〜なんです」「これあの〜なんですよ」「なんでかっていうと」「ここが面白いんだけども」「普通の人は気づかない」「覚えておいてください」 mark the boundary between common-knowledge and new-fact
- **Evidence speed control**: techniques for releasing evidence piecemeal (「後で説明する」, 「まだ序章」, 「これだけでもすごいが、もっと深い話がある」) rather than dumping
- **Strategic digression**: tangents that loop back to reinforce the main point (e.g., Blade Ranner → Lolita actress → returns)
- **Meta connection (M1-M7)**: phrases that scale out from work → society → civilization

## Output requirements

Write the digest to: `C:/Users/oioce/dev/youtube-automation-agent/mychannel/output/_research/codex_digest_batch1.md`

Use EXACTLY this template, one section per video:

```markdown
# Batch 1 Digest — Ghibli / Hayao / Takahata animation

## [Video title — short form, e.g. "火垂るの墓 UG226"]
**File:** [filename]
**Hook type identification (1 or 2 from H1-H16):** [type code + 1-2 sentence opening quoted verbatim in Japanese]
**Reveal markers found (3-5 examples):**
- "[Japanese phrase verbatim]" — [brief role: e.g., "introduces R2 reversal", "marks transition to evidence layer 2"]
- "[Japanese phrase verbatim]" — [role]
- ...
**Before-state setup (反転前の共有認識の置き方, 1 example):** [1-2 sentences describing how Okada describes the "common belief" before reversing it, with a verbatim phrase]
**Evidence speed control (1-2 examples):** [verbatim phrases that defer or partially release evidence]
**Strategic digression → return (1 example, if any):** [topic of tangent + how it links back]
**Meta connection phrase (1 example, if any):** [verbatim phrase that scales out + which M-type it matches]
**Voice quirks worth replicating (2-3):** [e.g., self-deprecating asides, audience-naming, "覚えておいてください" sprinkled, etc.]

---

## [Next video]
...
```

## Hard constraints

- **Do not** summarize the content of the videos. Only extract discourse / structural techniques.
- **Quote Japanese verbatim** — do not translate the phrase samples. Translation kills the rhythm we are trying to study.
- Keep the entire digest under 6000 tokens.
- If a file has no `## Transcript` section or has insufficient transcript content, write `**Status:** no usable transcript — skip` for that entry.
- Do not include any preamble, explanation, or postscript. The digest file should contain only the digest itself, starting with the H1 heading.
- Write the file using utf-8 encoding.

## When done

After writing the file, print to stdout ONLY:
- The output path
- A 2-line summary: how many entries had usable content / how many were skipped
