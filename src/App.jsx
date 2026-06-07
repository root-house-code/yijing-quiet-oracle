import { useCallback, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { SettingsProvider, useSettings } from './state/SettingsContext.jsx';
import { JournalProvider, useJournal } from './state/JournalContext.jsx';
import { resolveReading } from './lib/hexagram.js';
import { Home } from './components/Cast/Home.jsx';
import { PoseQuestion } from './components/Cast/PoseQuestion.jsx';
import { CastingRitual } from './components/Cast/CastingRitual.jsx';
import { Reading } from './components/Reading/Reading.jsx';
import { Journal } from './components/Journal/Journal.jsx';
import { Learn } from './components/Learn/Learn.jsx';
import { Settings } from './components/Settings/Settings.jsx';
import './styles/app.css';

function Shell() {
  const { settings } = useSettings();
  const journal = useJournal();

  const [view, setView] = useState('home'); // home | question | casting | reading | journal | learn | settings
  const [castParams, setCastParams] = useState(null); // { question, method }
  const [reading, setReading] = useState(null); // resolved reading
  const [saved, setSaved] = useState(false);

  const startCast = useCallback((params) => {
    setCastParams(params);
    setSaved(false);
    setView('casting');
  }, []);

  const finishCast = useCallback(
    (lineValues) => {
      const resolved = resolveReading(lineValues);
      setReading({ ...resolved, question: castParams.question, method: castParams.method });
      setView('reading');
    },
    [castParams],
  );

  function saveReading() {
    const entry = journal.save({
      question: reading.question ?? null,
      method: reading.method,
      authentic_yarrow: reading.method === 'yarrow' ? settings.authenticYarrow : null,
      line_values: reading.lineValues,
      primary_king_wen: reading.primary.king_wen,
      relating_king_wen: reading.relating ? reading.relating.king_wen : null,
      translation_id: settings.translationId,
    });
    if (entry) setSaved(true);
  }

  const nav = (target) => () => setView(target);

  return (
    <div className="app-shell">
      <header className="app-header">
        <button type="button" className="app-brand" onClick={nav('home')}>
          易經<span className="brand-en">A Quiet Oracle</span>
        </button>
        <nav className="app-nav">
          <button type="button" className={view === 'journal' ? 'is-active' : ''} onClick={nav('journal')}>
            Journal
          </button>
          <button type="button" className={view === 'learn' ? 'is-active' : ''} onClick={nav('learn')}>
            Learn
          </button>
          <button type="button" className={view === 'settings' ? 'is-active' : ''} onClick={nav('settings')}>
            Settings
          </button>
        </nav>
      </header>

      <main className="app-main">
        <div className="view" key={view}>
          {view === 'home' && <Home onBegin={nav('question')} onLearn={nav('learn')} />}
          {view === 'question' && <PoseQuestion onCast={startCast} onBack={nav('home')} />}
          {view === 'casting' && <CastingRitual method={castParams.method} onComplete={finishCast} />}
          {view === 'reading' && reading && (
            <Reading
              reading={reading}
              question={reading.question}
              onSave={saveReading}
              onClose={nav('home')}
              saved={saved}
            />
          )}
          {view === 'journal' && <Journal onBack={nav('home')} />}
          {view === 'learn' && <Learn onBack={nav('home')} />}
          {view === 'settings' && <Settings onBack={nav('home')} />}
        </div>
      </main>

      <footer className="app-footer">
        Fully offline · nothing tracked or transmitted · source text in the public domain.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SettingsProvider>
        <JournalProvider>
          <Shell />
        </JournalProvider>
      </SettingsProvider>
    </MotionConfig>
  );
}
