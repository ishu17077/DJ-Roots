import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchRoom,
  updateRoom,
  fetchQueue,
  addSongToQueue,
  removeFromQueue,
  markAsPlayed,
  voteSong,
  fetchRoomMembers,
  fetchSongCatalog,
  subscribeToQueue,
  subscribeToMembers,
  subscribeToRoom,
} from './supabaseService.js';
import { buildEmbedUrl } from './youtubeService.js';

function extractYouTubeVideoIdFromImage(imgUrl) {
  if (!imgUrl) return null;

  const match = imgUrl.match(/\/(?:vi|vi_webp)\/([a-zA-Z0-9_-]{11})\//);
  return match ? match[1] : null;
}

/**
 * Transforms raw queue_items (with joins) into the flat shape that App.jsx expects.
 */
function transformQueueItem(item) {
  const song = item.song || {};
  const adder = item.adder || {};
  // Prefer the stored DB columns; fall back to image-URL extraction for legacy rows
  const youtubeVideoId = song.youtube_video_id || extractYouTubeVideoIdFromImage(song.img_url);
  const isYouTubeTrack = song.source === 'youtube' || Boolean(youtubeVideoId);

  return {
    id: item.id,
    songId: song.id,
    title: song.title || 'Unknown',
    artist: song.artist || 'Unknown',
    duration: song.duration || 200,
    bpm: song.bpm || 120,
    key: song.key || 'C Maj',
    pitch: song.pitch || 260,
    img: song.img_url || '',
    votes: item.votes || 0,
    addedBy: adder.name || 'Unknown',
    userAvatar: adder.avatar_url || '',
    source: isYouTubeTrack ? 'youtube' : (song.source || 'catalog'),
    youtubeVideoId: youtubeVideoId || null,
    embedUrl: song.embed_url || (youtubeVideoId ? buildEmbedUrl(youtubeVideoId) : ''),
  };
}


/**
 * Transforms room_members rows into the shape PeopleSection expects.
 */
function transformMember(member) {
  const profile = member.profile || {};
  return {
    id: member.id,
    profileId: profile.id,
    name: profile.name || 'Unknown',
    username: profile.username || '@unknown',
    avatar: profile.avatar_url || '',
    role: member.role === 'host' ? 'Host' : member.role === 'dj_next' ? 'DJ Next' : 'Member',
    activity: member.activity || 'Joined the room',
    activityType: member.activity_type || 'joined',
    joined: formatRelativeTime(member.joined_at),
  };
}

function formatRelativeTime(isoString) {
  if (!isoString) return 'just now';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * @param {string|null} roomCode — the room code to connect to (null = don't connect yet)
 * @param {object|null} userProfile — { id, name, avatar_url } from the lobby
 */
export function useSupabaseRoom(roomCode, userProfile) {
  const [room, setRoom] = useState(null);
  const [queueList, setQueueList] = useState([]);
  const [members, setMembers] = useState([]);
  const [songCatalog, setSongCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const roomIdRef = useRef(null);
  const currentUserId = userProfile?.id || null;

  // ======================== CONNECT TO ROOM ========================
  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsubQueue, unsubMembers, unsubRoom;
    let pollInterval;

    const init = async () => {
      setLoading(true);
      try {
        // 1. Fetch room
        const roomData = await fetchRoom(roomCode);
        if (!roomData) {
          console.warn('Room not found:', roomCode);
          if (isMounted) setLoading(false);
          return;
        }
        if (!isMounted) return;
        setRoom(roomData);
        roomIdRef.current = roomData.id;

        // 2. Fetch queue
        const queueData = await fetchQueue(roomData.id);
        if (isMounted) setQueueList(queueData.map(transformQueueItem));

        // 3. Fetch members
        const membersData = await fetchRoomMembers(roomData.id);
        if (isMounted) setMembers(membersData.map(transformMember));

        // 4. Fetch song catalog
        const catalog = await fetchSongCatalog();
        if (isMounted) setSongCatalog(catalog);

        if (!isMounted) return;
        setConnected(true);

        // 5. Set up real-time subscriptions
        unsubQueue = subscribeToQueue(roomData.id, async () => {
          if (!isMounted) return;
          const freshQueue = await fetchQueue(roomData.id);
          if (isMounted) setQueueList(freshQueue.map(transformQueueItem));
        });

        unsubMembers = subscribeToMembers(roomData.id, async () => {
          if (!isMounted) return;
          const freshMembers = await fetchRoomMembers(roomData.id);
          if (isMounted) setMembers(freshMembers.map(transformMember));
        });

        unsubRoom = subscribeToRoom(roomData.id, (newRoom) => {
          if (isMounted) setRoom(newRoom);
        });

        // 6. Setup Polling Fallback (in case Realtime is not enabled in Supabase DB)
        pollInterval = setInterval(async () => {
          if (!roomIdRef.current || !isMounted) return;
          try {
            const freshRoom = await fetchRoom(roomCode);
            if (freshRoom && isMounted) setRoom(freshRoom);
            
            const freshQueue = await fetchQueue(roomIdRef.current);
            if (isMounted) setQueueList(freshQueue.map(transformQueueItem));
          } catch (e) {
            console.error('Polling error:', e);
          }
        }, 3000);

      } catch (err) {
        console.error('Supabase init error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (unsubQueue) unsubQueue();
      if (unsubMembers) unsubMembers();
      if (unsubRoom) unsubRoom();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [roomCode]);

  // ======================== ACTIONS ========================

  const handleVoteSong = useCallback(async (queueItemId, value) => {
    if (!connected || !currentUserId) return;
    await voteSong(queueItemId, currentUserId, value);
  }, [connected, currentUserId]);

  const handleAddSong = useCallback(async (songData) => {
    if (!connected || !roomIdRef.current || !currentUserId) return;
    await addSongToQueue(roomIdRef.current, songData, currentUserId);
  }, [connected, currentUserId]);

  const handleRemoveSong = useCallback(async (queueItemId) => {
    if (!connected) return;
    await removeFromQueue(queueItemId);
    setQueueList(prev => prev.filter(item => item.id !== queueItemId));
  }, [connected]);

  const handleUpdateRoom = useCallback(async (updates) => {
    if (!connected || !roomIdRef.current) return;
    const updated = await updateRoom(roomIdRef.current, updates);
    if (updated) setRoom(updated);
  }, [connected]);

  const handleMarkAsPlayed = useCallback(async (queueItemId) => {
    if (!connected) return;
    await markAsPlayed(queueItemId);
  }, [connected]);

  return {
    room,
    queueList,
    setQueueList,
    members,
    songCatalog,
    loading,
    connected,
    currentUserId,
    handleVoteSong,
    handleAddSong,
    handleRemoveSong,
    handleUpdateRoom,
    handleMarkAsPlayed,
  };
}
