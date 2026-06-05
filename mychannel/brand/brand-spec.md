# Autopilot — Brand Spec

**Decided:** 2026-06-05. Public channel name **Autopilot**, handle **@autopilot**.
Source of truth for the channel's public identity. Grounded in `mychannel/research/competitive-research.md` (§2 naming, §3 About, §4 thumbnails, §7 implications).

---

## 1. Name & handle

- **Display name:** `Autopilot`
- **Handle:** `@autopilot` (single clean word — claim in Studio ASAP; the Data API cannot set handles)
- **Concept:** the brain runs prediction on autopilot — forecasting threats, defaulting to old priors, bracing before "you" decide. The channel makes that autopilot *visible* and hands back the controls.

---

## 2. Tagline (banner / one-liner)

> **See the brain on autopilot.**

Alt: *The science of the mind running on autopilot.*

---

## 3. About / channel description (draft A — ~640 chars)

> Your brain is running on autopilot — predicting, forecasting, and bracing for threats before you ever decide a thing. Autopilot makes that hidden machinery visible.
>
> Every video is a cinematic essay on the predictive brain: the neuroscience of why we spiral into anxiety, sink into depression, freeze, or pull away — and what's actually firing in the circuit when we do. Not symptoms. Mechanisms.
>
> Grounded in predictive-processing neuroscience and peer-reviewed research, rendered in original 3D animation. New essays regularly.
>
> Educational only — not medical advice or a substitute for professional care. Subscribe to start seeing your own autopilot.

**Why this shape (per §3):**
1. Line 1 = emotional positioning (what it is / how it feels).
2. Para 2 = the world / what you get ("mechanisms, not symptoms" = differentiator).
3. Para 3 = **methodology authority** (replaces the "Dr. credential" we can't use as an anonymous brand) + **cadence**.
4. Para 4 = **medical disclaimer** (required — we cover depression/anxiety) + CTA.

Cadence is intentionally soft ("New essays regularly") — no fixed-day promise until output pace is proven.

---

## 4. Keywords (no stuffing — §3 says stuffing is a clone tell)

`predictive brain, neuroscience, psychology, anxiety, depression, predictive processing, cinematic essay, mental health, how your brain works`

---

## 5. Thumbnail system (per §4 — premium / Einzelgänger·Heidi·Huberman quadrant)

- **Base:** our 3D cinematic render (slate-blue palette + bloom), one frame chosen as hero.
- **Text:** the **mechanism in 1 word** or an **assertion in 2–3 words**, set in a heavy condensed sans, one **accent color** (consistent across the channel — propose a single bloom accent, e.g. warm amber or cyan, picked once and locked).
  - e.g. `PREDICTION ERROR`, `THREAT FORECAST`, `FALSE ALARM`, `AUTOPILOT`.
- **Brand mark:** small consistent corner element (an "AP" / autopilot glyph or a thin accent rule) so the grid reads as one channel — like Huberman's blue brand frame.
- **Avoid (commodity tells, §4):** 2D blob mascots, yellow boxes, fluorescent diagram explainer style.

---

## 6. Go-live plan

**Account model (decided 2026-06-06): Brand Account** on the existing Google login.
Rationale: solo long-run project, no sale/handoff intent, no existing AdSense → public anonymity + low maintenance + "1 person = 1 AdSense" friendly + transferable later. A separate Google account's only real benefit (hard financial/operational separation) doesn't apply. The current OAuth points at the personal channel "及川大洋"; we re-auth against the new Brand channel.

| Item | Method | Notes |
|---|---|---|
| Create Brand Account "Autopilot" | **Studio UI (manual)** | youtube.com → account menu → Switch/Create channel → "Use a custom name". |
| Handle `@autopilot` | **Studio UI (manual)** | API cannot set handles. Claim ASAP (currently unprotected). |
| Re-authorize OAuth → Brand channel | repo auth flow | Pick the Autopilot Brand channel at consent; regenerates `config/tokens.json`. |
| Description / keywords | **Data API** `node scripts/apply-branding.js --apply` | Reliable. Title via API is flaky → set name in Studio too. |
| Profile picture / banner | **Studio UI (manual)** | Design assets needed (separate task). |
| First upload | TBD | Pick from rendered library; recommend **unlisted test** first. |

---

## 7. Open items

- Lock the single accent color for the thumbnail system.
- Confirm upload cadence wording in About.
- Decide first-upload video + privacy (unlisted test recommended).
- Banner / profile-pic art direction (separate asset task).
