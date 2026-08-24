'use strict';
/**
 * Merges the source data files into a single dist/careers.built.json that a future
 * front end can consume directly, and stamps each career with its data provenance
 * so the app can show, per number, whether it is sourced or an estimate.
 *
 *   node scripts/build-careers.js
 */
const fs = require('fs');
const path = require('path');
const { validateDataset } = require('../src/schema');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const distDir = path.join(root, 'dist');
const read = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));

const careers = read('careers.json');
const salaries = read('salaries.json');
const domains = read('domains.json');
const risk = read('automation-risk.json');

const check = validateDataset({ careers, salaries, domains });
if (!check.ok) {
  console.error('Refusing to build: data validation failed. Run `npm run validate` for details.');
  process.exit(1);
}

const salById = new Map(salaries.map((s) => [s.id, s]));
const riskById = new Map(risk.map((r) => [r.id, r]));

const built = careers.map((c) => {
  const sal = salById.get(c.id) || {};
  const rk = riskById.get(c.id) || {};
  return {
    ...c,
    salary: sal.stages || null,
    automationRisk: { probability: rk.probability ?? null, band: rk.riskBand ?? null },
    provenance: {
      salary: sal.source || 'estimate',
      salaryCitation: sal.citation || null,
      socCode: sal.socCode || null,
      axes: 'structured-judgement',
      automationRisk: rk.source || 'unsourced',
    },
  };
});

// A quick provenance summary so it is obvious how much of the data is real vs estimated.
const sourced = built.filter((c) => c.provenance.salary === 'ons-ashe').length;

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, 'careers.built.json'), JSON.stringify(built, null, 2) + '\n');
fs.writeFileSync(
  path.join(distDir, 'build-report.json'),
  JSON.stringify({ builtAt: new Date().toISOString(), total: built.length, salarySourcedFromONS: sourced }, null, 2) + '\n'
);

console.log(`Built ${built.length} careers -> dist/careers.built.json`);
console.log(`Salary sourced from ONS: ${sourced}/${built.length} (rest are estimates).`);
