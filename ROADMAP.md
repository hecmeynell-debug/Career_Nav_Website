# Roadmap

How Career Navigator goes from a working prototype to a full product.

The ordering here is deliberate. Two things come first because they make it a better product and a stronger portfolio piece at the same time, with no trade-off: getting it deployed, and sourcing the data properly. The unglamorous middle (backend, legal, accessibility) is non-negotiable before real people use it. Growth work is genuinely last.

Two honest caveats up front:
- Whatever timeline you estimate, roughly double it. The boring 20 percent (edge cases, deployment quirks, the one dataset cell that will not map) always takes longer than expected.
- You do not need to finish all of this before it pays off. The moment it is live with real ONS data and a short case study behind it, it is already a genuine hiring asset. Everything after that is refinement.

Effort estimates assume part-time work (evenings and weekends) with an AI coding assistant doing the heavy lifting.

---

## Phase 0 - Foundations
Set the project up so everything after it is maintainable.
- [ ] Put the project in a Git repository with a clean history, a `.gitignore`, and the README
- [ ] Update `CLAUDE.md` to reflect the current state (120 careers, the CDN parser dependency)
- [ ] Choose the primary audience. Career-changers weighing a pivot are the sharpest fit for what is already built
- [ ] Register a domain and settle on the name

Effort: 1 to 2 days.

## Phase 1 - Ship it, and fix the data
Get it live, and make the numbers credible. This is the highest-value phase and has no trade-off between product and portfolio.
- [ ] Deploy the current file to a static host (Netlify, Vercel or Cloudflare Pages). An afternoon, and the single highest-payoff step
- [ ] Map all 120 careers to ONS SOC occupation codes
- [ ] Replace the salary arrays with ONS ASHE earnings percentiles, handling gaps and suppressed cells, and cite the source per career
- [ ] Ground the future-proofing axis in the automation-risk literature (Frey-Osborne, OECD, PwC) rather than asserting it
- [ ] Build a small pipeline that ingests and refreshes the salary data on a schedule. This doubles as the data-engineering work that makes the project a strong portfolio piece
- [ ] Get a second opinion on the axis scores so they are not one person's judgement

Effort: deploy is an afternoon; data sourcing is 2 to 4 weeks (it is manual and slow, not hard).

Done when: every salary figure is sourced and cited, and the disclaimer matches reality.

## Phase 2 - Re-architect and add a backend
Turn one file into a real codebase, and give it a memory.
- [ ] Split the single HTML file into separate data, logic, style and component files
- [ ] Move the career dataset out of a hardcoded array into JSON or a database that the pipeline writes to
- [ ] Introduce a build setup or a lightweight framework (the zero-dependency constraint is already gone)
- [ ] Add real error handling across the app, not just the happy paths
- [ ] Stand up a backend (Supabase or Firebase are the fast routes)
- [ ] Add authentication and user accounts
- [ ] Persist saved quiz results, comparisons and CV analyses per user

Effort: 2 to 4 weeks.

## Phase 3 - CV analyser, proper version
Replace the keyword heuristic with something that reads meaning.
- [ ] Move CV scoring to an LLM call behind the backend
- [ ] Add cost controls and rate limiting on the LLM calls
- [ ] Handle the privacy model explicitly: process transiently, never store the raw CV, and say so
- [ ] Add legacy `.doc` support or a clean conversion path

Effort: 1 to 2 weeks.

Note: this fixes the heuristic's failure modes, for example a nurse being told surgery is a short hop.

## Phase 4 - Legal, privacy and accessibility
The non-negotiable middle before real people use it.
- [ ] Write a privacy policy and terms of service (you process CVs and touch financial and career guidance)
- [ ] Handle GDPR: a lawful basis, data deletion, and a consent approach that matches the privacy-first framing
- [ ] Add clear liability disclaimers, especially near the financial and salary content
- [ ] Audit for bias: score only skills and fit, never demographic proxies (name, gaps, school signals)
- [ ] Fix accessibility: ARIA labels, keyboard navigation, and text alternatives for the SVG charts
- [ ] Test on mobile and across browsers

Effort: 1 to 2 weeks.

## Phase 5 - Validate against reality
Check the model against the world, not just against itself.
- [ ] Add a feedback loop so users can say whether a match felt right
- [ ] Compare the model's outputs against real satisfaction and salary data over time
- [ ] Add a test suite: unit tests on the scoring, matching and tax logic, plus a data-validation step that catches malformed careers

Effort: ongoing.

## Phase 6 - Positioning
Turn the work into a hiring asset or a launch.
- [ ] Write a methodology case study: the honesty layer, the scoring, the data sourcing, and the trade-offs
- [ ] Keep the code legible: clean architecture, a clear README, and a short "why it is built this way" write-up a reviewer can absorb in ten minutes

Effort: a few days. Punches above its weight for a job hunt.

## Phase 7 - Growth
Only if you are going for real users. Deliberately last.
- [ ] SEO and content that gets the site discovered
- [ ] A sharing or referral loop
- [ ] Expand the library beyond 120, but only once the sourcing pipeline makes each addition genuinely sourced rather than guessed

Effort: open-ended.

---

## The one-line version

Deploy it, source the data properly, then decide whether the next hour goes into making it legible (for a hiring manager) or making it grow (for users). The shared core comes first. The fork only matters at the margin.
