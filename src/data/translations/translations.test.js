import { describe, it, expect } from 'vitest';
import { translations, translationsById, getTranslation, hexagramText } from './index.js';
import { allHexagrams } from '../../lib/hexagram.js';

describe('translation registry', () => {
  it('has at least the Legge translation, fully attributed', () => {
    expect(translations.length).toBeGreaterThanOrEqual(1);
    const legge = translationsById.legge;
    expect(legge).toBeTruthy();
    for (const k of ['translator', 'year', 'source', 'license', 'language']) {
      expect(legge.meta[k], `meta.${k}`).toBeTruthy();
    }
  });

  it('falls back to Legge for an unknown id', () => {
    expect(getTranslation('does-not-exist').meta.id).toBe('legge');
  });

  it('provides judgment + image + six line texts for every hexagram core', () => {
    for (const h of allHexagrams) {
      const t = hexagramText('legge', h.king_wen);
      expect(t, `hexagram ${h.king_wen}`).toBeTruthy();
      expect(t.judgment).toBeTruthy();
      expect(t.image).toBeTruthy();
      for (let l = 1; l <= 6; l++) expect(t.lines[l], `hex ${h.king_wen} line ${l}`).toBeTruthy();
    }
  });
});
