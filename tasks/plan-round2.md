# Plan: Psychology channel round 2 — Demand research → Script generation

## Phases
1. **Demand re-analysis** (Claude) — `node scripts/analyze-psychology-demand.js`
2. **Topic-specific spec writing** (Claude) — `tasks/script-spec-D/E/F.md`
3. **Script generation** (Codex parallel x3) — `data/scripts/{ts}_{slug}.json`
4. **Verification** (Claude) — JSON parse + word count + citation spot-check
5. **Commit & push** (Claude)

## Constraints
- Avoid duplicating round 1 topics (Libet free-will, depression prediction error, attention/dopamine, survivorship bias).
- Prefer pillar `behavior` (unused) + top-demand topics from Phase 1 output.
- Citations: real research only. No fabrication.
- Script schema: matches `tasks/script-spec-shared.md` exactly.

## Codex delegation rule
- Use `codex exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox` (Win11 sandbox).
- Returns: path + word_count + duration_minutes only.

## Acceptance
- 3 JSON scripts, each parses, 1625-1775 word count, 5 sections, 9 min target.
- Spec files committed alongside scripts.
