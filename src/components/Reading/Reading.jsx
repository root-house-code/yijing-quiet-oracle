import { useSettings } from '../../state/SettingsContext.jsx';
import { translations, getTranslation, hexagramText } from '../../data/translations/index.js';
import { trigram, trigramGlyph } from '../../lib/hexagram.js';
import { valueInfo } from '../../lib/ritual.js';
import { HexagramPanel } from './HexagramPanel.jsx';
import { Term } from '../Tooltip/Term.jsx';
import './reading.css';

const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

function NuclearDisclosure({ nuclear, open }) {
  const lo = nuclear.lower;
  const hi = nuclear.upper;
  return (
    <details className="nuclear" open={open}>
      <summary>
        Advanced: <Term name="Nuclear trigrams">nuclear trigrams</Term>
      </summary>
      <p className="trigram-line">
        Hidden within the inner lines: <span aria-hidden="true">{trigramGlyph(lo.id)}</span> {lo.image} ({lo.name_pinyin})
        from lines 2–3–4, and <span aria-hidden="true">{trigramGlyph(hi.id)}</span> {hi.image} ({hi.name_pinyin}) from
        lines 3–4–5. They suggest an inner tendency within the situation.
      </p>
    </details>
  );
}

export function Reading({ reading, question, onSave, onClose, saved }) {
  const { settings, set } = useSettings();
  const tid = settings.translationId;
  const translation = getTranslation(tid);
  const primaryText = hexagramText(tid, reading.primary.king_wen);
  const relatingText = reading.relating ? hexagramText(tid, reading.relating.king_wen) : null;
  const meta = translation.meta;

  return (
    <section className="reading">
      {question && (
        <p className="reading-question">
          <span className="reading-question-label">Your question</span>
          “{question}”
        </p>
      )}

      <HexagramPanel
        hexagram={reading.primary}
        moving={reading.moving}
        values={reading.lineValues}
        size="lg"
      />

      <div className="translation-bar">
        <label htmlFor="translation">Translation</label>
        <select
          id="translation"
          value={tid}
          onChange={(e) => set('translationId', e.target.value)}
        >
          {translations.map((t) => (
            <option key={t.meta.id} value={t.meta.id}>
              {t.meta.translator} ({t.meta.year})
            </option>
          ))}
        </select>
        <span className="attribution">
          {meta.translator}, {meta.year} · {meta.source} · {meta.license}
        </span>
      </div>

      <div className="oracle">
        <h3>
          <Term name="The Judgment">The Judgment</Term>
        </h3>
        <p>{primaryText?.judgment}</p>
        <h3>
          <Term name="The Image">The Image</Term>
        </h3>
        <p>{primaryText?.image}</p>
      </div>

      {reading.hasMoving ? (
        <div className="oracle moving-lines">
          <h3>
            <Term name="Moving (changing) line">Moving lines</Term>
          </h3>
          <ul>
            {reading.movingPositions.map((pos) => {
              const info = valueInfo(reading.lineValues[pos - 1]);
              return (
                <li key={pos}>
                  <span className="pos">
                    {ORDINAL[pos - 1]} line · {info.value} {info.name}
                  </span>
                  {primaryText?.lines?.[pos]}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="relating-note">
          No lines are moving, so the situation is settled in this single hexagram, with no second
          figure to indicate change.
        </p>
      )}

      {reading.relating && (
        <>
          <hr className="section-divider" />
          <div>
            <h3 className="oracle" style={{ border: 'none', padding: 0 }}>
              <Term name="Relating hexagram">Tending toward</Term>
            </h3>
            <p className="relating-note">
              Where the moving lines point: not a fixed outcome, but the direction in which the
              present situation is leaning.
            </p>
            <HexagramPanel hexagram={reading.relating} size="md" />
            {relatingText && (
              <div className="oracle" style={{ marginTop: '1.2rem' }}>
                <h3>The Judgment</h3>
                <p>{relatingText.judgment}</p>
              </div>
            )}
          </div>
        </>
      )}

      <NuclearDisclosure nuclear={reading.nuclear} open={settings.showNuclear} />

      <hr className="section-divider" />
      <div className="reading-close">
        {settings.journalEnabled &&
          (saved ? (
            <span className="saved-note">Saved to your journal.</span>
          ) : (
            <button type="button" className="btn-quiet" onClick={onSave}>
              Save to journal
            </button>
          ))}
        <button type="button" className="btn-primary" onClick={onClose}>
          Let it go
        </button>
      </div>
    </section>
  );
}
