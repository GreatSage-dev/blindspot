# BLINDSPOT — Product Context (`PRODUCT.md`)

**Generated via `impeccable init` (`pbakaus/impeccable` schema)**

---

## 1. Product Truth & Core Purpose

- **Name:** BLINDSPOT — Qloo Cultural Taste Diagnostic & Turnaround Engine
- **One-Sentence Premise:** Normal AI picks what is famous; Blindspot uses Qloo Taste AI to find the quiet cultural mismatch driving your crowd away, replaces cliché recommendations across 5 domains, re-verifies the new plan, and prints ready-to-send partner outreach emails plus a portable Crowd Rulebook.
- **Core Insight ("Loud Effect ← Quiet Cause"):** When regulars quietly walk away or a launch flops, management almost always blames prices or ad budgets (the loud effect). The quiet cause is almost always cultural mismatch: booking 98%-famous mass-market acts, sponsors, or venues that clash with the crowd's actual taste.
- **Load-Bearing Platform:** Qloo Taste AI (`hackathon.api.qloo.com`) — `/search`, `/v2/insights` (`urn:entity:artist`, `urn:entity:brand`, `urn:entity:person`, `urn:entity:podcast`, `urn:entity:movie`, `urn:entity:place`, `urn:demographics`, `urn:heatmap`, `urn:tag`), `/v2/analysis/compare`, and `/v2/trending`. Every request passes through a strict per-entity parameter validator (`0 rejected parameters`).

---

## 2. Target Audience & Evaluators

- **Primary Evaluators:** Qloo Agentic Hackathon Judges (Jason Calacanis, Nicole Seligman, Todd Boehly, Mike Diolosa) and hospitality/entertainment/brand operators.
- **Voice & Copy Rules:**
  - Plain, direct, zero academic or clinical jargon.
  - Explainable in two sentences to a 15-year-old: *"Normal AI picks what is famous. Qloo picks what actually fits your crowd."*
  - Every aggregate figure (`0 / 5` before → `5 / 5` after, `97%` avg fame vs `17%` fit → `68%` insider fame vs `94%` verified fit) reconciles deterministically with the displayed row data.

---

## 3. Surface Modes (`impeccable` Modes)

1. **Surface 1 — Landing Page (`/`, `public/index.html`, `public/landing.css`, `public/landing.js`):**
   - **Mode:** `Persuade`
   - **Committed World:** `editorial-report` (*The printed annual*, seed `296823818`)
   - **Success Criterion:** In 15 seconds, the visitor sees the contrast between a 98%-famous normal AI failure and Qloo's 94%-fit cultural turnaround on a strict 42% editorial axis, flips through live turnaround dossiers (`The Standard, High Line`, `A24 Film Launch`, `Liquid Death`), inspects the 6-layer Qloo gate, and launches the workbench.

2. **Surface 2 — Turnaround Workbench (`/app`, `public/app.html`, `public/dashboard.css`, `public/app.js`):**
   - **Mode:** `Operate`
   - **Committed World:** `framed-sheet` (*Framed sheet*, seed `1118171094`)
   - **Success Criterion:** Operators immediately see the 5-metric KPI strip, interactive SVG comparison chart, Loud Effect vs. Quiet Cause diagnosis, slot-by-slot Normal AI vs. Qloo replacement table with clickable Qloo API proof receipts, live Adversarial Cliché Blocker (`Force Drake`, `Force MrBeast Stunt`, `Force Times Square Chain`), Hidden Taste Cities (`urn:heatmap`), Age Skew (`urn:demographics`), ready-to-send Partner Outreach Emails, and downloadable `CROWD-RULEBOOK.md`.
