# Methodology

This document explains how the matching and scoring work, and is deliberately candid about what is measured and what is judged. It doubles as the honest case study a reviewer can read in ten minutes.

## The two tiers of trust

Everything the app shows falls into one of two categories.

**Anchored in data:** the salary figures (once the ONS pipeline has run) and the take-home tax engine. The tax engine is verified against gov.uk for England, 2026/27, and pinned by tests.

**Structured judgement:** the seven axis scores, and therefore every match, verdict, and psychological read. These are a considered model, not measurements. The `future` axis in particular is a forecast about automation, not an observation.

The project's core discipline is never blurring the two. The schema validator fails the build if a salary claims a source without a citation, and the built dataset labels the axes `structured-judgement` explicitly.

## The seven axes

Each career is scored 0 to 10 on: pay, future (resistance to automation), security, ease of entry, speed to peak pay, work-life balance, and independence. These are defined in `data/axes.json`. They are the author's structured judgement and are the largest source of subjectivity in the product. The roadmap's answer is to crowd-calibrate them rather than rely on one person's view.

## Matching

A user's result blends up to three signals.

1. **Outcome fit.** The user's stated priorities (from the questionnaire or the sliders) are a weight vector over the seven axes. Outcome fit is the normalised weighted sum of a career's axis scores against those weights.

2. **Work-style fit.** The questionnaire also infers a RIASEC profile (the six vocational-interest dimensions: realistic, investigative, artistic, social, enterprising, conventional). Each career carries its own six-value RIASEC code. Work-style fit is the closeness of the two vectors. This is what lets a temperament question ("I would rather express my own ideas than follow a proven method") pull a user toward the creative careers.

3. **MBTI compatibility (optional).** If the user gives a type, the app derives each career's MBTI-leaning type from its RIASEC code plus its security axis, then scores compatibility dimension by dimension.

The blend is weighted 60/40 outcome/work-style when the questionnaire has been taken, shifting to 50/30/20 when a type is also given, and falling back to pure outcome fit when only the sliders are used.

## On MBTI

MBTI is included because it is engaging and users ask for it, but it is psychometrically weak: poor test-retest reliability, and no established link to job performance. It is therefore soft-weighted, clearly caveated in the app, and paired with RIASEC, which is the model vocational psychology actually uses. It should never be the deciding factor in a match.

## The CV analyser

The CV analyser is a transparent heuristic. It reads keywords and structure against a skills dictionary, not meaning. It scores CV quality on a rubric, estimates fit against each career's requirements, and ranks pivots by transferability and desirability. Two deliberate guards keep it honest: effort ratings reflect the actual entry barrier, not just skill overlap (so a nurse is never told surgery is a "short hop"), and regulated careers flag their required licence as a hard gap. The roadmap replaces this heuristic with a language-model version once there is a backend to hold it.

## Known limitations

- The axis scores are one person's judgement until calibrated.
- Salaries are estimates until the ONS pipeline runs.
- The model has never been validated against real career-satisfaction outcomes. It is internally consistent and plausible, which is not the same as correct.
- Route maps are indicative and vary by employer and by nation of the UK.
