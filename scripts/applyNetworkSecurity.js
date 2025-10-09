#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error('Usage: node applyNetworkSecurity.js <path-to-AndroidManifest.xml>');
  process.exit(2);
}

const fullPath = path.resolve(manifestPath);
if (!fs.existsSync(fullPath)) {
  console.error('Manifest file not found:', fullPath);
  process.exit(3);
}

let text = fs.readFileSync(fullPath, 'utf8');

const attrUses = 'android:usesCleartextTraffic="true"';
const attrNet = 'android:networkSecurityConfig="@xml/network_security_config"';

const idxApp = text.indexOf('<application');
if (idxApp === -1) {
  console.error('No <application> tag found in manifest');
  process.exit(4);
}

// Find end of start-tag '>' for the application element (not the closing tag)
let pos = idxApp;
let inQuote = false;
let endTag = -1;
while (pos < text.length) {
  const ch = text[pos];
  if (ch === '"') inQuote = !inQuote;
  if (ch === '>' && !inQuote) { endTag = pos; break; }
  pos++;
}

if (endTag === -1) {
  console.error('Could not find end of <application> start tag');
  process.exit(5);
}

const startTag = text.slice(idxApp, endTag + 1);

let newTag = startTag;
if (!/android:usesCleartextTraffic\s*=/.test(startTag)) {
  // insert before final >
  newTag = startTag.replace(/>\s*$/, ' ' + attrUses + ' >');
}
if (!/android:networkSecurityConfig\s*=/.test(newTag)) {
  newTag = newTag.replace(/>\s*$/, ' ' + attrNet + ' >');
}

if (newTag !== startTag) {
  const newText = text.slice(0, idxApp) + newTag + text.slice(endTag + 1);
  fs.writeFileSync(fullPath, newText, 'utf8');
  console.log('Updated manifest with networkSecurity attributes:', fullPath);
} else {
  console.log('Manifest already contains networkSecurity attributes');
}
