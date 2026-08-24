# Architecture

## The shape of it

Today the product is one HTML file. This repository does not rewrite it; it builds the structure around it so the next phases have somewhere to go. There are three layers.

**Data** lives in `data/` as JSON and is the single source of truth. The prototype currently carries its own copy of this data inline; the intent is that a future build reads from `dist/careers.built.json` instead, so there is one place to change a number.

**Logic** lives in `src/` as small, dependency-free CommonJS modules that can be tested in isolation:
- `tax.js` - the UK 2026/27 take-home engine. The one part anchored in hard data.
- `scoring.js` - outcome fit, work-style fit, MBTI derivation, and the blend. A transparent model over subjective inputs.
- `schema.js` - validation, used by both CI and the build.

**Pipeline** lives in `scripts/` and turns raw inputs into the built dataset:
- `validate-data.js` - schema and cross-reference checks; fails CI on any error.
- `ingest-ashe.js` - maps ONS ASHE salary percentiles onto careers by SOC code.
- `build-careers.js` - merges everything into `dist/careers.built.json` with provenance stamps.

## Data flow

```
careers.json ----------------+
salaries.json ---------------+---> build-careers.js ---> dist/careers.built.json
automation-risk.json --------+                           dist/build-report.json
        ^
        |
soc-mapping.json  +  ashe-raw.csv  ---> ingest-ashe.js ---> salaries.json
```

The separation matters: salaries flow through a pipeline that stamps provenance, while the subjective axes and the route data are authored directly. Keeping them apart is what lets the app show, per number, whether it is sourced or estimated.

## Why the data is split into several files

A single monolithic career object would mean the ONS pipeline, which only owns pay, has to read and rewrite everything, and a bad write could corrupt hand-authored route text. Splitting `salaries.json` out means the pipeline touches only what it owns. The same logic applies to `soc-mapping.json` and `automation-risk.json`: they are provenance concerns, filled by different processes, so they live in their own files and are merged at build time.

## Testing

Tests use Node's built-in runner (`node --test`), so there is nothing to install and CI is trivial. Three suites:
- `tax.test.js` pins the tax engine to known values, including the 62% marginal band between £100k and £125k.
- `scoring.test.js` checks fit bounds and the MBTI derivation against hand-worked cases.
- `data.test.js` validates the whole dataset and exercises the ingest pipeline in mock mode.

## Where this goes next

The roadmap's Phase 2 (a real front end and a backend) would consume `dist/careers.built.json` rather than the inline array in the prototype, and move user accounts and saved results behind an API. Nothing in this structure has to change for that; the data and logic layers are already separated from the presentation, which is still the single HTML file.
