'use strict';
/**
 * Builds the deployable static site into public/.
 *
 * The prototype HTML is the single source of truth. Rather than commit a duplicate
 * index.html at the repo root, this generates public/index.html from it at build time,
 * so the site and the prototype can never drift apart.
 *
 *   node scripts/build-site.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const source = path.join(root, 'prototype', 'career-navigator.html');

if (!fs.existsSync(source)) {
  console.error(`Cannot find the prototype at ${source}`);
  process.exit(1);
}

fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(source, path.join(publicDir, 'index.html'));
// Tell GitHub Pages to serve files as-is (no Jekyll processing).
fs.writeFileSync(path.join(publicDir, '.nojekyll'), '');

console.log('Built site -> public/index.html');
