import { useId, useState } from 'react';
import './tooltip.css';

/**
 * A small, accessible tooltip. Shows on hover AND keyboard focus, and on
 * Escape it hides. The trigger is a real button so it is keyboard reachable
 * and screen-reader friendly (aria-describedby points at the bubble).
 */
export function Tooltip({ children, content, label, align = 'center', triggerClass = '' }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="tt">
      <button
        type="button"
        className={`tt-trigger${triggerClass ? ` ${triggerClass}` : ''}`}
        aria-describedby={open ? id : undefined}
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
      >
        {children}
      </button>
      <span
        role="tooltip"
        id={id}
        className={`tt-bubble${align === 'end' ? ' tt-end' : ''}${open ? ' is-open' : ''}`}
      >
        {content}
      </span>
    </span>
  );
}
