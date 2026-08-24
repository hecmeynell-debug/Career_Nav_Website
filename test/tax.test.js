'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { personalAllowance, takeHome } = require('../src/tax');

const near = (a, b, tol = 1) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test('personal allowance tapers over 100k and hits zero at 125,140', () => {
  assert.equal(personalAllowance(50000), 12570);
  assert.equal(personalAllowance(100000), 12570);
  assert.equal(personalAllowance(110000), 12570 - 5000); // withdrawn £1 per £2 over 100k
  assert.equal(personalAllowance(125140), 0);
  assert.equal(personalAllowance(200000), 0);
});

test('basic-rate earner: £30k', () => {
  const r = takeHome(30000);
  near(r.tax, 3486);   // 20% of (30000 - 12570)
  near(r.ni, 1394.4);  // 8% of (30000 - 12570)
  near(r.net, 25119.6);
});

test('over-100k earner: £120k reflects the tapered allowance', () => {
  const r = takeHome(120000);
  near(r.tax, 39432);
  near(r.ni, 4410.6);
  near(r.net, 76157.4);
});

test('the £100k-£125k band has a ~62% marginal rate', () => {
  const a = takeHome(110000).net;
  const b = takeHome(111000).net;
  const keptOfLast1000 = b - a;      // what you keep from £1,000 more gross
  near(keptOfLast1000, 380, 5);      // 62% marginal -> keep ~38%
});

test('additional-rate band applies above £125,140', () => {
  const a = takeHome(150000).net;
  const b = takeHome(151000).net;
  const kept = b - a;                // 45% tax + 2% NI -> keep ~53%
  near(kept, 530, 5);
});

test('zero and negative income are handled', () => {
  assert.equal(takeHome(0).net, 0);
  assert.equal(takeHome(-5000).net, 0);
});
