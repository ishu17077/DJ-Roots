import React, { memo } from 'react';

// ─── Static CSS ──────────────────────────────────────────────────────────────
// Defined at module scope so the string reference never changes and the browser
// never re-parses the keyframes on re-renders.
const KEYFRAMES = `
  @keyframes djr-float {
    0%   { transform: translateY(0px)    translateX(0px)                scale(0.8);  opacity: 0; }
    8%   { opacity: 1; }
    25%  { transform: translateY(-18vh)  translateX(var(--djr-sway-a))  scale(1.2); }
    60%  { transform: translateY(-48vh)  translateX(var(--djr-sway-b))  scale(1.0);  opacity: 0.9; }
    100% { transform: translateY(-80vh)  translateX(var(--djr-sway-a))  scale(0.85); opacity: 0; }
  }
`;

// ─── FloatingReaction ────────────────────────────────────────────────────────
/**
 * A single emoji that floats upward with organic movement.
 * All animation parameters are pre-computed by the hook and passed as props
 * so this component is a pure renderer — it never calls Math.random().
 *
 * Props: reaction { id, emoji, x, rotate, sway, size, duration, delay }
 */
const FloatingReaction = memo(function FloatingReaction({ reaction }) {
  const { emoji, x, rotate, sway, size, duration, delay } = reaction;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: '8px',
        left: `${x}%`,
        fontSize: `${size}rem`,
        lineHeight: 1,
        pointerEvents: 'none',
        userSelect: 'none',
        // Per-emoji CSS custom properties consumed by the keyframe
        '--djr-sway-a': `${sway}px`,
        '--djr-sway-b': `${-sway * 0.6}px`,
        animationName: 'djr-float',
        animationDuration: `${duration}s`,
        animationDelay: `${delay}ms`,
        animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animationFillMode: 'both',
        // Subtle drop shadow so emoji pops against dark album art
        filter: `drop-shadow(0 2px 8px rgba(0,0,0,0.7)) drop-shadow(0 0 12px rgba(255,255,255,0.15))`,
        willChange: 'transform, opacity',
        zIndex: 9999,
      }}
    >
      {emoji}
    </div>
  );
});

// ─── FloatingReactionContainer ───────────────────────────────────────────────
/**
 * Full-screen overlay that renders all active floating reactions.
 * pointer-events: none — never intercepts clicks or touch on the page beneath.
 *
 * Props:
 *   reactions — array produced by useReactions()
 */
export default function FloatingReactionContainer({ reactions }) {
  if (reactions.length === 0) return null; // nothing to render — skip the DOM node

  return (
    <>
      {/* Static keyframes — one <style> tag, never re-injected */}
      <style>{KEYFRAMES}</style>

      <div
        role="presentation"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 9998,
        }}
      >
        {reactions.map((r) => (
          <FloatingReaction key={r.id} reaction={r} />
        ))}
      </div>
    </>
  );
}
