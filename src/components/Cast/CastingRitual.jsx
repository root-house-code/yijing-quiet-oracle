import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../state/SettingsContext.jsx';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { castRitual, valueInfo } from '../../lib/ritual.js';
import { Term } from '../Tooltip/Term.jsx';
import './cast.css';

const POSITION_LABEL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

// A single settled line bar (bottom->top index i).
function LineBar({ value }) {
  const { yang, moving } = valueInfo(value);
  return (
    <span className={`cast-bar ${yang ? 'yang' : 'yin'}${moving ? ' is-moving' : ''}`}>
      {yang ? (
        <span className="cast-seg full">{moving && <span className="cast-mark">×</span>}</span>
      ) : (
        <>
          <span className="cast-seg" />
          {moving && <span className="cast-mark">o</span>}
          <span className="cast-seg" />
        </>
      )}
    </span>
  );
}

function CoinEvidence({ faces, working }) {
  return (
    <div className="evidence coins">
      {(faces || ['?', '?', '?']).map((f, i) => (
        <motion.span
          key={i}
          className="coin"
          animate={working ? { rotateX: [0, 180, 360, 540, 720] } : { rotateX: 0 }}
          transition={{ duration: working ? 0.9 : 0.3, ease: 'easeInOut' }}
        >
          {working ? '' : f === 'H' ? 'H' : 'T'}
        </motion.span>
      ))}
      {!working && <span className="evidence-note">{faces.join(' ')} — heads = 3, tails = 2</span>}
    </div>
  );
}

function YarrowEvidence({ rounds, remaining, value, authentic, working }) {
  return (
    <div className="evidence yarrow">
      <div className="stalks" aria-hidden="true">
        {Array.from({ length: working ? 12 : Math.max(6, value * 2) }).map((_, i) => (
          <motion.span
            key={i}
            className="stalk"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: working ? (i % 6) * 0.04 : 0 }}
          />
        ))}
      </div>
      {!working && authentic && (
        <span className="evidence-note">
          rounds removed {rounds.join(', ')} · {remaining} stalks remain ÷ 4
        </span>
      )}
      {!working && !authentic && <span className="evidence-note">simplified odds</span>}
    </div>
  );
}

export function CastingRitual({ method, onComplete }) {
  const { settings } = useSettings();
  const reduced = usePrefersReducedMotion();
  const fast = reduced || !settings.deliberatePacing;

  // Cast all six lines up front so the evidence shown always matches the value.
  const lines = useMemo(
    () =>
      castRitual(method, {
        authenticYarrow: settings.authenticYarrow,
        coinHeadsValue: settings.coinHeadsValue,
      }),
    // intentionally cast once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [step, setStep] = useState(0); // line index currently being generated
  const [phase, setPhase] = useState('working'); // 'working' | 'settled'
  const [skipped, setSkipped] = useState(false);
  const done = useRef(false);

  const WORK = fast ? 160 : 1100;
  const SETTLE = fast ? 130 : 520;

  useEffect(() => {
    if (done.current) return undefined;

    if (skipped || step >= 6) {
      if (!done.current) {
        done.current = true;
        const t = setTimeout(() => onComplete(lines.map((l) => l.value)), fast ? 120 : 650);
        return () => clearTimeout(t);
      }
      return undefined;
    }

    const t = setTimeout(
      () => {
        if (phase === 'working') setPhase('settled');
        else {
          setStep((s) => s + 1);
          setPhase('working');
        }
      },
      phase === 'working' ? WORK : SETTLE,
    );
    return () => clearTimeout(t);
  }, [step, phase, skipped, fast, WORK, SETTLE, lines, onComplete]);

  const slots = [0, 1, 2, 3, 4, 5];

  return (
    <section className="ritual" aria-live="polite">
      <p className="ritual-caption">
        The reading forms from the bottom upward. {fast ? 'Each' : 'Watch each'} line take shape.
      </p>

      <div className="ritual-figure">
        {slots
          .slice()
          .reverse()
          .map((i) => {
            const settled = skipped || i < step;
            const active = !skipped && i === step;
            const v = lines[i].value;
            const info = valueInfo(v);
            return (
              <div key={i} className={`ritual-row${active ? ' is-active' : ''}`}>
                <span className="ritual-pos">{i + 1}</span>
                <div className="ritual-slot">
                  {settled && <LineBar value={v} />}
                  {active && (
                    <AnimatePresence mode="wait">
                      {method === 'coins' ? (
                        <CoinEvidence faces={lines[i].faces} working={phase === 'working'} />
                      ) : (
                        <YarrowEvidence
                          rounds={lines[i].rounds}
                          remaining={lines[i].remaining}
                          value={v}
                          authentic={lines[i].authentic}
                          working={phase === 'working'}
                        />
                      )}
                    </AnimatePresence>
                  )}
                  {!settled && !active && <span className="ritual-empty" />}
                </div>
                <span className="ritual-label">
                  {settled && (
                    <Term name={info.moving ? 'Moving (changing) line' : info.yang ? 'Yang line' : 'Yin line'}>
                      {v} · {info.name}
                    </Term>
                  )}
                  {active && phase === 'settled' && (
                    <span>
                      {v} · {info.name}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
      </div>

      {!skipped && step < 6 && (
        <button type="button" className="btn-quiet ritual-skip" onClick={() => setSkipped(true)}>
          Skip the pause
        </button>
      )}
    </section>
  );
}
