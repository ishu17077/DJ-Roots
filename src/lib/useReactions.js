import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase.js';

/** Max simultaneous reactions to keep the DOM lightweight */
const MAX_REACTIONS = 40;

/** Total lifetime of a single reaction (ms) — must match the CSS animation duration */
const REACTION_TTL = 2400;

/**
 * useReactions — manages floating emoji reactions for a room.
 *
 * - Broadcasts via Supabase Realtime broadcast (zero DB writes, ephemeral).
 * - Maintains a lightweight list of active reactions for the renderer.
 * - Auto-cleans expired entries; safe against unmount via isMounted ref.
 *
 * @param {string|null} roomId      Supabase room UUID. null = offline/local-only mode.
 * @param {object|null} userProfile { id, name }
 * @returns {{ reactions: array, sendReaction: (emoji: string) => void }}
 */
export function useReactions(roomId, userProfile) {
  const [reactions, setReactions] = useState([]);

  // Supabase channel ref — set once per roomId
  const channelRef = useRef(null);
  // Guard against state updates after unmount
  const isMountedRef = useRef(true);
  // Stable user-identity snapshot to avoid recreating the channel on profile churn
  const userIdRef  = useRef(userProfile?.id   || 'anon');
  const userNameRef = useRef(userProfile?.name || 'Guest');

  // Keep user identity refs fresh without triggering effect re-runs
  useEffect(() => {
    userIdRef.current  = userProfile?.id   || 'anon';
    userNameRef.current = userProfile?.name || 'Guest';
  }, [userProfile?.id, userProfile?.name]);

  // Unmount guard
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  /**
   * Spawns a floating reaction locally.
   * All visual randomization is computed here so the renderer is pure/stable.
   */
  const spawnReaction = useCallback((emoji) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const item = {
      id,
      emoji,
      // Horizontal start: 5–85 % so emojis never clip the edge
      x:        5 + Math.random() * 80,
      // Per-emoji rotation: –15° → +15°
      rotate:   Math.round((Math.random() - 0.5) * 30),
      // Drift: how far left/right it wanders while rising (–30 px → +30 px)
      sway:     Math.round((Math.random() - 0.5) * 60),
      // Size variation: 1.6 rem → 2.2 rem
      size:     +(1.6 + Math.random() * 0.6).toFixed(2),
      // Animation duration: 2.0 s → 2.5 s
      duration: +(2.0 + Math.random() * 0.5).toFixed(2),
      // Launch delay: 0 → 120 ms (staggers burst reactions)
      delay:    Math.round(Math.random() * 120),
    };

    setReactions((prev) => {
      // Cap to MAX_REACTIONS by dropping the oldest if overflowing
      const next = prev.length >= MAX_REACTIONS ? prev.slice(-MAX_REACTIONS + 1) : prev;
      return [...next, item];
    });

    // Auto-remove after animation ends — guarded against stale/unmounted calls
    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, REACTION_TTL + item.delay + 100); // extra 100 ms buffer for animation completion

    return () => clearTimeout(timer);
  }, []); // stable — no external deps

  /**
   * Public API: send an emoji reaction.
   * Immediately spawns locally; broadcasts to all other room members if connected.
   */
  const sendReaction = useCallback((emoji) => {
    if (!emoji) return;
    spawnReaction(emoji);

    if (channelRef.current && roomId) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'reaction',
          payload: {
            emoji,
            userId:   userIdRef.current,
            username: userNameRef.current,
            roomId,
            ts: Date.now(),
          },
        });
      } catch (err) {
        // Non-fatal — local reaction already spawned
        console.warn('[useReactions] broadcast failed:', err);
      }
    }
  }, [roomId, spawnReaction]); // roomId is the only external dep that matters here

  // Subscribe to the room's reaction broadcast channel
  useEffect(() => {
    if (!roomId) return; // offline mode: local-only reactions still work

    const channel = supabase.channel(`reactions-${roomId}`, {
      config: { broadcast: { self: false } }, // sender's own reactions are already spawned locally
    });

    channel
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        if (payload?.emoji && isMountedRef.current) {
          spawnReaction(payload.emoji);
        }
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[useReactions] channel error — reactions may not propagate');
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, spawnReaction]);

  return { reactions, sendReaction };
}
