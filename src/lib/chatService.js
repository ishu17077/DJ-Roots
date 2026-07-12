import { supabase } from './supabase.js';

/** Maximum messages to load on initial join */
const HISTORY_LIMIT = 50;

/**
 * Fetch the most recent messages for a room, returned in chronological order.
 * @param {string} roomId
 * @returns {Promise<Array>}
 */
export async function fetchMessages(roomId) {
  const { data, error } = await supabase
    .from('room_messages')
    .select('id, user_id, username, avatar_url, message, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  if (error) throw error;
  // Reverse so oldest is first (chronological display)
  return (data || []).reverse();
}

/**
 * Insert a new chat message.
 * Returns the inserted row on success.
 * @param {{ roomId, userId, username, avatarUrl, message }} opts
 */
export async function sendMessage({ roomId, userId, username, avatarUrl, message }) {
  const trimmed = message.trim().slice(0, 2000);
  if (!trimmed) return null;

  const { data, error } = await supabase
    .from('room_messages')
    .insert({
      room_id:    roomId,
      user_id:    userId,
      username,
      avatar_url: avatarUrl || null,
      message:    trimmed,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Subscribe to new messages in a room via Postgres Realtime.
 * Follows the same pattern as subscribeToQueue / subscribeToRoom in supabaseService.js.
 *
 * @param {string}   roomId
 * @param {Function} onMessage  Called with the new message row on each INSERT.
 * @returns {Function}          Call this to unsubscribe and clean up.
 */
export function subscribeToMessages(roomId, onMessage) {
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(`chat-${roomId}-${uniqueId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'room_messages',
        filter: `room_id=eq.${roomId}`,
      },
      ({ new: msg }) => {
        if (msg?.id) onMessage(msg);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
