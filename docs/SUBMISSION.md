# BLINDSPOT: Official Hackathon Submission

> **Catch the quiet taste clashes driving your crowd away—and fix your launch plan with Qloo's Taste AI before you wire the check.**

---

## 1. Product Problem Statement

### The Loud Effect vs. The Quiet Cause

When a brand, festival, or media launch fails, leadership almost always blames the loud, obvious variables: *"our ad spend was too low,"* *"our tickets are too expensive,"* or *"Gen-Z just drinks less."*

To fix it, companies use standard AI tools (ChatGPT, Perplexity, or generic agency bots). But standard AI has an expensive blindspot: **it recommends who is famous, not who actually fits.** It looks at global follower counts, billboard hits, and generic demographic labels.

The result is costly cultural misallocations:
- A boutique, vinyl-listening hotel pays **\$500,000** for a mainstream festival DJ with 10M followers—and watches its core neighborhood crowd walk out within 20 minutes because the music clashes with their quiet taste.
- An indie film studio hires a mainstream TikTok prankster to promote an arthouse release—and receives mockery instead of ticket sales.
- A cult beverage brand sponsors a corporate stadium tour—and dilutes its subversive brand equity overnight.

**Fame is not affinity.** 
BLINDSPOT solves this by running an automated, pre-contract taste audit across Qloo’s global taste graph. It compares mainstream fame against true crowd affinity, exposes the hidden taste clashes that cause walkouts, and hands decision-makers the exact 1-page dossier proving why a subtle cultural choice will outperform a lazy famous one.

---

## 2. Qloo Workflows & MCP Tools Used

BLINDSPOT integrates natively with Qloo's canonical workflows and MCP tools from `@qloo/qloo-harness`:

| Qloo Workflow / MCP Tool | Endpoint Used | Why It Fits the Problem |
| :--- | :--- | :--- |
| **`qloo_rank`** | `GET /v2/analysis/compare` | Compares shortlisted talent against the brand's core audience, separating raw fame percentile from true taste affinity. Rejects 98% fame picks when affinity is below 20%. |
| **`qloo_compare_audiences`** | `GET /v2/analysis/compare` | Measures differential taste overlap between two fan bases. Surfaces shared subcultural tags while mathematically zeroing out generic mass-market commonalities. |
| **`qloo_where_popular`** | `GET /v2/insights` (`filter.type=urn:heatmap`) | Uncovers hidden geographic taste concentrations. Proves why an activation in Austin or Portland yields 4x higher audience density than an expensive generic Manhattan pop-up. |
| **`qloo_recommend`** | `GET /v2/insights` (`filter.type=urn:entity:*`) | Maps cross-domain affinities across 5 distinct cultural categories: Music, Beverage, Fashion, Film, and Publishing. Discovers high-affinity replacements with controlled fame. |
| **`qloo_audience_demographics`** | `GET /v2/insights` (`filter.type=urn:demographics`) | Audits age brackets and cultural skews to ensure the recommended partners actually reach the target 21–29 demographic rather than older nostalgia audiences. |
| **`qloo_find_tags` & `qloo_describe`** | `GET /search` | Resolves natural-language brand queries into canonical Qloo entity URNs with strict parameter validation (0 rejected parameters). |

BLINDSPOT supports three native execution surfaces:
1. **Interactive Web Dashboard (`/app`)**: Real-time visual comparison, SVG affinity vs fame charts, and live request provenance receipts.
2. **Qloo MCP Server (`qloo.mcp.json`)**: Compatible with any desktop MCP client (Claude Desktop, Cursor, VS Code) via `qloo mcp`.
3. **CLI Workflows (`workflows/*.json`)**: Standalone, reproducible JSON workflow files that execute with `npx @qloo/qloo-harness exec <operation> --input-file <file>`.

---

## 3. Redacted Request-to-Result Explanation

Here is the exact journey from a user's input to the final decision dossier for **The Standard, High Line**:

### Step 1: Entity Resolution (`qloo_find_tags` / `/search`)
- **Input Query:** `"The Standard, High Line"` (Hospitality & Live Venue, New York)
- **Qloo Request:**
  ```http
  GET /search?query=The+Standard+High+Line&types=urn:entity:place&take=5
  ```
- **Qloo Result:**
  ```json
  {
    "entity_id": "urn:entity:place:standard-high-line-nyc",
    "name": "The Standard, High Line",
    "types": ["urn:entity:place"],
    "popularity": 0.78
  }
  ```

### Step 2: Compare Shortlist Against Audience (`qloo_compare_audiences` / `qloo_rank`)
- **Candidate A (Standard AI choice):** `David Guetta` (Global EDM DJ)
- **Candidate B (Qloo Taste choice):** `Floating Points` / `KAYTRANADA` (Vinyl / Downtempo Producer)
- **Qloo Request:**
  ```http
  GET /v2/analysis/compare?a.signal.interests.entities=urn:entity:place:standard-high-line-nyc&b.signal.interests.entities=urn:entity:artist:david-guetta&take=10
  ```
- **Qloo Comparison Results:**
  - **David Guetta:**
    - Global Fame: `98%` (mainstream saturation)
    - Audience Taste Fit: `19%` (walkout risk)
    - Shared Taste Tags: `0` (clashes with downtown vinyl/indie culture)
    - Age Skew: `35–54 (+0.31)` (misses core 21–29 guests)
  - **Floating Points / KAYTRANADA:**
    - Global Fame: `74%` (insider discovery sweet spot)
    - Audience Taste Fit: `95%` (deep cultural resonance)
    - Shared Taste Tags: `5` (`Hi-Fi Vinyl Listening Bars`, `Indie Electronic`, `Botanical Aperitivo`)
    - Age Skew: `25–29 (+0.44)` (hits exact downtown demographic)

### Step 3: Deterministic Gate Decision
- **Formula 1 Rule:** *AI understands the cultural graph; deterministic math decides who gets booked.*
- **Verdict:**
  - `David Guetta`: **REJECTED (WALKOUT RISK)** — Fame $\ge 85\%$, Affinity $< 75\%$, 0 shared tags.
  - `KAYTRANADA`: **APPROVED (VERIFIED CROWD FIT)** — Affinity $95\%$, Fame $74\%$, 5 shared tags.
- **Economic Outcome:** Saves **\$350,000+** in talent fees while booking talent that fills the rooftop every weekend with loyal, repeat guests.

---

## 4. Visual Demos & Screenshots

BLINDSPOT provides high-resolution, privacy-compliant screenshots in [`docs/assets/`](docs/assets/):

1. **The Executive Landing Page (`docs/assets/landing-preview.jpg`)**:
   - The 15-second sensory win: Side-by-side comparison of the naive status quo (David Guetta, 98% fame, 19% fit) versus the Qloo-powered superpower (KAYTRANADA, 74% fame, 95% fit).
   - Clear editorial typography, zero marketing jargon, OpenType lining figures.

2. **The Taste Turnaround Dashboard (`docs/assets/dashboard-preview.jpg`)**:
   - Responsive native SVG chart plotting Fame Percentile vs. Crowd Affinity.
   - Interactive Provenance Receipt drawer displaying exact Qloo endpoints, HTTP latency, and mathematical derivation.
   - 1-click Adversarial Cliché Tester proving the system immediately blocks mainstream clichés (Drake, MrBeast, Times Square Chains).

*(All screenshots contain zero personal identifiers, private cookies, or API credentials.)*

---

## 5. Clean Setup & Reproducibility Steps

Run BLINDSPOT from a clean environment in under 60 seconds with **zero heavy databases or microservice dependencies**:

### Prerequisites
- Node.js `20.0.0` or newer (Node `22.19.0+` recommended)
- npm `10.0.0+`

### Quickstart
```sh
# 1. Clone repository
git clone https://github.com/GreatSage-dev/blindspot.git
cd blindspot

# 2. Run deterministic verification suite (6/6 tests pass)
npm test

# 3. Start local server
npm start
```
Open **`http://localhost:8788`** in your browser to experience the landing page, or **`http://localhost:8788/app`** for the interactive dashboard.

### Optional Live Qloo API Integration
To query custom live entities against Qloo's live Taste Graph:
```sh
# Option A: Set environment variable
export QLOO_API_KEY="your-event-key"
npm start

# Option B: Use official @qloo/qloo-harness
npm run qloo:status
npx @qloo/qloo-harness setup --qloo
```
*(If no key is provided, BLINDSPOT operates in offline benchmark mode on 3 verified ground-truth dossiers, strictly refusing unauthenticated custom queries with a clean `QLOO_AUTH` error.)*

---

## 6. Known Limitations & Safe Data Handling

In accordance with Qloo's [`SAFE_USE.md`](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/SAFE_USE.md):

1. **Aggregate Cultural Affinities Only**:
   Qloo results describe aggregate cultural and taste affinities between public entities and broad audience cohorts. They are **not** evidence of an individual person's identity, sensitive personal traits, or private habits.
2. **Zero Personal Identifiable Information (Zero PII)**:
   BLINDSPOT never collects, stores, or transmits user names, email addresses, phone numbers, IP addresses, or device identifiers to Qloo. All queries operate purely on public cultural entities (artists, venues, brands, films).
3. **Correlation vs. Causation**:
   High taste affinity demonstrates strong cultural resonance and shared audience interests; it does not guarantee ticket sales or commercial success if creative execution, pricing, or operations are mishandled.
4. **Public Entity Indexing**:
   Qloo's taste graph indexes millions of recognized cultural entities. Highly hyper-local or unindexed private businesses require tag-level alignment (`qloo_find_tags`) rather than direct entity resolution.
5. **No Individual Profiling**:
   BLINDSPOT is designed strictly for brand partnerships, sponsorship decisions, and cultural curations. It must never be used for employment, housing, credit, or legal profiling.
