# BLINDSPOT — Design System (`DESIGN.md`)

**Dealt via `design-taste-frontend` (`draw.mjs`) & `hallmark` (`v2.0.0`)**

---

## 1. Visual Worlds & Surface Modes

BLINDSPOT comprises two purpose-built surfaces sharing rigorous typographic discipline, zero decorative slop, and deterministic Qloo Taste AI data:

1. **Landing Page (`/`) — Persuade & Editorial Dossier (`editorial-report` / *The printed annual*, seed `296823818`)**
   - **Idea:** *"On this page, the Qloo Taste Audit Sheet (where a 98%-fame AI cliché is crossed out and replaced by a 95%-affinity cultural match) becomes the live printed dossier you flip through on the 42% vertical axis."*
   - **Axis Geometry:** A strict vertical axis at `42%` of the viewport width organizes the page. Display headings and body columns start on the `42%` axis; the `0–42%` zone holds margin notes, photographic crops, or deliberate negative space.
   - **Type:** `Switzer` (`400`, `500`, `600`) — one neo-grotesk face across all 5 fluid size steps (`--step-small`, `--step-body`, `--step-lead`, `--step-head`, `--step-display`), sentence case only, tracking `-0.04em` on display heads, leading `0.95`.
   - **Palette:** Two-colour editorial print contrast (`--bg: #ffffff`, `--surface: #f5f5f5`, `--ink: #000000`, `--muted: #525252`) punctuated by full-bleed solid colour fields (`--field-1: #c5c5c5`, `--field-2: #a7ff9c`, `--field-3: #ff6831`, `--field-4: #000000`).

2. **Interactive Dashboard (`/app`) — Operate Workbench (`framed-sheet` / *Framed sheet*, seed `1118171094`)**
   - **Question Answered First:** *"Which choices in our launch plan will quietly drive our crowd away, and what did Qloo replace them with?"*
   - **Shell:** Tinted architectural stone L-frame (`--ground: #f4f5f4`) holding the `228px` sidebar and `48px` top bar with no rule between them; the workspace sits on a crisp white sheet (`--surface: #ffffff`) inset `8px` from the window's right and bottom edges (`16px` radius, `1px solid #e8eaec` edge, zero drop shadow).
   - **Type:** `IBM Plex Sans` (`400`, `500`, `600`) for UI & reading + `IBM Plex Mono` (`400`, `500`) strictly for Qloo entity URNs, API query paths, and tabular figures (`font-variant-numeric: tabular-nums`).
   - **Data Chroma:** Under 3% chrome colour; chroma lives strictly on the data (`--chart-1: #1b6c80` deep petrol teal on Qloo affinity, `--positive: #1e7b4f` verified fit, `--negative: #c4242a` walkout risk, `--chart-3: #a86f0c` mainstream fame saturation).

---

## 2. Hard House Rules (Enforced by `lint.mjs` & `inspect.mjs`)

- **Headlines:** Two lines or fewer at every viewport width (`1440px`, `768px`, `390px`).
- **Zero Slop Ornaments:** No eyebrow labels above headings, no `01 / 02 / 03` index numbers, no gradients, no glass/backdrop-blur, no resting box shadows, no icon-in-tinted-square cards, no emojis.
- **Honest Data & Reconciled Math:** Every total and average (`0 / 5` before $\to$ `5 / 5` after, `97%` avg fame vs `16%` avg fit $\to$ `68%` insider fame vs `94%` verified fit) is computed directly from the displayed row figures.
- **Photography & `data-ui` Fragments:** All photographs use a unified greyscale treatment (`filter: grayscale(1) contrast(1.05)`) with explicit credits in the footer; all live software fragments carry `data-ui` on their root.
