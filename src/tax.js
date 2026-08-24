'use strict';
/**
 * UK take-home pay engine, England, tax year 2026/27.
 *
 * Verified against gov.uk / HMRC and the House of Commons Library:
 *  - Personal allowance: £12,570, tapered by £1 for every £2 earned over £100,000,
 *    reaching £0 at £125,140.
 *  - Income tax: 20% basic to £50,270, 40% higher to £125,140, 45% additional above.
 *  - Employee National Insurance: 8% between £12,570 and £50,270, then 2% above.
 *
 * Scotland has different income tax bands and is intentionally not modelled here.
 * This is the one part of the project anchored in hard data rather than judgement.
 */

const PERSONAL_ALLOWANCE = 12570;
const TAPER_START = 100000;      // allowance taper begins
const TAPER_END = 125140;        // allowance fully withdrawn
const BASIC_BAND_WIDTH = 37700;  // width of the 20% band above the allowance
const HIGHER_LIMIT = 125140;     // 40% up to here, 45% above
const NI_PRIMARY_THRESHOLD = 12570;
const NI_UPPER_LIMIT = 50270;

const clampAbove = (value, floor) => Math.max(0, value - floor);
const between = (value, lower, upper) => Math.max(0, Math.min(value, upper) - lower);

/** Personal allowance after the over-£100k taper. */
function personalAllowance(gross) {
  if (gross <= TAPER_START) return PERSONAL_ALLOWANCE;
  return Math.max(0, PERSONAL_ALLOWANCE - Math.floor((gross - TAPER_START) / 2));
}

/** Income tax due on a gross annual salary (pounds). */
function incomeTax(gross) {
  const pa = personalAllowance(gross);
  const higherThreshold = pa + BASIC_BAND_WIDTH;
  return (
    0.20 * between(gross, pa, higherThreshold) +
    0.40 * between(gross, higherThreshold, HIGHER_LIMIT) +
    0.45 * clampAbove(gross, HIGHER_LIMIT)
  );
}

/** Employee National Insurance due on a gross annual salary (pounds). */
function nationalInsurance(gross) {
  return (
    0.08 * between(gross, NI_PRIMARY_THRESHOLD, NI_UPPER_LIMIT) +
    0.02 * clampAbove(gross, NI_UPPER_LIMIT)
  );
}

/**
 * Full breakdown for a gross annual salary in pounds.
 * @returns {{gross:number, tax:number, ni:number, net:number, effectiveRate:number}}
 */
function takeHome(gross) {
  if (gross <= 0) return { gross: 0, tax: 0, ni: 0, net: 0, effectiveRate: 0 };
  const tax = incomeTax(gross);
  const ni = nationalInsurance(gross);
  const net = gross - tax - ni;
  return { gross, tax, ni, net, effectiveRate: ((tax + ni) / gross) * 100 };
}

/** Convenience wrapper for salaries expressed in thousands (as the dataset stores them). */
function takeHomeK(grossThousands) {
  const r = takeHome(grossThousands * 1000);
  return {
    grossK: grossThousands,
    netK: r.net / 1000,
    effectiveRate: r.effectiveRate,
  };
}

module.exports = {
  PERSONAL_ALLOWANCE,
  personalAllowance,
  incomeTax,
  nationalInsurance,
  takeHome,
  takeHomeK,
};
