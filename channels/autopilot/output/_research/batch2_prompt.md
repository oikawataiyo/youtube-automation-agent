# Task: Extract discourse / structural techniques from 6 Okada Toshio video transcripts

You will read 6 transcript files from the Obsidian vault and produce ONE consolidated digest file. Do NOT summarize content. Extract STRUCTURE and DISCOURSE TECHNIQUES only.

## Files to read

Read all 6 markdown files in this directory:
`C:/Users/oioce/OneDrive/obsidian_vault/Clippings/`

Specifically these 6 (creator / SF / character focus):
1. `【UG311】実はナウシカの前日譚！『On Your Mark』完全解説その１ 〜「火の七日間」は原発事故の暗喩 OTAKING explains ON YOUR MARK Level 1,2.md`
2. `【UG】独占公開！国宝級のお宝「王蟲の●●」〜ナウシカ完全解説（２）風の谷開拓史編  OTAKING explains Nausicaä of the Valley of the Wind 2.md`
3. `【UG 231】『かぐや姫の物語』宮崎駿が憧れたアニメ界の怪物・高畑勲が描く世界一美しい怪物 OTAKING explains The Tale of the Princess Kaguya.md`
4. `【UG】『ブレードランナー』がなぜ最高のSF映画なのか解説します！  OTAKING explains The best sci-fi movie, Blade Runner.md`
5. `【UG】地獄は笑いに包まれる～映画『ジョーカー』徹底解説  OTAKING explains JOKER.md`
6. `岡田斗司夫ゼミ61（2015.2.15）夢と魔法と打算の国ディズニーランドを徹底解説！.md`

The actual transcript content begins after a `## Transcript` heading. The earlier metadata / promotional text can be ignored.

## Background framework (what you are extracting against)

The Okada framework these videos exemplify:

- **16 hook types (H1-H16)**: H1 逆張り命題 / H2 禁断感演出 / H3 定量エスカレーション / H4 予告編トレーラー / H5 結論先行圧縮 / H6 評価二極化提示 / H7 「知ってるのに説明できない」矛盾指摘 / H8 期待裏切り宣言 / H9 衝撃命題先出し / H10 レベル構造予告 / H11 権威者意外行動 / H12 自己体験告白 / H13 「本が足りない」問題提起 / H14 自己開示共感形成 / H15 「聞いたら戻れない」脅迫 / H16 百万再生権威づけ
- **Reveal markers**: phrases like 「実はですね」「実は〜なんです」「これあの〜なんですよ」「なんでかっていうと」「ここが面白いんだけども」「普通の人は気づかない」「覚えておいてください」 mark the boundary between common-knowledge and new-fact
- **Evidence speed control**: techniques for releasing evidence piecemeal (「後で説明する」, 「まだ序章」, 「これだけでもすごいが、もっと深い話がある」) rather than dumping
- **Strategic digression**: tangents that loop back to reinforce the main point
- **Meta connection (M1-M7)**: phrases that scale out from work → society → civilization

## Output requirements

Write the digest to: `C:/Users/oioce/dev/youtube-automation-agent/mychannel/output/_research/codex_digest_batch2.md`

Use EXACTLY this template, one section per video:

```markdown
# Batch 2 Digest — Creator / SF / Character

## [Video title — short form]
**File:** [filename]
**Hook type identification (1 or 2 from H1-H16):** [type code + 1-2 sentence opening quoted verbatim in Japanese]
**Reveal markers found (3-5 examples):**
- "[Japanese phrase verbatim]" — [brief role]
- ...
**Before-state setup (反転前の共有認識の置き方, 1 example):** [1-2 sentences + verbatim phrase]
**Evidence speed control (1-2 examples):** [verbatim phrases that defer or partially release evidence]
**Strategic digression → return (1 example, if any):** [topic of tangent + how it links back]
**Meta connection phrase (1 example, if any):** [verbatim phrase + M-type]
**Voice quirks worth replicating (2-3):** [...]

---

## [Next video]
...
```

## Hard constraints

- **Do not** summarize the content of the videos. Only extract discourse / structural techniques.
- **Quote Japanese verbatim** — do not translate the phrase samples.
- Keep the entire digest under 6000 tokens.
- If a file has no `## Transcript` section or has insufficient transcript content, write `**Status:** no usable transcript — skip` for that entry.
- Do not include any preamble, explanation, or postscript.
- Write the file using utf-8 encoding.

## When done

After writing the file, print to stdout ONLY:
- The output path
- A 2-line summary: how many entries had usable content / how many were skipped
