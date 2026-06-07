// ritual.js — turn raw casts into the per-line detail the transparent UI shows.
// The casting math lives in casting.js (verified); here we just package each
// line with the visible evidence that produced it (coin faces, or yarrow round
// removals) so the process can be shown, not hidden (Tenet 1).
import { tossCoins, divideYarrow, castLineYarrowSimplified } from './casting.js';

export const LINE_NAMES = { 6: 'old yin', 7: 'young yang', 8: 'young yin', 9: 'old yang' };

/** Describe a 6/7/8/9 value: is it yang, is it moving, its traditional name. */
export function valueInfo(v) {
  return { value: v, yang: v === 7 || v === 9, moving: v === 6 || v === 9, name: LINE_NAMES[v] };
}

/** Cast one line, returning its value plus the visible evidence. */
export function castLineDetail(method, { authenticYarrow = true, coinHeadsValue = 3, rng = Math.random } = {}) {
  if (method === 'coins') {
    const { faces, value } = tossCoins(rng, coinHeadsValue);
    return { method, value, faces };
  }
  if (authenticYarrow) {
    const { rounds, remaining, value } = divideYarrow(rng);
    return { method, value, rounds, remaining, authentic: true };
  }
  // Simplified yarrow: coin-odds, chosen knowingly. No fabricated round counts.
  return { method, value: castLineYarrowSimplified(rng), authentic: false };
}

/** A full six-line cast (bottom -> top), each line with its evidence. */
export function castRitual(method, opts) {
  return Array.from({ length: 6 }, () => castLineDetail(method, opts));
}
