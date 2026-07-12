import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useRoomChat } from '../lib/useRoomChat.js';
import ChatMessage from './ChatMessage.jsx';
import ChatInput from './ChatInput.jsx';

// ─── One-time style injection (module level) ─────────────────────────────────
// Injected into <head> once per app lifetime, never on re-render.
const CHAT_CSS = `
  @keyframes djr-msg-in {
    from { opacity: 0; transform: translateY(6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @keyframes djr-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.7); }
  }

  /* ── Chat panel wrapper ── */
  .djr-chat {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: rgba(3,3,7,0.6);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 18px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    position: relative;
  }

  /* ── Header ── */
  .djr-chat__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
    gap: 6px;
  }
  .djr-chat__title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.7);
  }
  .djr-chat__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34d399;
    animation: djr-pulse 1.8s ease-in-out infinite;
    flex-shrink: 0;
  }

  /* ── Message list ── */
  .djr-chat__messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 0;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: rgba(139,92,246,0.3) transparent;
    min-height: 0;
  }
  .djr-chat__messages::-webkit-scrollbar { width: 4px; }
  .djr-chat__messages::-webkit-scrollbar-thumb {
    background: rgba(139,92,246,0.3);
    border-radius: 2px;
  }

  /* ── Empty / loading states ── */
  .djr-chat__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 8px;
    color: rgba(255,255,255,0.18);
    font-size: 0.68rem;
    text-align: center;
    padding: 20px;
  }
  .djr-chat__empty-icon {
    font-size: 1.8rem;
    opacity: 0.4;
  }

  /* ── New messages indicator ── */
  .djr-new-msg-btn {
    position: absolute;
    bottom: 82px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(139,92,246,0.85);
    color: white;
    border: none;
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 0.62rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 14px rgba(139,92,246,0.35);
    transition: background 0.15s, transform 0.1s;
    z-index: 10;
    white-space: nowrap;
    animation: djr-msg-in 0.18s ease-out both;
  }
  .djr-new-msg-btn:hover { background: rgba(139,92,246,1); }
  .djr-new-msg-btn:active { transform: translateX(-50%) scale(0.95); }
  .djr-new-msg-btn:focus-visible {
    outline: 2px solid rgba(139,92,246,0.7);
    outline-offset: 2px;
  }

  /* ── Offline notice ── */
  .djr-chat__offline {
    padding: 6px 14px;
    font-size: 0.62rem;
    color: #fbbf24;
    background: rgba(251,191,36,0.07);
    border-bottom: 1px solid rgba(251,191,36,0.15);
    text-align: center;
    flex-shrink: 0;
  }

  /* ── Message styles (ChatMessage) ── */
  .djr-msg {
    animation: djr-msg-in 0.18s ease-out both;
    display: flex;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 10px;
    transition: background 0.12s;
    position: relative;
    word-break: break-word;
  }
  .djr-msg:hover { background: rgba(255,255,255,0.03); }
  .djr-msg--own  { flex-direction: row-reverse; }
  .djr-msg__avatar {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    object-fit: cover;
    flex-shrink: 0;
    margin-top: 1px;
    background: rgba(139,92,246,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 700;
    color: #a78bfa;
    overflow: hidden;
  }
  .djr-msg__body { flex: 1; min-width: 0; }
  .djr-msg--own .djr-msg__body {
    align-items: flex-end;
    display: flex;
    flex-direction: column;
  }
  .djr-msg__header {
    display: flex;
    align-items: baseline;
    gap: 5px;
    margin-bottom: 2px;
  }
  .djr-msg__name {
    font-size: 0.65rem;
    font-weight: 700;
    color: #a78bfa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 110px;
  }
  .djr-msg--own .djr-msg__name { color: #34d399; }
  .djr-msg__time {
    font-size: 0.55rem;
    color: rgba(255,255,255,0.25);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .djr-msg__bubble {
    font-size: 0.72rem;
    line-height: 1.45;
    color: #d4d4d8;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
    padding: 5px 8px;
    display: inline-block;
    max-width: 100%;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    white-space: pre-wrap;
  }
  .djr-msg--own .djr-msg__bubble {
    background: rgba(139,92,246,0.12);
    border-color: rgba(139,92,246,0.18);
    color: #e4e4e7;
  }
  .djr-msg--optimistic .djr-msg__bubble { opacity: 0.6; }

  /* ── Input styles (ChatInput) ── */
  .djr-input-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 10px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.25);
    flex-shrink: 0;
  }
  .djr-input-row {
    display: flex;
    align-items: flex-end;
    gap: 6px;
  }
  .djr-textarea {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 7px 10px;
    font-size: 0.72rem;
    color: #e4e4e7;
    resize: none;
    line-height: 1.45;
    min-height: 34px;
    max-height: 90px;
    outline: none;
    font-family: inherit;
    transition: border-color 0.15s, box-shadow 0.15s;
    scrollbar-width: thin;
  }
  .djr-textarea::placeholder { color: rgba(255,255,255,0.25); }
  .djr-textarea:focus {
    border-color: rgba(139,92,246,0.5);
    box-shadow: 0 0 0 2px rgba(139,92,246,0.12);
  }
  .djr-send-btn {
    background: rgba(139,92,246,0.7);
    border: 1px solid rgba(139,92,246,0.4);
    border-radius: 9px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, transform 0.1s;
    color: white;
  }
  .djr-send-btn:hover:not(:disabled) {
    background: rgba(139,92,246,1);
    transform: scale(1.08);
  }
  .djr-send-btn:active:not(:disabled) { transform: scale(0.93); }
  .djr-send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .djr-send-btn:focus-visible {
    outline: 2px solid rgba(139,92,246,0.7);
    outline-offset: 2px;
  }
  .djr-char-count {
    font-size: 0.55rem;
    text-align: right;
    transition: color 0.15s;
  }
`;

// Inject styles once into <head> — idempotent, no re-injection on re-render
(function injectChatStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('djr-chat-styles')) return;
  const el = document.createElement('style');
  el.id = 'djr-chat-styles';
  el.textContent = CHAT_CSS;
  document.head.appendChild(el);
})();

/**
 * LiveChat — the full chat panel.
 *
 * Props:
 *   roomId      string|null   — Supabase room UUID
 *   userProfile object|null  — { id, name, avatar_url }
 */
export default function LiveChat({ roomId, userProfile, canControlPlayback, onAddSong, onPlaySong }) {
  const {
    messages,
    loading,
    error,
    send,
    sending,
    hasNewMessages,
    clearNewMessages,
  } = useRoomChat(roomId, userProfile);

  const listRef   = useRef(null);
  const bottomRef = useRef(null);

  // true  = user is pinned to the bottom; false = scrolled up
  const [atBottom, setAtBottom]   = useState(true);
  const atBottomRef               = useRef(true);

  // ── Auto-scroll helpers ───────────────────────────────────────────────────
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  // Initial history load — jump instantly (no animation stutter)
  useEffect(() => {
    if (!loading && messages.length > 0) scrollToBottom('auto');
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // New message arrives — auto-scroll only if already pinned at bottom
  useEffect(() => {
    if (messages.length === 0) return;
    if (atBottomRef.current) {
      scrollToBottom('smooth');
      clearNewMessages();
    }
    // If scrolled up, hasNewMessages indicator is shown (set inside the hook)
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track whether user is near the bottom (within 80 px threshold)
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    atBottomRef.current = nearBottom;
    setAtBottom(nearBottom);
    if (nearBottom) clearNewMessages();
  }, [clearNewMessages]);

  const handleJumpToBottom = useCallback(() => {
    scrollToBottom('smooth');
    clearNewMessages();
  }, [scrollToBottom, clearNewMessages]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      className="djr-chat"
      aria-label="Live chat"
      aria-live="polite"
      aria-relevant="additions"
    >
      {/* Header */}
      <div className="djr-chat__header">
        <div className="djr-chat__title">
          <span style={{ fontSize: '0.85rem' }}>💬</span>
          Live Chat
          {!loading && (
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              · {messages.length}
            </span>
          )}
        </div>
        {/* Live indicator dot — only when connected to a room */}
        {roomId && (
          <div className="djr-chat__dot" title="Connected" aria-hidden="true" />
        )}
      </div>

      {/* Offline notice */}
      {!roomId && (
        <div className="djr-chat__offline" role="status">
          Join a room to chat with others
        </div>
      )}

      {/* Message list */}
      <div
        className="djr-chat__messages"
        ref={listRef}
        onScroll={handleScroll}
        role="list"
        aria-label="Chat messages"
        aria-busy={loading}
      >
        {loading && (
          <div className="djr-chat__empty">
            <div className="djr-chat__empty-icon">⏳</div>
            <span>Loading messages…</span>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="djr-chat__empty">
            <div className="djr-chat__empty-icon">💬</div>
            <span>
              {roomId
                ? 'No messages yet.\nBe the first to say something!'
                : 'Join a room to start chatting.'}
            </span>
          </div>
        )}

        {!loading && messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwn={msg.user_id === userProfile?.id}
            canControlPlayback={canControlPlayback}
            onAddSong={onAddSong}
            onPlaySong={onPlaySong}
          />
        ))}

        {/* Invisible anchor — scrollIntoView target */}
        <div ref={bottomRef} aria-hidden="true" style={{ height: 1 }} />
      </div>

      {/* New-messages indicator (shown when scrolled up and new messages arrive) */}
      {hasNewMessages && !atBottom && (
        <button
          className="djr-new-msg-btn"
          onClick={handleJumpToBottom}
          aria-label="Jump to new messages"
        >
          ↓ New messages
        </button>
      )}

      {/* Input */}
      <ChatInput
        onSend={send}
        disabled={!roomId || sending}
        error={error}
      />
    </section>
  );
}
