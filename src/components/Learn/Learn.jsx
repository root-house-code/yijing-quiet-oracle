import glossary from '../../data/glossary.json';
import hexagrams from '../../data/hexagrams.json';
import { getTranslation } from '../../data/translations/index.js';
import './learn.css';

// "How this works" content. Honest, plain, non-mystical. The mechanics are
// never hidden behind a black box (Tenet 1). Examples are pulled live from the
// bundled Legge translation so they are always faithful to the shipped text.
const legge = getTranslation('legge');
const byKw = Object.fromEntries(hexagrams.map((h) => [h.king_wen, h]));
const txt = (n) => legge.hexagrams[n];

// Concise, clean examples (no source-text dashes), each illustrating its part.
const NAME_EXAMPLES = [1, 2, 52];
const JUDGMENT_EXAMPLES = [1, 11, 15];
const IMAGE_EXAMPLES = [1, 2, 52];

function NameRow({ n }) {
  const h = byKw[n];
  return (
    <li>
      <span className="ex-zh">{h.name_zh}</span>
      <span className="ex-body">
        <strong>Hexagram {n}, “{h.name_en}”</strong> ({h.name_pinyin})
      </span>
    </li>
  );
}

function QuoteRow({ n, field }) {
  const h = byKw[n];
  return (
    <li>
      <span className="ex-label">
        Hexagram {n}, {h.name_en}
      </span>
      <span className="ex-quote">“{txt(n)[field]}”</span>
    </li>
  );
}

// The four possible line values, shared by both casting methods.
const LINE_TYPES = [
  { v: 7, name: 'young yang', solid: true, moving: false, becomes: 'stays as it is' },
  { v: 8, name: 'young yin', solid: false, moving: false, becomes: 'stays as it is' },
  { v: 9, name: 'old yang', solid: true, moving: true, becomes: 'changes to yin ⚋' },
  { v: 6, name: 'old yin', solid: false, moving: true, becomes: 'changes to yang ⚊' },
];

function LineGlyph({ solid, moving }) {
  return (
    <span className={`ln ${solid ? 'ln-yang' : 'ln-yin'}${moving ? ' ln-moving' : ''}`} aria-hidden="true">
      {solid ? (
        <span className="ln-bar">{moving && <span className="ln-mark">×</span>}</span>
      ) : (
        <>
          <span className="ln-seg" />
          {moving && <span className="ln-mark">o</span>}
          <span className="ln-seg" />
        </>
      )}
    </span>
  );
}

export function Learn({ onBack }) {
  return (
    <section className="learn">
      <div className="learn-head">
        <h2>How this works</h2>
        <button type="button" className="btn-quiet" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="learn-body">
        <p>
          The <em>Yijing</em> (“Book of Changes”) is one of the oldest books in the world. For more
          than three thousand years people have consulted it not to predict a fixed future, but as a
          structured mirror for reflection: a way to think more carefully about a situation by
          reading it through an old and unfamiliar symbolic language.
        </p>

        <h3>Bringing a question</h3>
        <p>
          The oracle responds to <em>how you stand in a situation</em>, not to facts or fixed
          outcomes. It suits open, situational questions (about a decision, a relationship, a piece
          of work) far better than yes-or-no predictions, which it tends to answer evasively. The
          most reliable move is to turn a prediction into a question of conduct or meaning:
        </p>
        <ul className="question-examples">
          <li>
            <span className="q-no">“Will this relationship last?”</span>
            <span className="q-yes">“What does this relationship need from me now?”</span>
          </li>
          <li>
            <span className="q-no">“Should I take the job, yes or no?”</span>
            <span className="q-yes">“What is the nature of this opportunity, and how should I meet it?”</span>
          </li>
          <li>
            <span className="q-no">“Will the project succeed?”</span>
            <span className="q-yes">“What attitude will serve this project well right now?”</span>
          </li>
        </ul>
        <p>
          It also asks to be treated with some seriousness: bring something you are genuinely
          turning over, ask it once, and sit with the answer rather than re-casting until you get a
          reply you like.
        </p>

        <h3>What a reading is made of</h3>
        <p>
          You generate six lines, one at a time, from the bottom upward. Each line is either solid
          (<strong>yang</strong> ⚊) or broken (<strong>yin</strong> ⚋). Two stacked groups of three
          lines (called <strong>trigrams</strong>) make a six-line <strong>hexagram</strong>. There
          are sixty-four hexagrams. Each one carries three things you read: a name, a Judgment, and
          an Image.
        </p>

        <h4>The name</h4>
        <p>
          A hexagram's name is its title: a single Chinese word, usually given a conventional English
          label. It names the archetypal situation the hexagram describes, the way a chapter heading
          names its subject.
        </p>
        <ul className="example-list">
          {NAME_EXAMPLES.map((n) => (
            <NameRow key={n} n={n} />
          ))}
        </ul>

        <h4>The Judgment</h4>
        <p>
          The Judgment is the core oracle text for the hexagram as a whole. It is a terse statement
          on the overall situation, often with a note on whether undertakings will go well. It speaks
          to the whole of your reading, not to any single line.
        </p>
        <ul className="example-list quotes">
          {JUDGMENT_EXAMPLES.map((n) => (
            <QuoteRow key={n} n={n} field="judgment" />
          ))}
        </ul>

        <h4>The Image</h4>
        <p>
          The Image (the “Great Symbolism”) reads the two trigrams as natural phenomena and draws a
          practical or ethical orientation from them. It almost always names a scene from nature and
          then says how the <em>superior person</em> (the thoughtful, cultivated individual) acts in
          accordance with it.
        </p>
        <ul className="example-list quotes">
          {IMAGE_EXAMPLES.map((n) => (
            <QuoteRow key={n} n={n} field="image" />
          ))}
        </ul>

        <h3>Moving lines and change</h3>
        <p>
          Each of the six lines comes out as one of four values. Two are stable and two are
          <strong> moving</strong> (at their extreme, about to turn into their opposite):
        </p>
        <table className="line-table">
          <thead>
            <tr>
              <th>Value</th>
              <th>Line</th>
              <th>Name</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            {LINE_TYPES.map((t) => (
              <tr key={t.v} className={t.moving ? 'is-moving' : ''}>
                <td>{t.v}</td>
                <td>
                  <LineGlyph solid={t.solid} moving={t.moving} />
                </td>
                <td>{t.name}</td>
                <td>{t.becomes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          A <strong>non-moving</strong> line (a 7 or an 8) simply takes its place in the hexagram and
          stays put. A <strong>moving</strong> line (a 9 or a 6) does double duty: it takes its place
          in the first hexagram, and it also flips to its opposite to help form a second,{' '}
          <strong>relating</strong> hexagram, which shows the direction the situation is tending.
          For example, if your six values come out as 7, 8, <span className="hl">9</span>, 8, 7,{' '}
          <span className="hl">6</span>, then lines three and six are moving: line three (old yang)
          changes from solid to broken, and line six (old yin) changes from broken to solid. The
          other four lines hold steady.
        </p>
        <p>
          <strong>“Only the moving lines' commentary applies to your reading.”</strong> Every
          hexagram includes six separate line texts, one for each position. But you do not read all
          six. You read only the texts for the positions that actually moved in your cast. So in the
          example above you would read the Judgment, the Image, and the line texts for line three and
          line six, and nothing from lines one, two, four, or five. The reasoning is that those are
          the lines in motion, the points where your situation is actively changing. If no lines move
          at all, you read only the Judgment and the Image, with no individual line texts and no
          relating hexagram. (This app shows you exactly the right line texts automatically.)
        </p>

        <h3>The two methods</h3>
        <p>
          Both methods build a hexagram the same way: you generate one line at a time, six times,
          from the bottom upward. They differ only in how each line is produced and how likely the
          moving lines are.
        </p>

        <h4>Three coins</h4>
        <p>
          Toss three coins. Count heads as 3 and tails as 2, and add them up. The total (6, 7, 8, or
          9) is the line. It is fast, and moving and non-moving lines are fairly evenly balanced.
        </p>
        <table className="method-table">
          <thead>
            <tr>
              <th>Three coins</th>
              <th>Total</th>
              <th>Line</th>
              <th>Chance</th>
            </tr>
          </thead>
          <tbody>
            <tr className="is-moving">
              <td>tails · tails · tails</td>
              <td>6</td>
              <td>
                <LineGlyph solid={false} moving /> old yin (moving)
              </td>
              <td>1 in 8</td>
            </tr>
            <tr>
              <td>two tails · one head</td>
              <td>7</td>
              <td>
                <LineGlyph solid /> young yang
              </td>
              <td>3 in 8</td>
            </tr>
            <tr>
              <td>two heads · one tail</td>
              <td>8</td>
              <td>
                <LineGlyph solid={false} /> young yin
              </td>
              <td>3 in 8</td>
            </tr>
            <tr className="is-moving">
              <td>heads · heads · heads</td>
              <td>9</td>
              <td>
                <LineGlyph solid moving /> old yang (moving)
              </td>
              <td>1 in 8</td>
            </tr>
          </tbody>
        </table>

        <h4>Yarrow stalks</h4>
        <p>
          Begin with fifty stalks, set one aside, and divide and count the remaining forty-nine
          across three rounds. The stalks left at the end, divided by four, give the line:
        </p>
        <div className="yarrow-flow" aria-hidden="true">
          <span className="yf-step">49 stalks</span>
          <span className="yf-arrow">→</span>
          <span className="yf-step">3 rounds of dividing &amp; counting</span>
          <span className="yf-arrow">→</span>
          <span className="yf-step">24, 28, 32, or 36 remain</span>
          <span className="yf-arrow">→</span>
          <span className="yf-step">÷ 4</span>
          <span className="yf-arrow">→</span>
          <span className="yf-step">6, 7, 8, or 9</span>
        </div>
        <table className="method-table">
          <thead>
            <tr>
              <th>Stalks remaining</th>
              <th>÷ 4</th>
              <th>Line</th>
              <th>Chance</th>
            </tr>
          </thead>
          <tbody>
            <tr className="is-moving">
              <td>24</td>
              <td>6</td>
              <td>
                <LineGlyph solid={false} moving /> old yin (moving)
              </td>
              <td>1 in 16</td>
            </tr>
            <tr>
              <td>28</td>
              <td>7</td>
              <td>
                <LineGlyph solid /> young yang
              </td>
              <td>5 in 16</td>
            </tr>
            <tr>
              <td>32</td>
              <td>8</td>
              <td>
                <LineGlyph solid={false} /> young yin
              </td>
              <td>7 in 16</td>
            </tr>
            <tr className="is-moving">
              <td>36</td>
              <td>9</td>
              <td>
                <LineGlyph solid moving /> old yang (moving)
              </td>
              <td>3 in 16</td>
            </tr>
          </tbody>
        </table>
        <p>
          Notice that the yarrow chances are deliberately uneven: moving lines (the 6 and the 9) are
          rarer than with coins, which gives change particular weight. That asymmetry is the whole
          point of the older method. This app shows you the actual coins or stalk counts that produce
          each line; nothing is hidden. You can keep the authentic yarrow odds or choose a simplified
          model in Settings, knowingly.
        </p>

        <h3>A note on honesty</h3>
        <p>
          The app frames and explains; the translated source text is the only thing that “speaks.”
          Translations are reproduced faithfully and attributed, never paraphrased into self-help.
          Nothing you do here is tracked, scored, or sent anywhere.
        </p>

        <h3>Glossary</h3>
        <dl className="glossary">
          {glossary.terms.map((t) => (
            <div key={t.term} className="glossary-item">
              <dt>{t.term}</dt>
              <dd>{t.long || t.short}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
