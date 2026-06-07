// hexagram.js — bind raw line values to the structural data:
// King Wen lookup by binary, trigram lookup, transform-to-relating, nuclear
// trigram derivation. Pure functions over the generated JSON core; no UI here.
import hexagrams from '../data/hexagrams.json';
import trigrams from '../data/trigrams.json';
import { linesToHexagram } from './casting.js';

export { linesToHexagram };

const byBinary = new Map(hexagrams.map((h) => [h.binary, h]));
const byKingWen = new Map(hexagrams.map((h) => [h.king_wen, h]));
const trigramById = new Map(trigrams.map((t) => [t.id, t]));
const trigramByLines = new Map(trigrams.map((t) => [t.lines.join(''), t]));

/** All 64 hexagrams (structural core), King Wen order. */
export const allHexagrams = hexagrams;
/** All 8 trigrams. */
export const allTrigrams = trigrams;

// Unicode places the 64 hexagram symbols (U+4DC0…) in King Wen order, and the
// eight trigram symbols at U+2630… in the canonical heaven→earth order.
const TRIGRAM_GLYPHS = { qian: '☰', dui: '☱', li: '☲', zhen: '☳', xun: '☴', kan: '☵', gen: '☶', kun: '☷' };

/** The hexagram's Unicode glyph (䷀…䷿) for a King Wen number 1–64. */
export function hexagramGlyph(kingWen) {
  return String.fromCodePoint(0x4dc0 + kingWen - 1);
}

/** The trigram's Unicode glyph (☰…☷) by id. */
export function trigramGlyph(id) {
  return TRIGRAM_GLYPHS[id] ?? '';
}

/** Look up a hexagram by its bottom->top bit array (e.g. [1,0,1,0,1,0]). */
export function hexagramFromBits(bits) {
  const h = byBinary.get(bits.join(''));
  if (!h) throw new Error(`No hexagram for bits ${bits.join('')}`);
  return h;
}

/** Look up by King Wen number (1-64). */
export function hexagramByNumber(n) {
  return byKingWen.get(n) ?? null;
}

/** Look up a trigram by id, or by a 3-bit bottom->top array. */
export function trigram(idOrBits) {
  if (Array.isArray(idOrBits)) return trigramByLines.get(idOrBits.join('')) ?? null;
  return trigramById.get(idOrBits) ?? null;
}

/** The two nuclear trigrams of a hexagram: inner (lines 2-3-4), outer (3-4-5). */
export function nuclearTrigrams(bits) {
  return {
    lower: trigram([bits[1], bits[2], bits[3]]),
    upper: trigram([bits[2], bits[3], bits[4]]),
  };
}

/**
 * Resolve a full reading from six raw line values (6/7/8/9), bottom->top.
 * Returns the primary hexagram, the relating hexagram (null if nothing moves),
 * which lines moved, and the nuclear trigrams of the primary. Translation text
 * is layered on separately so this stays translation-independent.
 */
export function resolveReading(lineValues) {
  const { primary, relating, moving, hasMoving } = linesToHexagram(lineValues);
  const primaryHex = hexagramFromBits(primary);
  const relatingHex = hasMoving ? hexagramFromBits(relating) : null;
  return {
    lineValues,
    moving, // boolean[6], bottom->top
    movingPositions: moving.flatMap((m, i) => (m ? [i + 1] : [])), // 1-based line numbers
    hasMoving,
    primary: primaryHex,
    relating: relatingHex,
    nuclear: nuclearTrigrams(primary),
  };
}
