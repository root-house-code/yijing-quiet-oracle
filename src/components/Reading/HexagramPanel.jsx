import { HexagramFigure } from './HexagramFigure.jsx';
import { hexagramGlyph, trigram, trigramGlyph } from '../../lib/hexagram.js';
import { Term } from '../Tooltip/Term.jsx';
import './reading.css';

function TrigramBit({ id, where }) {
  const t = trigram(id);
  if (!t) return null;
  return (
    <span>
      {where}: <span aria-hidden="true">{trigramGlyph(id)}</span> {t.image} ({t.name_pinyin})
    </span>
  );
}

/**
 * The hexagram itself: figure, number, Chinese glyph + name + pinyin, and the
 * two constituent trigrams with their natural images. `moving` marks changing
 * lines tastefully; pass it only for the primary hexagram.
 */
export function HexagramPanel({ hexagram, moving = [], values = null, size = 'md' }) {
  return (
    <div className="hex-panel">
      <HexagramFigure lines={hexagram.lines} moving={moving} values={values} size={size} />
      <div className="hex-meta">
        <span className="kw">
          Hexagram {hexagram.king_wen} <span aria-hidden="true">· {hexagramGlyph(hexagram.king_wen)}</span>
        </span>
        <h2>
          {hexagram.name_zh} · {hexagram.name_en}
        </h2>
        <span className="pinyin">{hexagram.name_pinyin}</span>
        <div className="trigram-line">
          <Term name="Trigram">
            <TrigramBit id={hexagram.lower_trigram} where="Below" />
          </Term>{' '}
          &nbsp;·&nbsp; <TrigramBit id={hexagram.upper_trigram} where="Above" />
        </div>
      </div>
    </div>
  );
}
