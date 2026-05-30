# Plan — Dual Output (EN JSON + JP MD) for psychology scripts

## Goal
Psychology long-form script の生成・既存資産を **EN JSON (機械用 / downstream pipeline) + JP MD (人間用 / 自分の読解)** の dual output に移行する。

## User-confirmed decisions
- MD = EN JSON の **JP翻訳版** (content 同一、言語のみ差。citations は学術慣行で英文保持)
- 既存 10 本 を **backfill** (新規だけでなく)
- 出力先 = `data/scripts/{ts}_{slug}.md` (JSON と同居)

## Scope of files
**Existing 10 scripts to backfill:**
1. `1779639127625_survivorship-bias-is-ruining-your-decisions`
2. `1779800000001_your-brain-decides-before-you-do`
3. `1779800000002_depression-is-a-prediction-error`
4. `1779800000003_your-attention-span-was-hijacked`
5. `1779900000001_why-you-crash-out-over-someone-you-barely-know`
6. `1779900000002_your-brain-treats-losses-as-twice-as-loud`
7. `1779900000003_social-pain-is-real-pain`
8. `1780000000001_rumination-is-your-default-mode-network`
9. `1780000000002_memory-rewrites-itself-every-time`
10. `1780000000003_contempt-is-the-best-predictor-of-divorce`

**Spec/skill files to update:**
- `tasks/script-spec-shared.md` — add JP MD output requirement
- `.claude/skills/psychology-script-batch/SKILL.md` — Phase 3 / Phase 4 update
- `tasks/script-jp-md-template.md` (new) — JP MD format spec + translation rules

## JP MD format (proposed)

```markdown
# {JP title}

> **Source JSON:** [`{filename}.json`]({filename}.json)
> **Topic:** {topic JP} | **Pillar:** `{pillar}`
> **Generated:** {date} | **Length:** ~{N} 分 / {word_count} words (EN原文)
> **Target audience:** {target_audience JP}

---

## Hook

{JP hook narration}

> 🎬 **Visual:** {JP visual note}

---

## Section 1 — {JP heading}

{JP narration}

> 🎬 **Visual:** {JP visual note}
> ⏱ {duration_estimate_seconds}秒

---

(同様 5 sections)

---

## Outro

{JP outro narration}

**CTA:** {JP cta}

---

## 参考研究 (key studies — 原文保持)

- {citation 1}
- {citation 2}

---

## SEO

**Optimized title:** {optimized_title}
**Description (要約 JP):** {description の核を 2-3 文で JP 要約}

> 詳細 (tags / hashtags / timestamps) は [JSON]({filename}.json) の `seo` field 参照。
```

## Translation rules
- **narration** は意訳優先で自然な日本語に。逐語訳しない。
- **bridge cadence** ("Here's the thing about…") は JP の自然な接続 ("ところで—", "問題はここからだ") に置換。
- **citation** (`Bessembinder (2018) — ...`) は **そのまま英文保持**。
- **visual_note** は cinematic な体言止めで簡潔に。
- **CTA sign-off** は JP の自然なチャンネル sign-off 風に。
- **カタカナ語禁止** (CLAUDE.md ルール) — "リサーチ"→"研究", "コンテキスト"→"文脈", "エビデンス"→"証拠"。

## Implementation phases

### Phase 1 — Spec/template files (Claude直接)
1. Create `tasks/script-jp-md-template.md` (format + translation rules を formalize、Hook の EN→JP 訳例 1 段落を anchor として埋め込む)
2. Update `tasks/script-spec-shared.md` `## OUTPUT FORMAT` に JP MD twin output 要件追加
3. Update `.claude/skills/psychology-script-batch/SKILL.md` Phase 3 codex prompt に MD 生成追加、Phase 4 verification に MD 存在 check 追加

### Phase 2 — Backfill 10 既存 (Codex 並列委譲)
- 3 batch × 3-4 並列 で `codex exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox`
- 各 codex prompt: `tasks/script-jp-md-template.md` + 該当 JSON path + output MD path
- output report: `{md path} | JP 文字数` のみ
- background 起動時は `</dev/null` append (memory: `codex_background_stdin`)

### Phase 3 — Verification (Claude直接)
- 全 10 MD ファイル存在確認 (`Glob data/scripts/*.md`)
- 各 MD の section 数 (= 5) と heading 構造を quick check
- カタカナ NG word を Grep (リサーチ/コンテキスト/エビデンス/リスク/コスト等の主要セット)

### Phase 4 — Commit & Push
```
feat: add JP markdown twin output for psychology scripts

- Update shared spec / SKILL to require EN JSON + JP MD dual output
- Add tasks/script-jp-md-template.md (translation rules + MD format)
- Backfill 10 existing scripts with JP MD (codex parallel)
```

## Risks / mitigations
| Risk | Mitigation |
|---|---|
| Codex JP翻訳の品質ばらつき | template に concrete EN→JP 訳例を anchor として埋め込む |
| カタカナ混入 | Phase 3 で Grep 検知 → 該当ファイルのみ再生成 |
| Codex parallel hang | `</dev/null` 必須、Monitor で 120s health probe |
| MD/JSON content drift (今後) | spec で「JSON = source of truth、MD は派生」を明示 |

## Acceptance criteria
- [ ] `tasks/script-jp-md-template.md` exists
- [ ] `tasks/script-spec-shared.md` includes JP MD output requirement
- [ ] `.claude/skills/psychology-script-batch/SKILL.md` Phase 3/4 updated
- [ ] 10 MD files exist at `data/scripts/{ts}_{slug}.md`
- [ ] 各 MD: 5 sections + Hook + Outro + 参考研究 present
- [ ] カタカナ NG word 未混入
- [ ] Single commit + push to master
