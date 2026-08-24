'use strict';
/**
 * ONS ASHE salary ingest.
 *
 * Reads the ONS Annual Survey of Hours and Earnings (Table 14, 4-digit SOC 2020),
 * maps each career to its SOC code via data/soc-mapping.json, extracts gross annual
 * pay percentiles, and rewrites data/salaries.json with a citation on every value.
 *
 * The sandbox that generated this repo cannot reach ons.gov.uk, so the network fetch
 * is intentionally NOT baked in. Two supported modes:
 *
 *   1. Live:  download ASHE Table 14 as CSV to data/ashe-raw.csv, fill data/soc-mapping.json,
 *             then:  node scripts/ingest-ashe.js
 *             (reads soc-mapping.json + ashe-raw.csv, writes data/salaries.json)
 *
 *   2. Mock:  node scripts/ingest-ashe.js --mock
 *             (reads soc-mapping.sample.json + ashe-sample.csv, writes data/salaries.sample.json)
 *             Nothing in the mock path touches the canonical estimate data.
 *
 * Expected CSV columns: soc, occupation, p10, p25, median, p75, p90  (gross annual pay, pounds)
 *
 * Stage mapping (a documented modelling choice, not a fact - see docs/data-provenance.md):
 *   entry<-p10  early<-p25  mid<-median  senior<-p75  peak<-p90
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const COLS = { soc: 'soc', p10: 'p10', p25: 'p25', median: 'median', p75: 'p75', p90: 'p90' };
const STAGE_FROM = { entry: 'p10', early: 'p25', mid: 'median', senior: 'p75', peak: 'p90' };

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const row = {};
    headers.forEach((h, i) => (row[h] = (cells[i] || '').trim()));
    return row;
  });
}

// ASHE suppresses small/unreliable cells (blank, "x" or ":").
const num = (v) => {
  if (v == null) return null;
  const cleaned = String(v).replace(/[£,\s]/g, '');
  if (['', 'x', ':', '-'].includes(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

function run({ mock = false } = {}) {
  const csvPath = path.join(dataDir, mock ? 'ashe-sample.csv' : 'ashe-raw.csv');
  const mapPath = path.join(dataDir, mock ? 'soc-mapping.sample.json' : 'soc-mapping.json');
  const outPath = path.join(dataDir, mock ? 'salaries.sample.json' : 'salaries.json');
  const basePath = path.join(dataDir, 'salaries.json'); // canonical estimates, to preserve unmatched rows

  if (!fs.existsSync(csvPath)) {
    const msg = mock ? 'The sample file is missing.' : 'Download ASHE Table 14 to data/ashe-raw.csv, or run with --mock.';
    throw new Error(`No ASHE file at ${csvPath}. ${msg}`);
  }
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const bySoc = new Map(rows.map((r) => [String(r[COLS.soc]).trim(), r]));

  const socMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
  const baseById = new Map(base.map((s) => [s.id, s]));

  const today = new Date().toISOString().slice(0, 10);
  const citation = mock
    ? 'MOCK sample data - not real ONS figures'
    : 'ONS ASHE Table 14 (4-digit SOC 2020), Open Government Licence v3.0';

  let matched = 0, missingSoc = 0, missingRow = 0, suppressed = 0;
  const out = socMap.map((m) => {
    const prev = baseById.get(m.id) || { id: m.id, stages: null, source: 'estimate' };
    if (!m.soc2020) { missingSoc++; return { ...prev, socCode: null }; }
    const row = bySoc.get(String(m.soc2020).trim());
    if (!row) { missingRow++; return { ...prev, socCode: m.soc2020 }; }
    const stages = {};
    let anyNull = false;
    for (const [stage, col] of Object.entries(STAGE_FROM)) {
      const raw = num(row[COLS[col]]);
      if (raw == null) anyNull = true;
      stages[stage] = raw == null ? null : Math.round(raw / 1000);
    }
    if (anyNull) suppressed++;
    matched++;
    return { id: m.id, stages, source: mock ? 'mock' : 'ons-ashe', socCode: m.soc2020, citation, lastUpdated: today };
  });

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  return { matched, missingSoc, missingRow, suppressed, outPath, mock };
}

if (require.main === module) {
  try {
    const r = run({ mock: process.argv.includes('--mock') });
    console.log(`ASHE ingest complete (${r.mock ? 'MOCK' : 'LIVE'}) -> ${path.relative(path.join(__dirname, '..'), r.outPath)}`);
    console.log(`  matched: ${r.matched}   missing SOC code: ${r.missingSoc}   SOC not in ASHE: ${r.missingRow}   with suppressed cells: ${r.suppressed}`);
    if (!r.mock && r.missingSoc) console.log('  -> fill data/soc-mapping.json to raise coverage.');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { run, parseCsv, num };
