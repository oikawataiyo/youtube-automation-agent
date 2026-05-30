# Shared Spec — 心理学チャンネル長尺台本 (9-10 分)

You are generating a long-form psychology / behavioral-science YouTube script in **English** for the same channel as the reference script.

## REFERENCE FILE (read this first — replicate its schema and voice EXACTLY)
`data/scripts/1779639127625_survivorship-bias-is-ruining-your-decisions.json`

## OUTPUT FORMAT
- Single JSON file, UTF-8, top-level keys in this exact order:
  - `generated_at` (ISO 8601, today)
  - `topic` (short string)
  - `pillar` (one of: "biases", "behavior", "neuroscience", "mood", "modern-life")
  - `script` (object with `title`, `hook`, `sections`, `outro`, `metadata`)
  - `seo` (object with `optimized_title`, `description`, `tags`, `hashtags`)
- Inside `script.hook`: `text` (1 paragraph, 35-65 words, ends on a hook line) and `visual_note` (one camera/scene description sentence with imagery).
- Inside `script.sections`: exactly **5 sections**. Each section: `heading`, `narration`, `visual_note`, `duration_estimate_seconds` (between 90 and 110).
- Inside `script.outro`: `narration` (1 paragraph, 80-130 words) and `cta` (1-2 sentences ending with "see you in the next one." style sign-off).
- Inside `script.metadata`:
  - `total_word_count` (integer; sum of all narration + hook + outro; target 1650-1750)
  - `estimated_duration_minutes` (integer; target 9)
  - `target_audience` (1 sentence; same demographic as reference: HealthyGamerGG / Better Ideas / Sisyphus 55 / Einzelganger viewers, 22-40)
  - `key_studies_referenced` (array of 8-10 strings; each = "Author(s) (Year) — Title (Journal/Publisher)")

## VOICE & STYLE RULES (CRITICAL — match the reference)
1. **Open every section with the bridge cadence** — never start with "First," "Second," etc. Use connective openings like "Here's the thing about…", "And this is where it gets worse.", "Okay. So what do you actually do?".
2. **One-sentence paragraphs are encouraged** for rhythmic weight. Mix short and long sentences.
3. **Cite real research inline** — "A 2018 study by Bessembinder in the Journal of Financial Economics found that…" Year, author surname(s), journal name minimum. Do NOT invent fake citations. Use only the studies listed in the topic-specific spec.
4. **Each narration must contain at least 2 inline citations** with year + author + venue.
5. **No bullet lists in narration.** Numbered enumerations are allowed but written as prose ("First. Second. Third. …").
6. **Avoid contractions** sparingly — match the reference ratio (uses them but not constantly).
7. **End each section with a transition sentence** that earns the next heading.
8. **Tone**: intellectually honest, slightly melancholic, never preachy. Treats the viewer as smart. Avoids "guys" / "folks".
9. **No exclamation marks**. Period. (Mirror the reference.)
10. **`visual_note` style**: cinematic, single specific shot, often with a metaphor that pays off the section's argument. Example feel: "A long museum corridor of glass display cases, each holding a polished trophy or framed photo of a famous success. The camera glides past them, then drifts down a parallel hallway in shadow — case after case, all empty, each with a small unread plaque."

## TITLE & HOOK CONVENTIONS
- `script.title`: provocative, second-person, often a counterintuitive reveal. Pattern from reference: "Why You Keep Trusting the Wrong Success Stories (Survivorship Bias)".
- `script.hook.text`: opens with a vivid concrete image (a person, a lab, an object), pivots in the last sentence to "and you're doing this right now."

## SEO BLOCK RULES
- `seo.optimized_title`: identical to `script.title` (or near-identical).
- `seo.description`: 3-4 paragraphs of description, **plus** a timestamp block aligned with the 5 sections (0:00, 1:35, 3:15, 4:55, 6:35, 8:20 approximate), **plus** "Research referenced:" bullet list (use • not -), **plus** subscribe line, **plus** hashtag line at end. Match reference structure.
- `seo.tags`: 22-28 string tags, lowercase, mix of broad ("cognitive bias") and channel-style ("healthygamergg style").
- `seo.hashtags`: 8-10 hashtags, PascalCase, starting with `#Psychology`.

## WORD COUNT BUDGET
- Hook: ~50 words
- 5 sections × ~320 words = ~1600 words
- Outro: ~110 words
- **Total target: 1700 words (± 75)**

## CITATIONS — HARD RULE
Use ONLY the studies listed in the topic-specific spec file. Do NOT invent. If you need an extra source for flow, use one from the same list a second time rather than fabricating.

## DELIVERY
1. Read this shared spec.
2. Read the topic-specific spec file passed to you.
3. Read the reference script JSON to lock in voice + schema.
4. Write the new script JSON to the specified output path.
5. Verify the file parses as JSON and word count is within range.
6. Report ONLY: output file path + total_word_count + estimated_duration_minutes. Nothing else.
