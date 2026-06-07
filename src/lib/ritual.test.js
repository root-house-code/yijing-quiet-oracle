import { describe, it, expect } from 'vitest';
import { castLineDetail, castRitual, valueInfo, LINE_NAMES } from './ritual.js';

describe('valueInfo', () => {
  it('classifies all four line values', () => {
    expect(valueInfo(6)).toMatchObject({ yang: false, moving: true, name: 'old yin' });
    expect(valueInfo(7)).toMatchObject({ yang: true, moving: false, name: 'young yang' });
    expect(valueInfo(8)).toMatchObject({ yang: false, moving: false, name: 'young yin' });
    expect(valueInfo(9)).toMatchObject({ yang: true, moving: true, name: 'old yang' });
  });
  it('LINE_NAMES covers 6-9', () => {
    expect(Object.keys(LINE_NAMES).sort()).toEqual(['6', '7', '8', '9']);
  });
});

describe('castLineDetail evidence matches value', () => {
  it('coin faces sum to the line value (heads=3)', () => {
    for (let i = 0; i < 2000; i++) {
      const d = castLineDetail('coins', { coinHeadsValue: 3 });
      expect(d.faces).toHaveLength(3);
      const sum = d.faces.reduce((s, f) => s + (f === 'H' ? 3 : 2), 0);
      expect(sum).toBe(d.value);
    }
  });

  it('authentic yarrow exposes three rounds whose remainder gives the value', () => {
    for (let i = 0; i < 2000; i++) {
      const d = castLineDetail('yarrow', { authenticYarrow: true });
      expect(d.authentic).toBe(true);
      expect(d.rounds).toHaveLength(3);
      expect(49 - d.rounds[0] - d.rounds[1] - d.rounds[2]).toBe(d.remaining);
      expect(d.remaining / 4).toBe(d.value);
    }
  });

  it('simplified yarrow yields a valid value without fabricated rounds', () => {
    const d = castLineDetail('yarrow', { authenticYarrow: false });
    expect(d.authentic).toBe(false);
    expect(d.rounds).toBeUndefined();
    expect([6, 7, 8, 9]).toContain(d.value);
  });
});

describe('castRitual', () => {
  it('returns six line details', () => {
    const lines = castRitual('coins', { coinHeadsValue: 3 });
    expect(lines).toHaveLength(6);
    lines.forEach((l) => expect([6, 7, 8, 9]).toContain(l.value));
  });
});
