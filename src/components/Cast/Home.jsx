import { motion } from 'framer-motion';
import './cast.css';

// The threshold. Quiet landing, a single invitation, one action.
export function Home({ onBegin, onLearn }) {
  return (
    <motion.section
      className="threshold"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <div className="threshold-glyph" aria-hidden="true">
        ䷀
      </div>
      <h1 className="threshold-title">
        易經
        <span className="threshold-sub">The Book of Changes</span>
      </h1>
      <p className="threshold-invite">Bring a question to mind.</p>
      <p className="threshold-guide">
        The oracle answers reflection, not idle curiosity. Let your question be open and
        sincere. Rather than a yes-or-no demand of the future, bring something you are
        genuinely turning over.
      </p>
      <div className="threshold-actions">
        <button type="button" className="btn-primary" onClick={onBegin}>
          Begin
        </button>
        <button type="button" className="btn-quiet" onClick={onLearn}>
          How this works
        </button>
      </div>
    </motion.section>
  );
}
