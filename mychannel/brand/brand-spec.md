# Autopilot — Brand Spec

**Decided:** 2026-06-05. Public channel name **Autopilot**, handle **@autopilot-c7h** (final 2026-06-06 — the clean `@autopilot` was not claimable in Studio at go-live; kept the auto-assigned handle).
Source of truth for the channel's public identity. Grounded in `mychannel/research/competitive-research.md` (§2 naming, §3 About, §4 thumbnails, §7 implications).

---

## 1. Name & handle

- **Display name:** `Autopilot`
- **Handle:** `@autopilot-c7h` (final — clean `@autopilot` was unavailable to claim in Studio at go-live; the Data API cannot set handles)
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

**Account model (decided 2026-06-06): Topology B** — the YouTube **API (Google Cloud project + OAuth credentials) stays on the personal account (及川大洋)**, but the **Autopilot channel lives on a new dedicated Google account**.
Rationale: keep the channel/operations off the daily-use personal account (peace of mind) without re-creating the API project. AdSense is a non-factor (a dedicated account still links to the one personal AdSense at monetization; no second AdSense needed). OAuth tokens are YouTube-scoped only — they can't touch Gmail/Drive. Public anonymity is identical to all options (viewers see only "Autopilot").

| Item | Method | Notes |
|---|---|---|
| New Google account for Autopilot | **manual** | Enable 2FA + recovery phone/email (only real risk = lockout/channel loss). |
| Create channel "Autopilot" | **Studio UI (manual)** | Default channel of the new account, named Autopilot. |
| Handle `@autopilot-c7h` | **Studio UI (manual)** ✅ | API cannot set handles. Clean `@autopilot` was unavailable in Studio at go-live; kept auto-assigned handle. |
| Add new account as **test user** | **Cloud Console (及川大洋)** | APIs & Services → OAuth consent screen → Test users → add. ⚠️ If consent is "Testing", refresh tokens expire in 7 days → publish app for production automation (youtube = sensitive scope). |
| Re-authorize OAuth → new account | `npm run credentials:setup` | Sign in as the NEW account at consent; regenerates `config/tokens.json`. |
| Description / keywords | **Data API** `node scripts/apply-branding.js --apply` | Reliable. Title via API is flaky → set name in Studio too. |
| Profile picture / banner | **Studio UI (manual)** | Design assets needed (separate task). |
| First upload | TBD | Pick from rendered library; recommend **unlisted test** first. |

---

## 7. Open items

- ~~Lock the single accent color for the thumbnail system.~~ ✅ **Locked = warm amber `#E8A33D`** (2026-06-06). Already in use as the section-label accent in the depression render; warm-vs-cool contrast against the slate-blue/near-black, avoids the commodity-red tell.
- Confirm upload cadence wording in About.
- Decide first-upload video + privacy (unlisted test recommended).
- ~~Banner / profile-pic art direction (separate asset task).~~ ✅ **Decided 2026-06-06 — see §8.**

---

## 8. Banner & profile art direction (decided 2026-06-06)

Anchored to the actual 3D renders: near-black deep-space background, a subtle blue radial bloom, slate-blue environment/linework, white type, and **one** warm-amber accent. Threat-red stays *inside* videos only (anxiety glow) — it is never a brand chrome color.

### Locked palette

| Token | Hex | Use |
|---|---|---|
| `bg` near-black | `#06080D` | base field |
| `slate-blue` | `#3A4A63` | ring, linework, secondary type |
| `ground` | `#1A2233` | lower hemisphere of the mark |
| `sky` | `#0C111B` | upper hemisphere of the mark |
| `accent` amber | `#E8A33D` | **single** accent — one element per surface |
| `white` | `#F2F4F8` | wordmark / primary type |

### Profile picture — **attitude indicator** (aviation autopilot artificial horizon)

The literal autopilot instrument: name + concept in one mark, legible at 24 px, and it dodges every commodity tell (no 2D blob, no yellow box).

- Circular, near-black field with a faint blue radial bloom behind.
- Thin **slate-blue** outer ring.
- Hemisphere split: upper = `sky`, lower = `ground`.
- **Amber** horizon line across the middle + a small amber center triangle (the aircraft symbol `▲`).
- No "AP" lettering — keep it clean at small size (the wordmark carries the name on the banner).
- Deliverable: **800×800 PNG**, all art centered & circular-safe (no edge text), exported on the square (YouTube crops to circle).

### Banner

- **2560×1440** field: near-black + subtle blue radial bloom; faint star/particle dust like the renders.
- **Center safe area (1546×423, shows on all devices):**
  - The attitude-indicator mark (small) + wordmark **`Autopilot`** in white.
  - Tagline beneath: **`See the brain on autopilot.`** — the word `autopilot` (or a thin underline rule) in amber. One accent only.
- **Outside the safe area (right bleed, desktop/TV only):** a large, dim 3D element fading off the edge — the glowing orb or a neural-horizon linework — for cinematic depth without crowding the mobile crop.
- Deliverable: **2560×1440 PNG**, < 6 MB.

### Optional later — video watermark

The attitude-indicator mark as a **150×150 transparent PNG** (Studio → Branding → video watermark), reinforcing the channel grid like Huberman's blue frame.

### Production

Build both as **HyperFrames HTML compositions** and render to PNG deterministically — same engine/aesthetic as the videos, so the channel art and the content read as one world. Upload is Studio-manual (Data API cannot set banner/profile).
