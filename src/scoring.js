'use strict';
/**
 * Scoring engine, ported from the prototype and organised for testing and reuse.
 *
 * There are two independent signals a career is scored on:
 *   1. Outcome fit   - how well a career's 7 axis scores match the user's stated priorities.
 *   2. Work-style fit - how close a career's RIASEC profile is to the user's inferred one.
 * MBTI compatibility is an optional third signal, derived (not authored) and deliberately
 * treated as soft, because MBTI is psychometrically weak.
 *
 * None of this is measured data. It is a transparent model over subjective inputs.
 */

const AXIS_KEYS = ['pay', 'future', 'secure', 'entry', 'speed', 'life', 'option'];
const RIASEC = ['R', 'I', 'A', 'S', 'E', 'C'];

/** Outcome fit: weighted dot product of importance and axis scores, normalised to 0-100. */
function outcomeFit(importance, axes) {
  const total = AXIS_KEYS.reduce((sum, k) => sum + (importance[k] || 0), 0) || 1;
  const dot = AXIS_KEYS.reduce((sum, k) => sum + (importance[k] || 0) * (axes[k] || 0), 0);
  return (dot / total) * 10; // axes are 0-10, weights 0-10 -> scaled to 0-100
}

/** Work-style fit: closeness of the user's RIASEC vector (0-10) to a career's (0-9), 0-100. */
function styleFit(userRiasec, workStyle) {
  if (!Array.isArray(userRiasec) || !Array.isArray(workStyle)) return 0;
  let diff = 0;
  for (let i = 0; i < 6; i++) diff += Math.abs(userRiasec[i] - (workStyle[i] * 10) / 9);
  return Math.max(0, Math.min(100, 100 - (diff / 6) * 11));
}

/**
 * Derive a career's MBTI-leaning type from its RIASEC code plus its security axis.
 * Returns the four letters and the underlying 0-1 lean on each dimension.
 * This is a heuristic mapping, not a measurement.
 */
function careerType(workStyle, secureAxis = 5) {
  const w = workStyle || [5, 5, 5, 5, 5, 5];
  const pE = (w[4] + w[3]) / 18;          // extraversion  ~ enterprising + social
  const pN = (w[2] + w[1]) / 18;          // intuition     ~ artistic + investigative
  const pF = (w[3] + w[2]) / 18;          // feeling       ~ social + artistic
  const pJ = ((w[5] / 9) * 10 + secureAxis) / 20; // judging ~ structure + stability
  const letters =
    (pE >= 0.5 ? 'E' : 'I') +
    (pN >= 0.5 ? 'N' : 'S') +
    (pF >= 0.5 ? 'F' : 'T') +
    (pJ >= 0.5 ? 'J' : 'P');
  return { letters, lean: [pE, pN, pF, pJ] };
}

/** Compatibility (0-100) between a user's 4-letter type and a career's derived lean. */
function mbtiCompat(type, workStyle, secureAxis = 5) {
  if (!type || type.length !== 4) return null;
  const lean = careerType(workStyle, secureAxis).lean;
  const user = [type[0] === 'E' ? 1 : 0, type[1] === 'N' ? 1 : 0, type[2] === 'F' ? 1 : 0, type[3] === 'J' ? 1 : 0];
  let s = 0;
  for (let i = 0; i < 4; i++) s += 1 - Math.abs(user[i] - lean[i]);
  return Math.round((s / 4) * 100);
}

/**
 * Blended match score.
 * @param opts.quizTaken  whether the RIASEC profile is real (vs neutral defaults)
 * @param opts.userMbti   optional 4-letter type
 */
function blendedFit({ importance, axes, userRiasec, workStyle, secureAxis, userMbti, quizTaken }) {
  const outcome = outcomeFit(importance, axes);
  const style = styleFit(userRiasec, workStyle);
  const mbti = userMbti ? mbtiCompat(userMbti, workStyle, secureAxis) : null;
  let fit;
  if (userMbti && quizTaken) fit = outcome * 0.5 + style * 0.3 + mbti * 0.2;
  else if (quizTaken) fit = outcome * 0.6 + style * 0.4;
  else if (userMbti) fit = outcome * 0.8 + mbti * 0.2;
  else fit = outcome;
  return { fit: Math.round(fit), outcome, style, mbti };
}

/** Human-readable "who it suits" text from a career's top RIASEC dimensions. */
function psychProfile(workStyle, riasecLabels) {
  const w = workStyle || [5, 5, 5, 5, 5, 5];
  const ranked = RIASEC.map((k, i) => [i, w[i]]).sort((a, b) => b[1] - a[1]);
  const phrase = (i) => riasecLabels[i].phrase;
  const label = (i) => riasecLabels[i].label;
  return {
    lead: `Best suited to ${phrase(ranked[0][0])}, and it rewards ${phrase(ranked[1][0])}.`,
    anti: `Less natural if you are mainly drawn to being one of the ${phrase(ranked[5][0])}.`,
    top: [label(ranked[0][0]), label(ranked[1][0])],
  };
}

module.exports = {
  AXIS_KEYS,
  RIASEC,
  outcomeFit,
  styleFit,
  careerType,
  mbtiCompat,
  blendedFit,
  psychProfile,
};
