# Career Navigator

An interactive, honesty-first careers explorer for the UK. It helps someone work out which careers fit them, understand what each one is actually like, see the exact route in, and (if they upload a CV) find the smartest move from where they are now.

The working application is a single self-contained HTML file in `prototype/`. This repository wraps that prototype in the scaffolding a real project needs: the dataset extracted into structured, validated JSON, the scoring and tax logic pulled into tested modules, and a pipeline to replace estimated salaries with sourced ONS data.

> **Status: early. Version 0.1.** The app works end to end. The surrounding project is set up so the next work (sourcing the data, adding a backend) has somewhere to live. See `ROADMAP.md`.

## Why this exists

Most careers tools are either free and authoritative but shallow (the National Careers Service, Prospects) or slick but hollow. The wager here is that the honest version wins: match people well, show real pay and durability data, lay out the concrete route in, and be explicit about where the numbers are solid and where they are judgement. That last part is the whole point, and it is enforced in code, not just promised in copy.

## Repository layout

```
career-navigator/
  prototype/          the working app (single HTML file), treated as read-only here
  data/               the dataset, as structured JSON (the source of truth)
  src/                tested logic modules (tax engine, scoring, schema)
  scripts/            data pipeline (validate, ingest ONS salaries, build)
  test/               unit tests (Node's built-in runner, zero dependencies)
  docs/               architecture, methodology, data provenance
  legal/              draft privacy policy, terms, and disclaimers (need a solicitor)
  .github/workflows/  CI (validate + test + build on every push)
  README.md  ROADMAP.md  CLAUDE.md
```

## The data

The 120 careers were extracted out of the prototype into `data/`, split by concern so each part can be owned and cited independently:

- `careers.json` - the 120 records: axes, work-style code, tags, blurb, route.
- `salaries.json` - five-stage salary per career, kept separate because the ONS pipeline will overwrite it. Currently all `"source": "estimate"`.
- `axes.json`, `riasec.json`, `domains.json` - the definitions the model runs on.
- `quiz.json`, `personas.json`, `mbti-types.json`, `skills-dictionary.json` - the questionnaire and CV-matching inputs.
- `soc-mapping.json`, `automation-risk.json`, `sources.json` - the provenance scaffolding. SOC codes and risk scores are deliberately `null` with a `todo` status, because inventing them would defeat the point. `sources.json` holds the real citations for every external source.

## Running it

Requires Node 18 or newer. No dependencies to install.

```bash
npm run validate     # check every career record against the schema; fails on any error
npm test             # run the unit tests (tax engine, scoring, data integrity)
npm run build        # merge data into dist/careers.built.json with provenance stamps
npm run check        # all three, as CI runs them
```

To open the app locally, open `prototype/career-navigator.html` in a browser.

## Deploying

Deployment is automated from the prototype, so there is no duplicated HTML to maintain. `npm run build:site` generates `public/index.html` from the prototype; both hosts below run that for you.

**GitHub Pages.** A workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`. One-time setup: in the repo, go to **Settings -> Pages -> Source** and choose **GitHub Actions**. After that, every push runs the checks and, if green, publishes to `https://YOUR-USERNAME.github.io/career-navigator/`.

**Netlify.** `netlify.toml` holds the config. On netlify.com, choose **Add new site -> Import an existing project**, pick this repo, and accept the defaults; Netlify reads the file and deploys on every push. This gives the cleaner URL.

Either way, deploying is a single `git push` once set up.

## The salary pipeline

The headline task is replacing estimated salaries with sourced ONS figures. The pipeline is built; it needs the data dropped in.

```bash
# 1. Map each career to a SOC 2020 code in data/soc-mapping.json (see docs/data-provenance.md)
# 2. Download ONS ASHE Table 14 (4-digit SOC 2020) to data/ashe-raw.csv
# 3. Ingest:
npm run ingest       # writes data/salaries.json with an ONS citation on every value
npm run build        # rebuild; the build report shows how many are now sourced
```

A mock run works today without any download, against isolated sample files, so the pipeline and its tests pass out of the box:

```bash
npm run ingest:mock  # writes data/salaries.sample.json, canonical data untouched
```

## Honesty, enforced

The schema validator (`src/schema.js`) will fail the build if a salary record claims an ONS source without a citation. The build report (`dist/build-report.json`) states plainly how many salaries are sourced versus estimated. The axes are labelled `structured-judgement` in the built output. The intent is that the app can never quietly present a guess as a fact.

## Documentation

- `ROADMAP.md` - the phased plan from prototype to product.
- `docs/architecture.md` - how the pieces fit together.
- `docs/methodology.md` - how the scoring, axes, and matching work, and their limits.
- `docs/data-provenance.md` - where every number comes from and how to source the rest.
- `CLAUDE.md` - a working brief for continuing the project with an AI assistant.

## Licence

Not yet decided. Marked `UNLICENSED` in `package.json` until then.
