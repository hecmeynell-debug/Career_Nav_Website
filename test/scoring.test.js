'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { outcomeFit, styleFit, careerType, mbtiCompat, blendedFit } = require('../src/scoring');

test('outcomeFit of neutral priorities against mid axes is ~50', () => {
  const imp = { pay: 5, future: 5, secure: 5, entry: 5, speed: 5, life: 5, option: 5 };
  const axes = { pay: 5, future: 5, secure: 5, entry: 5, speed: 5, life: 5, option: 5 };
  assert.ok(Math.abs(outcomeFit(imp, axes) - 50) < 0.001);
});

test('styleFit is 100 for an identical profile and bounded 0-100', () => {
  assert.ok(styleFit([10, 10, 10, 10, 10, 10], [9, 9, 9, 9, 9, 9]) >= 99);
  const far = styleFit([10, 0, 10, 0, 10, 0], [0, 9, 0, 9, 0, 9]);
  assert.ok(far >= 0 && far <= 100);
});

test('careerType derives sensible MBTI leanings', () => {
  // Quant-like: highly investigative, low social, structured.
  assert.equal(careerType([1, 9, 3, 1, 4, 7], 5.5).letters, 'INTJ');
  // Accountant-like: structured, conventional, low artistic.
  assert.equal(careerType([1, 5, 1, 3, 5, 9], 8).letters, 'ISTJ');
});

test('mbtiCompat returns null without a type and a 0-100 score with one', () => {
  assert.equal(mbtiCompat('', [5, 5, 5, 5, 5, 5]), null);
  const c = mbtiCompat('INTJ', [1, 9, 3, 1, 4, 7], 5.5);
  assert.ok(c >= 0 && c <= 100);
  assert.ok(c >= 65); // a letter-matching type scores well above the 50 midpoint
  // and a directly opposed type should score clearly lower
  assert.ok(mbtiCompat('ESFP', [1, 9, 3, 1, 4, 7], 5.5) < c);
});

test('blendedFit falls back to pure outcome when no quiz and no type', () => {
  const args = {
    importance: { pay: 8, future: 5, secure: 5, entry: 5, speed: 5, life: 5, option: 5 },
    axes: { pay: 8, future: 6, secure: 6, entry: 6, speed: 6, life: 6, option: 6 },
    userRiasec: [5, 5, 5, 5, 5, 5],
    workStyle: [3, 8, 4, 2, 4, 6],
    secureAxis: 6,
    userMbti: '',
    quizTaken: false,
  };
  const r = blendedFit(args);
  assert.equal(r.fit, Math.round(r.outcome));
});
