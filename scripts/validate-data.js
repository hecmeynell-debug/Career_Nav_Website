'use strict';
/**
 * Validates every data file and exits non-zero on any problem.
 * Wired into CI so a malformed or uncited career record fails the build.
 *
 *   node scripts/validate-data.js
 */
const fs = require('fs');
const path = require('path');
const { validateDataset } = require('../src/schema');

const dataDir = path.join(__dirname, '..', 'data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));

const careers = read('careers.json');
const salaries = read('salaries.json');
const domains = read('domains.json');

const report = validateDataset({ careers, salaries, domains });

console.log(`Checked ${report.counts.careers} careers against ${report.counts.domains} domains.`);
if (report.ok) {
  console.log('Data validation passed.');
  process.exit(0);
} else {
  console.error(`Data validation FAILED with ${report.errors.length} error(s):`);
  for (const err of report.errors) console.error('  - ' + err);
  process.exit(1);
}
