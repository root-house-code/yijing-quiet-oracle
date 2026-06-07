import { useState } from 'react';
import { Term } from '../Tooltip/Term.jsx';
import { Tooltip } from '../Tooltip/Tooltip.jsx';
import './cast.css';

const QUESTION_GUIDE =
  'The I Ching answers open, situational questions about how to meet a moment far better than yes-or-no predictions. Rather than asking what will happen, ask what a situation calls for or how to approach it — "How should I meet the change ahead of me?" rather than "Will it go well?" Turn predictions into questions of conduct or meaning: not "Will this last?" but "What does this need from me now?" Bring something you are genuinely turning over, and ask it once, sincerely.';

// Pose the question (optional) and choose a method. Each method carries a
// one-line explanation of what it is and how the two differ.
export function PoseQuestion({ onCast, onBack }) {
  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState('yarrow');

  return (
    <section className="pose">
      <div className="pose-head">
        <h2 className="pose-h">Pose your question</h2>
        <Tooltip
          content={QUESTION_GUIDE}
          label="What kinds of questions to ask"
          align="end"
          triggerClass="info-badge"
        >
          i
        </Tooltip>
      </div>
      <p className="pose-note">
        Optional, and kept private — it is saved only if you have turned on the journal.
      </p>

      <label className="visually-hidden" htmlFor="question">
        Your question
      </label>
      <textarea
        id="question"
        className="pose-input"
        rows={3}
        placeholder="How should I conduct myself in the situation before me?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <fieldset className="method-picker">
        <legend>Choose a method</legend>

        <label className={`method-card${method === 'yarrow' ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name="method"
            value="yarrow"
            checked={method === 'yarrow'}
            onChange={() => setMethod('yarrow')}
          />
          <span className="method-name">
            <Term name="Yarrow stalk method">Yarrow stalks</Term>
          </span>
          <span className="method-desc">
            The oldest method. Slow and meditative; moving lines carry particular weight because
            its odds are deliberately uneven.
          </span>
        </label>

        <label className={`method-card${method === 'coins' ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name="method"
            value="coins"
            checked={method === 'coins'}
            onChange={() => setMethod('coins')}
          />
          <span className="method-name">
            <Term name="Three-coin method">Three coins</Term>
          </span>
          <span className="method-desc">
            Faster and more common today. Each line is equally likely to move toward yin or yang.
          </span>
        </label>
      </fieldset>

      <div className="pose-actions">
        <button type="button" className="btn-quiet" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onCast({ question: question.trim() || null, method })}
        >
          Cast
        </button>
      </div>
    </section>
  );
}
