import glossary from '../../data/glossary.json';
import { Tooltip } from './Tooltip.jsx';

const byTerm = new Map(glossary.terms.map((t) => [t.term.toLowerCase(), t]));

/**
 * Inline glossary term. Wrap the first appearance of any domain word:
 *   <Term name="Moving (changing) line">moving line</Term>
 * It shows the short definition in a tooltip. `name` selects the glossary
 * entry; the children are the words as they read in the sentence.
 */
export function Term({ name, children }) {
  const entry = byTerm.get((name || (typeof children === 'string' ? children : '')).toLowerCase());
  if (!entry) return <>{children}</>;
  return (
    <Tooltip content={entry.short} label={`Definition: ${entry.term}`}>
      {children ?? entry.term}
    </Tooltip>
  );
}
