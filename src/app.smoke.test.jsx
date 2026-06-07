import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { SettingsProvider } from './state/SettingsContext.jsx';
import { JournalProvider } from './state/JournalContext.jsx';
import { Reading } from './components/Reading/Reading.jsx';
import { PoseQuestion } from './components/Cast/PoseQuestion.jsx';
import { resolveReading } from './lib/hexagram.js';

// Runtime verification without a browser: render the React tree to a string and
// assert it produced the expected content without throwing. localStorage and
// matchMedia are absent in node; the app guards for that.

describe('App renders', () => {
  it('shows the threshold/home view', () => {
    const html = renderToString(<App />);
    expect(html).toContain('易經');
    expect(html).toContain('Bring a question to mind');
    expect(html).toContain('Begin');
  });
});

describe('Pose-question screen', () => {
  const html = renderToString(<PoseQuestion onCast={() => {}} onBack={() => {}} />).replace(/<!-- -->/g, '');

  it('shows the title with a right-aligned info tooltip and guidance', () => {
    expect(html).toContain('Pose your question');
    expect(html).toContain('aria-label="What kinds of questions to ask"');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain('open, situational questions');
  });

  it('uses a model question as the input placeholder', () => {
    expect(html).toContain('How should I conduct myself in the situation before me?');
  });
});

describe('Reading view renders for a complex cast', () => {
  // 6,7,8,9,7,8 → two moving lines (positions 1 and 4) → has a relating hexagram.
  const reading = resolveReading([6, 7, 8, 9, 7, 8]);

  // React SSR injects <!-- --> markers between adjacent text nodes; strip them
  // so substring assertions read against the visible text.
  const html = renderToString(
    <SettingsProvider>
      <JournalProvider>
        <Reading reading={reading} question="Where is this heading?" onSave={() => {}} onClose={() => {}} saved={false} />
      </JournalProvider>
    </SettingsProvider>,
  ).replace(/<!-- -->/g, '');

  it('includes the question, judgment, image, and moving-line sections', () => {
    expect(html).toContain('Where is this heading?');
    expect(html).toContain('The Judgment');
    expect(html).toContain('The Image');
    expect(html).toContain('Moving lines');
    expect(html).toContain('Tending toward');
  });

  it('names the primary and relating hexagrams', () => {
    expect(html).toContain(`Hexagram ${reading.primary.king_wen}`);
    expect(html).toContain(`Hexagram ${reading.relating.king_wen}`);
    expect(reading.movingPositions).toEqual([1, 4]);
  });

  it('renders the nuclear-trigram advanced disclosure', () => {
    expect(html).toContain('nuclear trigrams');
  });

  it('gives each moving line a hover tooltip explaining it', () => {
    // two moving lines (old yin 6 at pos 1, old yang 9 at pos 4)
    expect(html).toContain('This line is moving');
    expect(html).toContain('old yin');
    expect(html).toContain('old yang');
    expect(html).toContain('Moving line 1');
    expect(html).toContain('Moving line 4');
  });
});
