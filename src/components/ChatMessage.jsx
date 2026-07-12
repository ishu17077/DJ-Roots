import React, { memo } from 'react';

/** Format HH:MM for message timestamps */
function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/** Initials fallback for avatars */
function initials(name = '') {
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

/**
 * ChatMessage — a single chat bubble (memoized).
 *
 * Props:
 *   message  { id, username, avatar_url, message, created_at, optimistic? }
 *   isOwn    boolean — true when the message belongs to the current user
 *
 * Styles are injected globally by LiveChat (djr-chat-styles in <head>).
 * No dangerouslySetInnerHTML — XSS-safe by design.
 */
const ChatMessage = memo(
  function ChatMessage({ message, isOwn }) {
    const cls = [
      'djr-msg',
      isOwn ? 'djr-msg--own' : '',
      message.optimistic ? 'djr-msg--optimistic' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={cls} role="listitem">
        {/* Avatar — image if available, initials otherwise */}
        <div className="djr-msg__avatar" aria-hidden="true">
          {message.avatar_url ? (
            <img
              src={message.avatar_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            initials(message.username)
          )}
        </div>

        <div className="djr-msg__body">
          <div className="djr-msg__header">
            <span className="djr-msg__name" title={message.username}>
              {isOwn ? 'You' : message.username}
            </span>
            <time className="djr-msg__time" dateTime={message.created_at}>
              {formatTime(message.created_at)}
            </time>
            {message.optimistic && (
              <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.2)' }}>
                sending…
              </span>
            )}
          </div>
          {/* Plain text — no dangerouslySetInnerHTML, safe from XSS */}
          <div className="djr-msg__bubble">{message.message}</div>
        </div>
      </div>
    );
  },
  // Custom equality — only re-render if id, optimistic flag, or ownership changes
  (prev, next) =>
    prev.message.id === next.message.id &&
    prev.message.optimistic === next.message.optimistic &&
    prev.isOwn === next.isOwn
);

export default ChatMessage;
