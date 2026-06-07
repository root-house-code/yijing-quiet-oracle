import { useJournal } from '../../state/JournalContext.jsx';
import { hexagramByNumber } from '../../lib/hexagram.js';
import './journal.css';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function hexName(n) {
  const h = hexagramByNumber(n);
  return h ? `${n} · ${h.name_zh} ${h.name_en}` : `${n}`;
}

export function Journal({ onBack }) {
  const { entries, enabled, remove, clearAll, exportJSON } = useJournal();

  function download() {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yijing-journal-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="journal">
      <div className="journal-head">
        <h2>Journal</h2>
        <button type="button" className="btn-quiet" onClick={onBack}>
          Back
        </button>
      </div>

      {!enabled && (
        <p className="journal-note">
          The journal is currently off. You can still read past entries, but new readings won't be
          saved until you enable it in Settings.
        </p>
      )}

      {entries.length === 0 ? (
        <p className="journal-empty">No readings saved yet.</p>
      ) : (
        <>
          <div className="journal-controls">
            <button type="button" className="btn-quiet" onClick={download}>
              Export (JSON)
            </button>
            <button
              type="button"
              className="btn-quiet danger"
              onClick={() => {
                if (window.confirm('Delete all saved readings? This cannot be undone.')) clearAll();
              }}
            >
              Delete all
            </button>
          </div>

          <ul className="journal-list">
            {entries.map((e) => (
              <li key={e.id} className="journal-entry">
                <time className="entry-time">{formatDate(e.timestamp)}</time>
                {e.question && <p className="entry-q">“{e.question}”</p>}
                <p className="entry-hex">{hexName(e.primary_king_wen)}</p>
                {e.relating_king_wen != null && (
                  <p className="entry-rel">tending toward {hexName(e.relating_king_wen)}</p>
                )}
                <p className="entry-meta">
                  {e.method === 'yarrow' ? 'Yarrow stalks' : 'Three coins'}
                  {e.method === 'yarrow' && (e.authentic_yarrow ? ' · authentic' : ' · simplified')} ·{' '}
                  lines [{e.line_values.join(', ')}] · {e.translation_id}
                </p>
                <button type="button" className="entry-del" onClick={() => remove(e.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
