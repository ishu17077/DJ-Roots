import { supabase } from './supabase.js';

// ======================== ROOM ========================

/** Fetch the current room by its code */
export async function fetchRoom(code) {
  if (!code) return null;
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .single();
  if (error) console.error('fetchRoom error:', error);
  return data;
}

/** Update room-level fields (is_playing, current_track_id, hype_mode, dj_timer, settings) */
export async function updateRoom(roomId, updates) {
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', roomId)
    .select()
    .single();
  if (error) console.error('updateRoom error:', error);
  return data;
}

/** Generate a random 6-character alphanumeric room code */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Create a new room and join as host. Returns { room, profile } */
export async function createRoom(hostName) {
  // 1. Get or create the host profile
  const profile = await getOrCreateProfile(hostName);
  if (!profile) return null;

  // 2. Generate a unique room code (retry if collision)
  let code = generateRoomCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from('rooms')
      .select('id')
      .eq('code', code)
      .maybeSingle();
    if (!existing) break;
    code = generateRoomCode();
    attempts++;
  }

  // 3. Create the room
  const { data: room, error } = await supabase
    .from('rooms')
    .insert({
      code,
      name: `${hostName}'s Room`,
      host_id: profile.id,
      dj_timer_seconds: 300,
    })
    .select()
    .single();
  if (error) {
    console.error('createRoom error:', error);
    return null;
  }

  // 4. Join as host
  await joinRoom(room.id, profile.id, 'host');

  return { room, profile };
}

/** Find existing profile by auth_id or name, or create a new one */
export async function getOrCreateProfile(name, authId = null) {
  // First try to find by auth_id (Supabase Auth linked profile)
  if (authId) {
    const { data: authLinked } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', authId)
      .maybeSingle();
    if (authLinked) return authLinked;
  }

  const username = `@${name.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(Math.random() * 1000)}`;

  // Try to find an existing profile with this exact name
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('name', name)
    .maybeSingle();

  if (existing) return existing;

  // Create a new profile
  const avatars = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
  ];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

  const insertData = { name, username, avatar_url: randomAvatar };
  if (authId) insertData.auth_id = authId;

  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('getOrCreateProfile error:', error);
    return null;
  }
  return newProfile;
}

/** Join an existing room by its code. Returns { room, profile } or null */
export async function joinRoomByCode(code, userName) {
  // 1. Find the room
  const room = await fetchRoom(code.toUpperCase().trim());
  if (!room) return null;

  // 2. Get or create profile
  const profile = await getOrCreateProfile(userName);
  if (!profile) return null;

  // 3. Join as member
  await joinRoom(room.id, profile.id, 'member');

  return { room, profile };
}

// ======================== QUEUE ========================

/** Fetch the full queue for a room, with song + added_by profile joined */
export async function fetchQueue(roomId) {
  const { data, error } = await supabase
    .from('queue_items')
    .select(`
      *,
      song:songs(*),
      adder:profiles!queue_items_added_by_fkey(*)
    `)
    .eq('room_id', roomId)
    .is('played_at', null)
    .order('votes', { ascending: false });
  if (error) console.error('fetchQueue error:', error);
  return data || [];
}

/** Add a song to the queue. Creates the song record if it doesn't exist. */
export async function addSongToQueue(roomId, songData, addedByProfileId) {
  // ── Step 1: Upsert the song record by title+artist (always works) ──────────
  const songUpsertData = {
    title: (songData.title || 'Unknown').slice(0, 200),
    artist: (songData.artist || 'Unknown').slice(0, 200),
    duration: songData.duration || 200,
    bpm: songData.bpm || 120,
    key: songData.key || 'C Maj',
    pitch: songData.pitch || 260,
    // YouTube thumbnail URLs embed the video ID: img.youtube.com/vi/{ID}/...
    img_url: songData.img || songData.img_url || null,
  };

  const { data: song, error: songErr } = await supabase
    .from('songs')
    .upsert(songUpsertData, { onConflict: 'title,artist' })
    .select()
    .single();

  if (songErr || !song) {
    console.error('addSong upsert error:', songErr);
    return null;
  }

  // ── Step 2: If migration 004 has been run, enrich with YouTube fields ───────
  if (songData.youtubeVideoId && song.id) {
    supabase
      .from('songs')
      .update({
        source: 'youtube',
        youtube_video_id: songData.youtubeVideoId,
        embed_url: songData.embedUrl || null,
      })
      .eq('id', song.id)
      .then(() => {}) // fire-and-forget; ignore error if columns don't exist yet
      .catch(() => {});
  }

  // ── Step 3: Check if already in the queue (to upvote instead of double-add) ─
  const { data: existingItem } = await supabase
    .from('queue_items')
    .select('id')
    .eq('room_id', roomId)
    .eq('song_id', song.id)
    .is('played_at', null)
    .maybeSingle();

  if (existingItem) {
    await voteSong(existingItem.id, addedByProfileId, 1);
    return existingItem;
  }

  // ── Step 4: Insert the queue item ──────────────────────────────────────────
  const { data: queueItem, error: qErr } = await supabase
    .from('queue_items')
    .insert({
      room_id: roomId,
      song_id: song.id,
      added_by: addedByProfileId,
      votes: 1,
    })
    .select()
    .single();

  if (qErr) console.error('addSongToQueue insert error:', qErr);
  return queueItem;
}
/** Remove a queue item */
export async function removeFromQueue(queueItemId) {
  const { error } = await supabase
    .from('queue_items')
    .delete()
    .eq('id', queueItemId);
  if (error) console.error('removeFromQueue error:', error);
}

/** Mark a queue item as played (moves it to history) */
export async function markAsPlayed(queueItemId) {
  const { error } = await supabase
    .from('queue_items')
    .update({ played_at: new Date().toISOString() })
    .eq('id', queueItemId);
  if (error) console.error('markAsPlayed error:', error);
}

// ======================== VOTES ========================

/** Cast a vote (+1 or -1) on a queue item. Upserts — one vote per user per item. */
export async function voteSong(queueItemId, profileId, value) {
  const { error } = await supabase
    .from('votes')
    .upsert({
      queue_item_id: queueItemId,
      profile_id: profileId,
      value,
    }, { onConflict: 'queue_item_id,profile_id' });
  if (error) console.error('voteSong error:', error);
}

// ======================== MEMBERS ========================

/** Fetch all members currently in a room, with their profile data */
export async function fetchRoomMembers(roomId) {
  const { data, error } = await supabase
    .from('room_members')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });
  if (error) console.error('fetchRoomMembers error:', error);
  return data || [];
}

/** Add a member to a room */
export async function joinRoom(roomId, profileId, role = 'member') {
  const { data, error } = await supabase
    .from('room_members')
    .upsert({
      room_id: roomId,
      profile_id: profileId,
      role,
      activity: 'Joined the room',
      activity_type: 'joined',
    }, { onConflict: 'room_id,profile_id' })
    .select()
    .single();
  if (error) console.error('joinRoom error:', error);
  return data;
}

/** Remove a member from a room */
export async function leaveRoom(roomId, profileId) {
  const { error } = await supabase
    .from('room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('profile_id', profileId);
  if (error) console.error('leaveRoom error:', error);
}

/** Update a member's activity */
export async function updateMemberActivity(roomId, profileId, activity, activityType) {
  const { error } = await supabase
    .from('room_members')
    .update({ activity, activity_type: activityType })
    .eq('room_id', roomId)
    .eq('profile_id', profileId);
  if (error) console.error('updateMemberActivity error:', error);
}

// ======================== PROFILES ========================

/** Fetch all profiles (for trending / search) */
export async function fetchProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name');
  if (error) console.error('fetchProfiles error:', error);
  return data || [];
}

// ======================== SONGS (Catalog) ========================

/** Fetch all songs in the catalog (for "Add Song" search) */
export async function fetchSongCatalog() {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('title');
  if (error) console.error('fetchSongCatalog error:', error);
  return data || [];
}

// ======================== REALTIME SUBSCRIPTIONS ========================

/**
 * Subscribe to real-time changes on queue_items for a room.
 * Returns an unsubscribe function.
 */
export function subscribeToQueue(roomId, onQueueChange) {
  const channel = supabase
    .channel(`queue-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'queue_items',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        console.log('Queue realtime event:', payload.eventType);
        onQueueChange(payload);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/**
 * Subscribe to real-time changes on room_members for a room.
 */
export function subscribeToMembers(roomId, onMembersChange) {
  const channel = supabase
    .channel(`members-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_members',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        console.log('Members realtime event:', payload.eventType);
        onMembersChange(payload);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/**
 * Subscribe to real-time changes on the room itself (is_playing, current_track, hype, etc.)
 */
export function subscribeToRoom(roomId, onRoomChange) {
  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        console.log('Room realtime event:', payload.eventType);
        onRoomChange(payload.new);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
