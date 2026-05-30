# JP Markdown Template — Psychology Long-form Script

EN JSON 台本 (`data/scripts/{ts}_{slug}.json`) を **人間 (制作者) 向けの日本語意訳 markdown** に変換するときの format と翻訳 rule を定める。

## Filename / location

- 入力: `data/scripts/{ts}_{slug}.json`
- 出力: `data/scripts/{ts}_{slug}.md` (**同 dir、同 prefix**、拡張子のみ差)

## Source of truth

- **EN JSON が source of truth**。MD は派生物。
- JSON と MD で内容に乖離が出たら JSON を信じる。MD を直接編集して JSON に flow back させない。

## MD 構造 (exact template)

```markdown
# {JP title}

> **Source JSON:** [`{filename}.json`]({filename}.json)
> **Topic:** {topic JP} | **Pillar:** `{pillar}`
> **Generated:** {generated_at の YYYY-MM-DD} | **Length:** 約{estimated_duration_minutes}分 / {total_word_count} words (EN原文)
> **Target audience:** {target_audience JP}

---

## Hook

{JP hook narration}

> 🎬 **Visual:** {JP visual note}

---

## Section 1 — {JP heading}

{JP narration}

> 🎬 **Visual:** {JP visual note}
> ⏱ 約{duration_estimate_seconds}秒

---

## Section 2 — {JP heading}

{JP narration}

> 🎬 **Visual:** {JP visual note}
> ⏱ 約{duration_estimate_seconds}秒

---

## Section 3 — {JP heading}

(同様)

---

## Section 4 — {JP heading}

(同様)

---

## Section 5 — {JP heading}

(同様)

---

## Outro

{JP outro narration}

**CTA:** {JP cta}

---

## 参考研究 (key studies — 原文保持)

- {citation 1 原文ママ}
- {citation 2 原文ママ}
- {citation 3 原文ママ}
- ...

---

## SEO

**Optimized title (EN):** {optimized_title 原文ママ}
**Description (JP 要約):** {seo.description の核を 2-3 文で意訳}

> tags / hashtags / timestamps の詳細は [JSON]({filename}.json) の `seo` field を参照 (運用時は EN 原文をそのまま YouTube に投入)。
```

## 翻訳 rule

### Narration
- **意訳優先**。逐語訳しない。日本語として自然な語順・接続で再構成する。
- **1文1文の重み**を残す。短い punch 文 ("It's not." 等) は短い JP 文で。
- **bridge cadence** ("Here's the thing about…", "And this is where it gets worse.", "Okay. So what do you actually do?") は JP の自然な接続に置換:
  - "Here's the thing about…" → "問題はここからだ。", "ここで話が変わる。"
  - "And this is where it gets worse." → "そして、ここから先がもっと厄介だ。"
  - "Okay. So what do you actually do?" → "さて、実際に何をすればいいか。"
- **bullet/numbered enumeration** は EN と同じく散文で書く ("第一に。", "第二に。" 等)。markdown bullet 化しない。

### Citation
- **原文ママ保持**。`Tversky and Kahneman (1973) — ...` のような academic citation は **絶対に翻訳しない**。
- 本文中 inline citation も英文ママ:
  - EN: "A 2018 study by Bessembinder in the Journal of Financial Economics found that…"
  - JP: "Bessembinder (2018, Journal of Financial Economics) の研究では…"
  - 著者名・年・媒体名は英文のまま、地の文だけ JP にする。

### Visual note
- cinematic な体言止め / 短い文で。
- 比喩 (metaphor) は EN の意図を保ったまま自然な JP image に。

### CTA / sign-off
- "see you in the next one." 等の sign-off は JP のチャンネル末尾 sign-off 風に。
  - 例: "また次回お会いしましょう。" / "次の動画でまた会おう。"

### カタカナ語禁止 (CLAUDE.md hard rule)
英語由来の用語は **英単語のまま** か、**日本語に置換**。カタカナ化しない。

| NG (カタカナ) | OK |
|---|---|
| リサーチ | 研究 / 調査 |
| コンテキスト | 文脈 |
| エビデンス | 証拠 / 根拠 |
| リスク | 危険 / リスク (英単語のまま `risk` も可) |
| コスト | 費用 |
| バイアス | bias (英単語のまま) |
| パターン | pattern / 型 |
| ストーリー | story / 物語 |

技術用語・固有名詞 (`survivorship bias`, `availability heuristic`, `default mode network` 等) は **英単語のまま** が原則。
churn しがちな英語 (`framework`, `pattern` 等) も無理にカタカナ化しない。

## Anchor example (EN → JP 訳例)

下記は `1779639127625_survivorship-bias-is-ruining-your-decisions.json` の Hook を訳した anchor。codex はこの **trans tone** を再現する。

### EN (source)
> Look at this airplane. Every red dot is a bullet hole. The military said: armor the planes where the holes are. They were exactly wrong — and you're making the same mistake right now.

### JP (target)
> この飛行機を見てほしい。赤い点はすべて弾痕だ。軍はこう判断した — 穴のある場所に装甲を貼れ、と。彼らは完全に間違っていた。そして君は、今この瞬間に同じ過ちを犯している。

### Visual note 訳例
- EN: "Silhouette of a WW2 bomber, viewed from above, with clusters of red dots saturating the wings, tail, and fuselage. The engines and cockpit remain unmarked. The clean areas pulse with a faint, unsettling warning glow."
- JP: "上空から見下ろした第二次大戦の爆撃機のシルエット。翼・尾翼・胴体に赤い点 (弾痕) が密集している。エンジンと操縦席だけが無傷。その無傷の領域が、不穏な警告色でかすかに脈打つ。"

### Section heading 訳例
- "The Planes That Came Back" → "帰ってきた飛行機"
- "Why Your Brain Can't See What Isn't There" → "脳は『そこにないもの』を見られない"
- "The Industries Built To Hide the Holes" → "穴を隠すために設計された産業"
- "The Decisions This Is Ruining Right Now" → "今この瞬間、君の判断を壊しているもの"
- "How To See What Isn't There" → "見えないものを見る方法"

## Codex への delivery instruction (Phase 2 backfill 時)

```
読み込み:
  - tasks/script-jp-md-template.md (この file)
  - {source JSON path}

タスク:
  {source JSON} を読み、template に従って **JP 意訳 markdown** を生成し
  {output MD path} に書き出せ。

制約:
  - template の MD 構造を exact 再現
  - citation は **原文ママ**
  - カタカナ語禁止 (上記 NG list 参照)
  - narration は意訳で自然な日本語に
  - 固有名詞・技術用語は英単語のまま
  - 5 sections exact

報告: output MD path + JP文字数 の2行のみ。diff返却禁止。
```

## Verification (生成後 Claude check)

- file exists at `{ts}_{slug}.md`
- top-level `#` heading 1個
- `## Hook` / `## Section 1-5` / `## Outro` / `## 参考研究` / `## SEO` 全部存在
- カタカナ NG word (リサーチ/コンテキスト/エビデンス/コスト等) を grep して 0 hit
- citation block の英文行が JSON の `key_studies_referenced` 件数と一致
