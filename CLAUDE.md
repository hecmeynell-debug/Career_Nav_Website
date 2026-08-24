# Career Navigator - Project Brief

A careers explorer for the UK. Users take a questionnaire, get ranked matches, open any
career for a full report and route in, overlay careers to compare them, and analyse a CV to
find pivots. The differentiator is not breadth; it is the honest scoring, the route maps, the
overlay comparison, and the CV-to-pivot fusion, plus a discipline about labelling what is data
versus judgement.

## Current state
- **120 careers.** Trades are broken out individually. `id: 'you'` is ML/AI engineering; it is
  no longer visually singled out (the old "your plan" flag was removed).
- The working app is a single self-contained HTML file at `prototype/career-navigator.html`.
  Treat it as read-only unless deliberately changing the UI.
- The dataset has been extracted out of the HTML into `data/*.json`, which is now the source of
  truth. The prototype still carries an inline copy; a future front end should read the built
  dataset instead.

## Repository map
- `data/` - the dataset as JSON (careers, salaries, axes, riasec, domains, quiz, dictionaries,
  and the provenance files: soc-mapping, automation-risk, sources).
- `src/` - tested logic: `tax.js` (UK take-home), `scoring.js` (matching, work-style, MBTI),
  `schema.js` (validation).
- `scripts/` - `validate-data.js`, `ingest-ashe.js`, `build-careers.js`.
- `test/` - Node built-in test runner, zero dependencies.
- `docs/`, `legal/` - methodology, provenance, architecture; draft privacy/terms/disclaimers.

## Commands
- `npm run validate` - schema check; fails on any bad record.
- `npm test` - unit tests.
- `npm run build` - merge to `dist/careers.built.json` with provenance stamps.
- `npm run ingest:mock` - run the salary pipeline against sample data (safe, non-destructive).
- `npm run check` - all of the above, as CI runs.

## Data-integrity rules (the point of the project)
- Two tiers of trust, and never blur them. Salary and tax are anchored in data; the seven axis
  scores are structured judgement; the `future` axis is a forecast.
- The tax engine (`src/tax.js`) is verified against gov.uk for 2026/27 England. Do not change the
  thresholds without re-checking and updating the tests.
- Most of the 120 salary figures are currently estimates. `salaries.json` marks them
  `source: "estimate"`. The schema forbids claiming an ONS source without a citation.
- MBTI is included but caveated; it is soft-weighted and paired with RIASEC.
- Route maps are indicative and vary by employer and UK nation.

## Known architectural facts
- The prototype loads `pdf.js` and `mammoth.js` from a CDN (cdnjs) to parse PDF and Word CVs in
  the browser. This was a deliberate decision that broke the original offline, zero-dependency
  constraint. Only the parser library is fetched; the user's CV never leaves the browser.
- The app uses no backend, no accounts, and no browser storage. State is per-session.

## Roadmap priority (see ROADMAP.md)
1. Deploy the prototype live, and source the salaries from ONS ASHE (the pipeline is built and
   waiting for SOC codes plus the ASHE download). Highest value, no product/portfolio trade-off.
2. Then the non-negotiable middle: backend and accounts, the LLM CV analyser, legal, accessibility.
3. Growth last. Do not mass-add careers past 120 until each addition can be genuinely sourced.

## Working style
- Keep prose free of em dashes and other AI tells (the copy was deliberately cleaned).
- Validate every change: `npm run check` should stay green.
- When something is judgement, say so in the product. That honesty is the moat.
