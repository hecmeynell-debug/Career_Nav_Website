'use strict';
/**
 * Schema and integrity checks for the career dataset.
 * Pure functions returning arrays of error strings, so they can be used both
 * by the CI validation script and by any future admin tooling.
 */

const AXIS_KEYS = ['pay', 'future', 'secure', 'entry', 'speed', 'life', 'option'];
const SALARY_STAGES = ['entry', 'early', 'mid', 'senior', 'peak'];

function isNum(x) { return typeof x === 'number' && Number.isFinite(x); }
function inRange(x, lo, hi) { return isNum(x) && x >= lo && x <= hi; }

/** Validate a single career record from careers.json. */
function validateCareer(c, knownDomains) {
  const e = [];
  const id = c && c.id ? c.id : '(missing id)';
  if (!c.id || typeof c.id !== 'string') e.push(`${id}: missing/invalid id`);
  if (!c.name) e.push(`${id}: missing name`);
  if (!c.colour || !/^#[0-9A-Fa-f]{6}$/.test(c.colour)) e.push(`${id}: colour must be a 6-digit hex`);

  if (!c.axes || typeof c.axes !== 'object') {
    e.push(`${id}: missing axes`);
  } else {
    for (const k of AXIS_KEYS) {
      if (!inRange(c.axes[k], 0, 10)) e.push(`${id}: axis "${k}" must be 0-10 (got ${c.axes[k]})`);
    }
    const extra = Object.keys(c.axes).filter((k) => !AXIS_KEYS.includes(k));
    if (extra.length) e.push(`${id}: unexpected axis keys: ${extra.join(', ')}`);
  }

  if (!Array.isArray(c.workStyle) || c.workStyle.length !== 6) {
    e.push(`${id}: workStyle must be a 6-value RIASEC array`);
  } else if (!c.workStyle.every((v) => inRange(v, 0, 9))) {
    e.push(`${id}: workStyle values must be 0-9`);
  }

  if (!Array.isArray(c.tags) || c.tags.length < 1) {
    e.push(`${id}: needs at least one tag`);
  } else if (knownDomains) {
    for (const t of c.tags) {
      if (!knownDomains.has(t)) e.push(`${id}: tag "${t}" is not a known domain`);
    }
  }

  if (!c.blurb || c.blurb.length < 10) e.push(`${id}: blurb missing or too short`);

  const r = c.route;
  if (!r || typeof r !== 'object') {
    e.push(`${id}: missing route`);
  } else {
    for (const f of ['summary', 'time', 'cost', 'alt']) {
      if (!r[f]) e.push(`${id}: route.${f} missing`);
    }
    if (!Array.isArray(r.steps) || r.steps.length < 3) {
      e.push(`${id}: route.steps needs at least 3 steps`);
    } else if (!r.steps.every((s) => Array.isArray(s) && s.length === 2 && s[0] && s[1])) {
      e.push(`${id}: each route step must be a [title, detail] pair`);
    }
  }
  return e;
}

/** Validate a single salary record from salaries.json. */
function validateSalary(s) {
  const e = [];
  const id = s && s.id ? s.id : '(missing id)';
  if (!s.stages) { e.push(`${id}: missing salary stages`); return e; }
  for (const stage of SALARY_STAGES) {
    if (!inRange(s.stages[stage], 0, 2000)) e.push(`${id}: salary "${stage}" out of range`);
  }
  const vals = SALARY_STAGES.map((k) => s.stages[k]);
  for (let i = 1; i < vals.length; i++) {
    if (vals[i] < vals[i - 1]) e.push(`${id}: salary should not fall from ${SALARY_STAGES[i - 1]} to ${SALARY_STAGES[i]}`);
  }
  // Provenance discipline: once claimed as ONS data, a citation must exist.
  if (s.source && s.source !== 'estimate' && !s.citation) {
    e.push(`${id}: source "${s.source}" claimed but no citation provided`);
  }
  return e;
}

/** Validate the whole dataset. Returns { ok, errors, counts }. */
function validateDataset({ careers, salaries, domains }) {
  const knownDomains = new Set(Object.keys(domains || {}));
  const errors = [];
  const ids = new Set();

  for (const c of careers) {
    if (ids.has(c.id)) errors.push(`duplicate id: ${c.id}`);
    ids.add(c.id);
    errors.push(...validateCareer(c, knownDomains));
  }
  if (salaries) {
    const salIds = new Set(salaries.map((s) => s.id));
    for (const c of careers) if (!salIds.has(c.id)) errors.push(`${c.id}: no salary record`);
    for (const s of salaries) {
      if (!ids.has(s.id)) errors.push(`salary for unknown career: ${s.id}`);
      errors.push(...validateSalary(s));
    }
  }
  return {
    ok: errors.length === 0,
    errors,
    counts: { careers: careers.length, domains: knownDomains.size },
  };
}

module.exports = { AXIS_KEYS, SALARY_STAGES, validateCareer, validateSalary, validateDataset };
