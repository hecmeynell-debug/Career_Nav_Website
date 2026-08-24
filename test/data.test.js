'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { validateDataset } = require('../src/schema');

const dataDir = path.join(__dirname, '..', 'data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));

test('the dataset validates cleanly', () => {
  const report = validateDataset({
    careers: read('careers.json'),
    salaries: read('salaries.json'),
    domains: read('domains.json'),
  });
  assert.deepEqual(report.errors, []);
  assert.ok(report.ok);
});

test('there are 120 careers, each with a work-style code and tags', () => {
  const careers = read('careers.json');
  assert.equal(careers.length, 120);
  assert.ok(careers.every((c) => Array.isArray(c.workStyle) && c.workStyle.length === 6));
  assert.ok(careers.every((c) => c.tags.length >= 1));
});

test('every tag points at a defined domain', () => {
  const domains = new Set(Object.keys(read('domains.json')));
  const careers = read('careers.json');
  const bad = careers.flatMap((c) => c.tags.filter((t) => !domains.has(t)));
  assert.deepEqual(bad, []);
});

test('salary sourcing is honestly labelled (estimates until the pipeline runs)', () => {
  const salaries = read('salaries.json');
  // No record may claim an ONS source without a citation.
  const liars = salaries.filter((s) => s.source && s.source !== 'estimate' && !s.citation);
  assert.deepEqual(liars, []);
});

test('the ingest pipeline matches sample SOC codes in mock mode', () => {
  const { run } = require('../scripts/ingest-ashe');
  const result = run({ mock: true });
  assert.equal(result.matched, 3);
  assert.equal(result.missingSoc, 0);
});
