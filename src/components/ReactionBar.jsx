import React, { useState, useRef, useCallback, memo, useEffect } from 'react';

/** Available reactions — ordered left-to-right in the toolbar. */
const REACTIONS = [
  { emoji: '❤️', label: 'Love'  },
  { emoji: '🔥', label: 'Fire'  },
  { emoji: '😂', label: 'LOL'   },
  { emoji: '👏', label: 'Clap'  },
  { emoji: '🎉', label: 'Party' },
  { emoji: '👍', label: 'Like'  },
];

// ─── Static CSS at module scope ───────────────────────────────────────────────
const BAR_STYLES = `
  .djr-bar-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;
  }

  /* Expand slide-in */
  @keyframes djr-bar-in {
    from { opacity: 0; transform: scaleX(0.7) translateX(-6px); transform-origin: left; }
    to   { opacity: 1; transform: scaleX(1)   translateX(0);    transform-origin: left; }
  }
  .djr-bar-items {
    display: flex;
    align-items: center;
    gap: 4px;
    animation: djr-bar-in 0.18s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  /* Toggle button */
  .djr-toggle {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 5px 9px;
    cursor: pointer;
    font-size: 1.15rem;
    line-height: 1;
    color: inherit;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .djr-toggle:hover {
    background: rgba(139,92,246,0.2);
    border-color: rgba(139,92,246,0.45);
    box-shadow: 0 0 14px rgba(139,92,246,0.25);
    transform: scale(1.08);
  }
  .djr-toggle:focus-visible {
    outline: 2px solid rgba(139,92,246,0.7);
    outline-offset: 2px;
  }
  .djr-toggle--active {
    background: rgba(139,92,246,0.22);
    border-color: rgba(139,92,246,0.5);
    box-shadow: 0 0 14px rgba(139,92,246,0.28);
  }

  /* Reaction buttons */
  .djr-btn {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 6px 9px;
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    color: inherit;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.12s;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }
  .djr-btn:hover {
    background: rgba(139,92,246,0.22);
    border-color: rgba(139,92,246,0.5);
    box-shadow: 0 0 16px rgba(139,92,246,0.30);
    transform: scale(1.15) translateY(-2px);
  }
  .djr-btn:active,
  .djr-btn--pressed {
    transform: scale(0.9);
  }
  .djr-btn:focus-visible {
    outline: 2px solid rgba(139,92,246,0.7);
    outline-offset: 2px;
  }

  /* Tooltip */
  .djr-btn::after {
    content: attr(data-label);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%) scale(0.8);
    background: rgba(15,15,25,0.9);
    color: #e4e4e7;
    font-size: 0.6rem;
    font-family: inherit;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 6px;
    border-radius: 5px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.12s, transform 0.12s;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .djr-btn:hover::after {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }

  /* Mobile: slightly smaller, full sway */
  @media (max-width: 640px) {
    .djr-btn  { font-size: 1.1rem; padding: 5px 7px; }
    .djr-toggle { font-size: 1.05rem; padding: 4px 7px; }
  }
`;

// ─── ReactionButton ───────────────────────────────────────────────────────────
/**
 * Single emoji reaction button.
 * Uses CSS classes for hover/focus so React never re-renders on mouse-enter/leave.
 */
const ReactionButton = memo(function ReactionButton({ emoji, label, onSend }) {
  const [pressed, setPressed] = useState(false);
  const timerRef = useRef(null);

  const handleClick = useCallback(() => {
    onSend(emoji);

    // Press feedback: scale down then spring back
    setPressed(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPressed(false), 150);
  }, [emoji, onSend]);

  // Clear timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <button
      className={`djr-btn${pressed ? ' djr-btn--pressed' : ''}`}
      aria-label={`React with ${label}`}
      data-label={label}
      onClick={handleClick}
      // Keyboard: Space / Enter already trigger onClick natively for <button>
    >
      {emoji}
    </button>
  );
});

// ─── ReactionBar ─────────────────────────────────────────────────────────────
/**
 * Emoji reaction toolbar.
 *
 * Props:
 *   onSend(emoji)  Called when a reaction is triggered.
 *   compact        When true, renders a collapsed toggle; clicking 😊 expands the bar.
 *                  When false (default), always shows all buttons.
 */
export default function ReactionBar({ onSend, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  return (
    <>
      {/* Inject CSS once — idempotent in the browser */}
      <style>{BAR_STYLES}</style>

      <div
        className="djr-bar-wrap"
        role="toolbar"
        aria-label="Emoji reactions"
      >
        {/* Toggle (compact mode only) */}
        {compact && (
          <button
            className={`djr-toggle${expanded ? ' djr-toggle--active' : ''}`}
            aria-label={expanded ? 'Hide reactions' : 'Show reactions'}
            aria-expanded={expanded}
            aria-controls="djr-reaction-buttons"
            onClick={toggle}
            title="Reactions"
          >
            😊
          </button>
        )}

        {/* Emoji buttons */}
        {expanded && (
          <div
            id="djr-reaction-buttons"
            className="djr-bar-items"
            role="group"
            aria-label="Reaction emojis"
          >
            {REACTIONS.map(({ emoji, label }) => (
              <ReactionButton
                key={emoji}
                emoji={emoji}
                label={label}
                onSend={onSend}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
