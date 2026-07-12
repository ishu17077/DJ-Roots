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
  function ChatMessage({ message, isOwn, canControlPlayback, onAddSong, onPlaySong }) {
    const cls = [
      'djr-msg',
      isOwn ? 'djr-msg--own' : '',
      message.optimistic ? 'djr-msg--optimistic' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const suggestionMatch = message.message.match(/^\[SUGGESTION:(.+)\]$/);
    let suggestionSong = null;
    if (suggestionMatch) {
      try {
        suggestionSong = JSON.parse(suggestionMatch[1]);
      } catch (e) {
        // fallback to normal text if JSON fails
      }
    }

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
          {/* Plain text or custom suggestion widget */}
          <div className="djr-msg__bubble" style={{ padding: suggestionSong ? '8px' : '5px 8px' }}>
            {suggestionSong ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700 }}>Suggested a track:</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <img src={suggestionSong.img} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
                    <div style={{ fontWeight: '800', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'white' }}>{suggestionSong.title}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{suggestionSong.artist}</div>
                  </div>
                </div>
                {canControlPlayback && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                     <button onClick={() => onAddSong && onAddSong(suggestionSong)} style={{ flex: 1, padding: '6px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#a78bfa', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>Add to Queue</button>
                     <button onClick={() => onPlaySong && onPlaySong(suggestionSong)} style={{ flex: 1, padding: '6px', background: '#8b5cf6', border: 'none', borderRadius: '6px', color: 'white', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>Play Now</button>
                  </div>
                )}
              </div>
            ) : (
              message.message
            )}
          </div>
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
