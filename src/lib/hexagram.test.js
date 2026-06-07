import { describe, it, expect } from 'vitest';
import {
  allHexagrams,
  allTrigrams,
  hexagramFromBits,
  hexagramByNumber,
  nuclearTrigrams,
  resolveReading,
} from './hexagram.js';

describe('structural data integrity', () => {
  it('has exactly 64 hexagrams and 8 trigrams', () => {
    expect(allHexagrams).toHaveLength(64);
    expect(allTrigrams).toHaveLength(8);
  });

  it('covers King Wen 1-64 with no gaps or duplicates', () => {
    const nums = allHexagrams.map((h) => h.king_wen).sort((a, b) => a - b);
    expect(nums).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
  });

  it('every binary is unique and 6 bits long', () => {
    const bins = new Set(allHexagrams.map((h) => h.binary));
    expect(bins.size).toBe(64);
    allHexagrams.forEach((h) => expect(h.binary).toMatch(/^[01]{6}$/));
  });

  it('binary, lines, and trigram composition are self-consistent', () => {
    const tri = Object.fromEntries(allTrigrams.map((t) => [t.id, t.lines.join('')]));
    allHexagrams.forEach((h) => {
      expect(h.lines.join('')).toBe(h.binary);
      expect(h.binary).toBe(tri[h.lower_trigram] + tri[h.upper_trigram]);
    });
  });

  it('stored nuclear trigrams match the computed inner figures', () => {
    allHexagrams.forEach((h) => {
      const nuc = nuclearTrigrams(h.lines);
      expect(nuc.lower.id).toBe(h.nuclear_lower);
      expect(nuc.upper.id).toBe(h.nuclear_upper);
    });
  });

  it('matches the handoff seed samples', () => {
    expect(hexagramByNumber(1).binary).toBe('111111');
    expect(hexagramByNumber(2).binary).toBe('000000');
    const h63 = hexagramByNumber(63);
    expect(h63.binary).toBe('101010');
    expect(h63.name_pinyin).toBe('Jì Jì');
    expect(h63.lower_trigram).toBe('li');
    expect(h63.upper_trigram).toBe('kan');
    expect(h63.nuclear_lower).toBe('kan');
    expect(h63.nuclear_upper).toBe('li');
  });
});

describe('resolveReading', () => {
  it('no moving lines → primary only, no relating', () => {
    const r = resolveReading([7, 7, 7, 7, 7, 7]);
    expect(r.primary.king_wen).toBe(1);
    expect(r.relating).toBeNull();
    expect(r.hasMoving).toBe(false);
    expect(r.movingPositions).toEqual([]);
  });

  it('all old-yang → Creative tending to Receptive', () => {
    const r = resolveReading([9, 9, 9, 9, 9, 9]);
    expect(r.primary.king_wen).toBe(1);
    expect(r.relating.king_wen).toBe(2);
    expect(r.movingPositions).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('reports moving line positions (1-based, bottom→top)', () => {
    const r = resolveReading([7, 8, 9, 6, 7, 8]);
    expect(r.movingPositions).toEqual([3, 4]);
    expect(r.primary.binary).toBe('101010'); // King Wen 63
    expect(r.primary.king_wen).toBe(63);
  });

  it('round-trips every hexagram through its own bits', () => {
    allHexagrams.forEach((h) => {
      expect(hexagramFromBits(h.lines).king_wen).toBe(h.king_wen);
    });
  });
});
