# Data provenance

Where every number comes from, and how to replace the estimates with sourced data. Full citations for each source are in `data/sources.json`.

## Current state

| Data | Source | Status |
|------|--------|--------|
| Take-home tax | HMRC / gov.uk, 2026/27 England | Verified, tested |
| Salaries | Author estimates | To be replaced by ONS ASHE |
| Axis scores (7) | Author's structured judgement | To be crowd-calibrated |
| Automation-risk axis | Author's judgement | To be grounded in the literature |
| Routes | Author's knowledge of UK entry paths | Indicative; verify per profession |
| SOC codes | Not yet assigned | `todo` in `soc-mapping.json` |

Most salary figures are currently estimates. This is stated in the app and enforced by the schema: no salary may claim an ONS source without a citation.

## Sourcing salaries (the priority task)

1. **Assign SOC codes.** For each career in `data/soc-mapping.json`, find its 4-digit SOC 2020 unit group using the ONS SOC 2020 coding tool, and set `soc2020` and `status: "verified"`. Some careers map cleanly to one code; others (for example the individual trades) map to a shared group, which is worth noting.

2. **Download ASHE.** Get ONS ASHE Table 14 (Occupation, 4-digit SOC 2020) and save it as `data/ashe-raw.csv`. Rename its columns to `soc, occupation, p10, p25, median, p75, p90` (gross annual pay), or adjust the `COLS` map in `scripts/ingest-ashe.js`.

3. **Ingest.** Run `npm run ingest`. Every matched career gets its five salary stages from the percentiles, with an ONS citation and the date attached.

### The percentile-to-stage mapping

The five app stages are mapped onto ASHE percentiles as: entry from p10, early from p25, mid from the median, senior from p75, peak from p90. This is a modelling choice, not a fact. It approximates a career arc with a cross-sectional snapshot of everyone currently in the occupation, which is a reasonable proxy but not the same thing. It should be labelled as such wherever it is shown.

### Suppressed cells

ASHE suppresses small or unreliable cells. The pipeline treats blanks, `x` and `:` as null rather than zero, and the build report counts how many careers have suppressed values so gaps are visible rather than hidden.

## Grounding the automation axis

The `future` axis is the most speculative and the most central to the pitch, so it should be the best-sourced judgement in the project, not the worst. Once SOC codes exist:

- Cross-walk to the Frey and Osborne (2017) per-occupation probabilities of computerisation, noting that the cross-walk from US SOC to UK SOC 2020 is approximate.
- Cross-check against the OECD task-based estimates (Nedelkoska and Quintini, 2018), which are more conservative, and the PwC UK analysis.
- Record the figure and its source in `data/automation-risk.json`, and present the axis as a range or a banded estimate rather than a single confident number.

## Calibrating the axes

The other six axes are the author's judgement. The roadmap's fix is to have a handful of people independently rate a subset, compare against the author's scores, and adjust where they diverge. Even a light pass turns "one person's opinion" into "a calibrated estimate", which is a materially stronger claim.
