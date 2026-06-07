// validate_data.mjs — Phase 2 done-state gate.
// Confirms: 8 trigrams; 64 hexagrams with no missing/duplicate King Wen numbers
// and unique binaries; and the Legge translation is complete for all 64
// (judgment + image + six line texts each). Run: npm run validate:data
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const D = join(__dirname, '..', 'src', 'data');
const read = (p) => JSON.parse(readFileSync(join(D, p), 'utf8'));

const errors = [];
const fail = (m) => errors.push(m);

// --- trigrams --------------------------------------------------------------
const trigrams = read('trigrams.json');
if (trigrams.length !== 8) fail(`trigrams: expected 8, got ${trigrams.length}`);
const triIds = new Set(trigrams.map((t) => t.id));
if (triIds.size !== 8) fail('trigrams: duplicate ids');
trigrams.forEach((t) => {
  if (!/^[01]{3}$/.test(t.lines.join(''))) fail(`trigram ${t.id}: bad lines`);
  for (const k of ['name_zh', 'name_pinyin', 'name_en', 'image', 'attribute', 'family']) {
    if (!t[k]) fail(`trigram ${t.id}: missing ${k}`);
  }
});

// --- hexagrams -------------------------------------------------------------
const hexagrams = read('hexagrams.json');
if (hexagrams.length !== 64) fail(`hexagrams: expected 64, got ${hexagrams.length}`);
const kw = new Set();
const bin = new Set();
for (const h of hexagrams) {
  if (kw.has(h.king_wen)) fail(`duplicate King Wen ${h.king_wen}`);
  kw.add(h.king_wen);
  if (bin.has(h.binary)) fail(`duplicate binary ${h.binary}`);
  bin.add(h.binary);
  if (!/^[01]{6}$/.test(h.binary) || h.lines.join('') !== h.binary) fail(`hex ${h.king_wen}: lines/binary mismatch`);
  if (!triIds.has(h.lower_trigram) || !triIds.has(h.upper_trigram)) fail(`hex ${h.king_wen}: bad trigram ref`);
  if (!triIds.has(h.nuclear_lower) || !triIds.has(h.nuclear_upper)) fail(`hex ${h.king_wen}: bad nuclear ref`);
  for (const k of ['name_zh', 'name_pinyin', 'name_en']) if (!h[k]) fail(`hex ${h.king_wen}: missing ${k}`);
}
for (let n = 1; n <= 64; n++) if (!kw.has(n)) fail(`missing King Wen ${n}`);

// --- translation: legge ----------------------------------------------------
let legge;
try {
  legge = read('translations/legge.json');
} catch {
  fail('translations/legge.json not found — run: node scripts/fetch_legge.mjs');
}
if (legge) {
  for (const k of ['translator', 'year', 'source', 'license', 'language']) {
    if (!legge.meta?.[k]) fail(`legge.meta missing ${k}`);
  }
  for (let n = 1; n <= 64; n++) {
    const h = legge.hexagrams?.[n];
    if (!h) {
      fail(`legge: missing hexagram ${n}`);
      continue;
    }
    const placeholder = (s) => !s || /translation loading|PLACEHOLDER/i.test(s);
    if (placeholder(h.judgment)) fail(`legge ${n}: missing/placeholder judgment`);
    if (placeholder(h.image)) fail(`legge ${n}: missing/placeholder image`);
    for (let l = 1; l <= 6; l++) if (placeholder(h.lines?.[l])) fail(`legge ${n}: missing/placeholder line ${l}`);
  }
  if (/PLACEHOLDER/i.test(legge.meta?.note || '')) {
    fail('legge.meta.note still marks the file as a PLACEHOLDER — run scripts/fetch_legge.mjs');
  }
}

if (errors.length) {
  console.error(`Data validation FAILED (${errors.length}):\n - ` + errors.join('\n - '));
  process.exit(1);
}
console.log('Data validation passed: 8 trigrams, 64 hexagrams, Legge complete for all 64.');
