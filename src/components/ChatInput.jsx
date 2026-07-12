import React, { useState, useRef, useCallback, memo } from 'react';

const MAX_LENGTH = 250;

/**
 * ChatInput — resizing textarea + send button.
 *
 * Props:
 *   onSend   (text: string) => void
 *   disabled  boolean
 *   error     string|null
 *
 * Styles are injected globally by LiveChat (djr-chat-styles in <head>).
 * Enter = send; Shift+Enter = newline.
 */
const ChatInput = memo(function ChatInput({ onSend, disabled, error }) {
  const [text, setText]   = useState('');
  const textareaRef       = useRef(null);
  const remaining         = MAX_LENGTH - text.length;
  const canSend           = text.trim().length > 0 && !disabled && remaining >= 0;

  const handleSubmit = useCallback(() => {
    if (!canSend) return;
    onSend(text);
    setText('');
    // Reset textarea height after clearing
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [canSend, onSend, text]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Auto-resize textarea as user types (up to CSS max-height)
  const handleChange = useCallback((e) => {
    const val = e.target.value;
    if (val.length > MAX_LENGTH) return; // hard cap; let maxLength attr handle display
    setText(val);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  return (
    <div className="djr-input-wrap" role="form" aria-label="Chat input">
      {/* Error banner */}
      {error && (
        <div
          style={{
            fontSize: '0.6rem',
            color: '#f87171',
            padding: '3px 4px',
            background: 'rgba(248,113,113,0.08)',
            borderRadius: '5px',
            border: '1px solid rgba(248,113,113,0.2)',
          }}
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className="djr-input-row">
        <textarea
          ref={textareaRef}
          className="djr-textarea"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          aria-label="Message input"
          aria-multiline="true"
          rows={1}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          autoComplete="off"
          spellCheck="true"
        />
        <button
          className="djr-send-btn"
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Send message"
          type="button"
        >
          {/* Paper-plane icon — inline SVG, zero external deps */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

      {/* Character counter — only appears when nearing the limit */}
      <div
        className="djr-char-count"
        style={{ color: remaining < 30 ? '#f87171' : 'rgba(255,255,255,0.2)' }}
        aria-live="polite"
        aria-label={`${remaining} characters remaining`}
      >
        {remaining < 50 ? `${remaining} left` : ''}
      </div>
    </div>
  );
});

export default ChatInput;
