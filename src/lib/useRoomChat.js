import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMessages, sendMessage, subscribeToMessages } from './chatService.js';

/**
 * useRoomChat — all chat logic in one place.
 *
 * Responsibilities:
 *   1. Load message history when roomId changes.
 *   2. Subscribe to realtime inserts; deduplicate against optimistic rows.
 *   3. Expose sendMessage with optimistic UI + error recovery.
 *   4. Track scroll position to drive the "new messages" indicator.
 *
 * @param {string|null} roomId
 * @param {object|null} userProfile  { id, name, avatar_url }
 * @returns {{
 *   messages:      Array,
 *   loading:       boolean,
 *   error:         string|null,
 *   send:          (text: string) => Promise<void>,
 *   sending:       boolean,
 *   hasNewMessages: boolean,
 *   clearNewMessages: () => void,
 * }}
 */
export function useRoomChat(roomId, userProfile) {
  const [messages, setMessages]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [sending, setSending]           = useState(false);
  const [hasNewMessages, setHasNew]     = useState(false);

  // Used to deduplicate optimistic rows against real-time inserts
  const optimisticIds = useRef(new Set());
  // Guard against state updates after unmount
  const isMounted = useRef(true);
  // Ref so the realtime callback always sees the latest messages without stale closure
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── 1. Load history whenever roomId changes ──────────────────────────────
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setHasNew(false);

    fetchMessages(roomId)
      .then((msgs) => {
        if (!cancelled && isMounted.current) {
          setMessages(msgs);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('[useRoomChat] fetchMessages failed:', err);
        if (!cancelled && isMounted.current) {
          setError('Could not load chat history.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [roomId]);

  // ── 2. Realtime subscription ─────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToMessages(roomId, (newMsg) => {
      if (!isMounted.current) return;

      setMessages((prev) => {
        // Deduplicate: if this id already exists (optimistic or duplicate event) skip it
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        // Also remove any optimistic placeholder from the same user+timestamp window
        if (optimisticIds.current.has(newMsg.id)) {
          optimisticIds.current.delete(newMsg.id);
          return prev.map((m) => (m.id === newMsg.id ? newMsg : m));
        }
        return [...prev, newMsg];
      });

      // Signal new message indicator (caller can suppress if already at bottom)
      setHasNew(true);
    });

    return unsubscribe;
  }, [roomId]);

  // ── 3. Send with optimistic UI ───────────────────────────────────────────
  const send = useCallback(async (text) => {
    const trimmed = (text || '').trim().slice(0, 2000);
    if (!trimmed || !roomId || !userProfile?.id || sending) return;

    const optimisticId = `opt-${Date.now()}-${Math.random()}`;
    const optimisticMsg = {
      id:         optimisticId,
      room_id:    roomId,
      user_id:    userProfile.id,
      username:   userProfile.name || 'Guest',
      avatar_url: userProfile.avatar_url || null,
      message:    trimmed,
      created_at: new Date().toISOString(),
      optimistic: true,
    };

    // Show immediately
    setMessages((prev) => [...prev, optimisticMsg]);
    setSending(true);
    setError(null);

    try {
      const confirmed = await sendMessage({
        roomId,
        userId:    userProfile.id,
        username:  userProfile.name || 'Guest',
        avatarUrl: userProfile.avatar_url || null,
        message:   trimmed,
      });

      if (!isMounted.current) return;

      // Replace optimistic row with the confirmed one (realtime may also arrive — deduplicated above)
      if (confirmed) {
        optimisticIds.current.add(confirmed.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? confirmed : m))
        );
      }
    } catch (err) {
      console.error('[useRoomChat] sendMessage failed:', err);
      if (!isMounted.current) return;
      // Roll back the optimistic message and show error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setError('Failed to send. Please try again.');
    } finally {
      if (isMounted.current) setSending(false);
    }
  }, [roomId, userProfile, sending]);

  const clearNewMessages = useCallback(() => setHasNew(false), []);

  return { messages, loading, error, send, sending, hasNewMessages, clearNewMessages };
}
