import { Tooltip } from '../Tooltip/Tooltip.jsx';
import { valueInfo } from '../../lib/ritual.js';
import './reading.css';

function Bar({ bit, isMoving }) {
  return bit === 1 ? (
    <span className="bar yang">{isMoving && <span className="mark">×</span>}</span>
  ) : (
    <span className="bar yin">
      <span className="seg" />
      {isMoving && <span className="mark">o</span>}
      <span className="seg" />
    </span>
  );
}

function movingExplanation(value) {
  const info = value ? valueInfo(value) : null;
  const which = info ? `a ${info.value}, ${info.name}` : 'old yin or old yang';
  return `This line is moving (${which}): at its extreme, it changes into its opposite, and that change is what forms the relating hexagram.`;
}

/**
 * Draw a hexagram as six stacked lines. Input `lines` is bottom->top (index 0 =
 * line 1), matching the data model; we render top->bottom so the figure reads
 * the traditional way (line 6 on top). Moving lines are marked tastefully (× for
 * old yang, o for old yin) and, in a reading, are hoverable: each moving line
 * carries a tooltip explaining what a moving line is.
 */
export function HexagramFigure({ lines, moving = [], values = null, size = 'md' }) {
  const rows = lines
    .map((bit, i) => ({ bit, i, isMoving: !!moving[i], value: values ? values[i] : null }))
    .reverse(); // top of the figure first

  return (
    <div className={`hex-figure hex-${size}`}>
      {rows.map(({ bit, i, isMoving, value }) => (
        <div key={i} className={`hex-line${isMoving ? ' is-moving' : ''}`}>
          {isMoving ? (
            <Tooltip
              content={movingExplanation(value)}
              label={`Moving line ${i + 1}${value ? `, ${valueInfo(value).name}` : ''}`}
              triggerClass="hex-line-trigger"
            >
              <Bar bit={bit} isMoving />
            </Tooltip>
          ) : (
            <span aria-hidden="true">
              <Bar bit={bit} isMoving={false} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
