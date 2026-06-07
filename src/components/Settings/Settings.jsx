import { useSettings } from '../../state/SettingsContext.jsx';
import { translations } from '../../data/translations/index.js';
import './settings.css';

function Toggle({ checked, onChange, label, children }) {
  return (
    <div className="setting-row">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`switch${checked ? ' is-on' : ''}`}
        onClick={onChange}
      >
        <span className="knob" />
      </button>
      <div className="setting-text">
        <span className="setting-label">{label}</span>
        <p className="setting-desc">{children}</p>
      </div>
    </div>
  );
}

export function Settings({ onBack }) {
  const { settings, toggle, set } = useSettings();

  return (
    <section className="settings">
      <div className="settings-head">
        <h2>Settings</h2>
        <button type="button" className="btn-quiet" onClick={onBack}>
          Back
        </button>
      </div>

      <Toggle
        checked={settings.authenticYarrow}
        onChange={() => toggle('authenticYarrow')}
        label="Authentic yarrow odds"
      >
        When on, the yarrow method uses its true, uneven probabilities (old yin 1/16, young yang
        5/16, young yin 7/16, old yang 3/16). This asymmetry (moving lines being rarer) is the
        whole point of yarrow versus coins. Turn it off to use simplified, coin-like odds, knowingly.
      </Toggle>

      <Toggle
        checked={settings.deliberatePacing}
        onChange={() => toggle('deliberatePacing')}
        label="Deliberate pacing"
      >
        When on, each line is cast at a slow, meditative pace, and you can always skip the pause. When
        off, lines resolve quickly, but the process is still shown. (If your system prefers reduced
        motion, the quick path is used automatically.)
      </Toggle>

      <Toggle
        checked={settings.journalEnabled}
        onChange={() => toggle('journalEnabled')}
        label="Keep a journal"
      >
        Off by default. When on, your readings are saved on this device only (in your browser's local
        storage) and never transmitted. You can export or erase them at any time.
      </Toggle>

      <Toggle
        checked={settings.showNuclear}
        onChange={() => toggle('showNuclear')}
        label="Show nuclear trigrams by default"
      >
        An advanced reading device: the hidden trigrams formed by a hexagram's inner lines. Off by
        default; you can always expand them within a reading.
      </Toggle>

      <div className="setting-row block">
        <span className="setting-label">Coin convention</span>
        <p className="setting-desc">
          Traditions differ on which face counts as three. The line probabilities are identical
          either way; this only affects how the coins are labelled.
        </p>
        <div className="radio-line">
          <label>
            <input
              type="radio"
              name="coin"
              checked={settings.coinHeadsValue === 3}
              onChange={() => set('coinHeadsValue', 3)}
            />
            Heads = 3, tails = 2 (default)
          </label>
          <label>
            <input
              type="radio"
              name="coin"
              checked={settings.coinHeadsValue === 2}
              onChange={() => set('coinHeadsValue', 2)}
            />
            Heads = 2, tails = 3
          </label>
        </div>
      </div>

      <div className="setting-row block">
        <span className="setting-label">Default translation</span>
        <p className="setting-desc">Which translation a new reading opens with. You can switch live within any reading.</p>
        <select value={settings.translationId} onChange={(e) => set('translationId', e.target.value)}>
          {translations.map((t) => (
            <option key={t.meta.id} value={t.meta.id}>
              {t.meta.translator} ({t.meta.year})
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
