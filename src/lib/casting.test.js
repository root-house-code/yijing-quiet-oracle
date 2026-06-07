import { describe, it, expect } from 'vitest';
import {
  castLineCoins,
  castLineYarrow,
  castLineYarrowSimplified,
  tossCoins,
  divideYarrow,
  castReading,
  linesToHexagram,
} from './casting.js';

// THIS GATES THE PROJECT (CLAUDE.md §10 / TASKS Phase 1).
// Run each method >= 1,000,000x and assert per-line frequencies are within
// +/-0.005 of the canonical tables in CLAUDE.md §3.

const N = 1_000_000;
const TOL = 0.005;

function frequencies(fn) {
  const counts = { 6: 0, 7: 0, 8: 0, 9: 0 };
  for (let i = 0; i < N; i++) counts[fn()] += 1;
  return {
    6: counts[6] / N,
    7: counts[7] / N,
    8: counts[8] / N,
    9: counts[9] / N,
  };
}

function expectClose(freq, table) {
  for (const k of [6, 7, 8, 9]) {
    expect(Math.abs(freq[k] - table[k]), `value ${k}: got ${freq[k]}, want ${table[k]}`).toBeLessThan(
      TOL,
    );
  }
}

describe('casting frequency distributions (1M trials each)', () => {
  it('coin method → 6:1/8, 7:3/8, 8:3/8, 9:1/8', () => {
    expectClose(frequencies(() => castLineCoins()), {
      6: 1 / 8,
      7: 3 / 8,
      8: 3 / 8,
      9: 1 / 8,
    });
  });

  it('authentic yarrow → 6:1/16, 7:5/16, 8:7/16, 9:3/16', () => {
    expectClose(frequencies(() => castLineYarrow()), {
      6: 1 / 16,
      7: 5 / 16,
      8: 7 / 16,
      9: 3 / 16,
    });
  });

  it('simplified yarrow → matches coin odds', () => {
    expectClose(frequencies(() => castLineYarrowSimplified()), {
      6: 1 / 8,
      7: 3 / 8,
      8: 3 / 8,
      9: 1 / 8,
    });
  });

  it('tossCoins value distribution matches coin odds (heads=3 default)', () => {
    expectClose(frequencies(() => tossCoins().value), {
      6: 1 / 8,
      7: 3 / 8,
      8: 3 / 8,
      9: 1 / 8,
    });
  });

  it('tossCoins is invariant to the heads/tails convention', () => {
    expectClose(frequencies(() => tossCoins(Math.random, 2).value), {
      6: 1 / 8,
      7: 3 / 8,
      8: 3 / 8,
      9: 1 / 8,
    });
  });

  it('divideYarrow value distribution matches authentic yarrow odds', () => {
    expectClose(frequencies(() => divideYarrow().value), {
      6: 1 / 16,
      7: 5 / 16,
      8: 7 / 16,
      9: 3 / 16,
    });
  });
});

describe('tossCoins / divideYarrow surface the ritual detail honestly', () => {
  it('tossCoins faces sum to the stated value', () => {
    for (let i = 0; i < 5000; i++) {
      const { faces, value } = tossCoins();
      expect(faces).toHaveLength(3);
      const sum = faces.reduce((s, f) => s + (f === 'H' ? 3 : 2), 0);
      expect(sum).toBe(value);
      expect([6, 7, 8, 9]).toContain(value);
    }
  });

  it('divideYarrow remaining equals 49 minus the three round removals', () => {
    for (let i = 0; i < 5000; i++) {
      const { rounds, remaining, value } = divideYarrow();
      expect(rounds).toHaveLength(3);
      expect(49 - rounds[0] - rounds[1] - rounds[2]).toBe(remaining);
      expect(remaining / 4).toBe(value);
      expect([6, 7, 8, 9]).toContain(value);
    }
  });
});

describe('castReading', () => {
  it('returns six line values, all in {6,7,8,9}', () => {
    for (const method of ['coins', 'yarrow']) {
      const lines = castReading(method);
      expect(lines).toHaveLength(6);
      lines.forEach((v) => expect([6, 7, 8, 9]).toContain(v));
    }
  });

  it('honors a seeded rng for reproducibility', () => {
    const seq = [0.1, 0.6, 0.9, 0.2, 0.4, 0.8, 0.3, 0.7, 0.05, 0.55, 0.95, 0.15, 0.45, 0.85, 0.35, 0.65, 0.25, 0.75];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    const a = castReading('coins', { rng });
    i = 0;
    const b = castReading('coins', { rng });
    expect(a).toEqual(b);
  });
});

describe('linesToHexagram', () => {
  it('maps 6/7/8/9 to the correct primary bits', () => {
    const { primary } = linesToHexagram([6, 7, 8, 9, 7, 8]);
    expect(primary).toEqual([0, 1, 0, 1, 1, 0]);
  });

  it('flags only moving lines (6 and 9) and flips them in the relating hexagram', () => {
    const { primary, relating, moving, hasMoving } = linesToHexagram([7, 8, 9, 6, 7, 8]);
    expect(moving).toEqual([false, false, true, true, false, false]);
    expect(hasMoving).toBe(true);
    expect(primary).toEqual([1, 0, 1, 0, 1, 0]);
    // line 3 (old yang 9) flips 1->0; line 4 (old yin 6) flips 0->1
    expect(relating).toEqual([1, 0, 0, 1, 1, 0]);
  });

  it('has no relating hexagram when nothing moves', () => {
    const { relating, hasMoving } = linesToHexagram([7, 8, 7, 8, 7, 8]);
    expect(hasMoving).toBe(false);
    expect(relating).toBeNull();
  });

  it('all six lines moving produces a fully flipped relating hexagram', () => {
    const { primary, relating } = linesToHexagram([6, 6, 6, 6, 6, 6]);
    expect(primary).toEqual([0, 0, 0, 0, 0, 0]);
    expect(relating).toEqual([1, 1, 1, 1, 1, 1]);
  });
});
