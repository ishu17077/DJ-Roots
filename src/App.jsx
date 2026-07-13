import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import AddSongSection from './components/AddSongSection.jsx';
import DJModeSection from './components/DJModeSection.jsx';
import HomeSection from './components/HomeSection.jsx';
import QueueSection from './components/QueueSection.jsx';
import PeopleSection from './components/PeopleSection.jsx';
import SettingsSection from './components/SettingsSection.jsx';
import LobbyScreen from './components/LobbyScreen.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import LandingPage from './components/LandingPage.jsx';
import ClickSpark from './components/ClickSpark.jsx';
import { useSupabaseRoom } from './lib/useSupabaseRoom.js';
import { useReactions } from './lib/useReactions.js';
import { supabase } from './lib/supabase.js';
import { createRoom, joinRoomByCode, fetchPublicRooms } from './lib/supabaseService.js';
import { isValidYouTubeUrl, createSongFromYouTube, extractVideoId, searchYouTube } from './lib/youtubeService.js';
import FloatingReactionContainer from './components/FloatingReactionContainer.jsx';
import ReactionBar from './components/ReactionBar.jsx';
import LiveChat from './components/LiveChat.jsx';
import { sendMessage } from './lib/chatService.js';

// --- ZERO-DEPENDENCY FUTURISTIC SVG ICON COMPONENT ---
// Replaces lucide-react to ensure instant rendering in sandboxes
const Icon = ({ name, className = "w-4 h-4", ...props }) => {
  const baseSvgProps = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    ...props
  };

  switch (name) {
    case 'Home':
      return (
        <svg {...baseSvgProps}>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'Radio':
      return (
        <svg {...baseSvgProps}>
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
          <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
        </svg>
      );
    case 'Copy':
      return (
        <svg {...baseSvgProps}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case 'Crown':
      return (
        <svg {...baseSvgProps}>
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
        </svg>
      );
    case 'Music':
      return (
        <svg {...baseSvgProps}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case 'ListMusic':
      return (
        <svg {...baseSvgProps}>
          <path d="M21 15V6M18 5l3-1v8" />
          <path d="M12 12H3M16 6H3M12 18H3" />
          <circle cx="16" cy="18" r="2" />
        </svg>
      );
    case 'PlusCircle':
      return (
        <svg {...baseSvgProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
    case 'Activity':
      return (
        <svg {...baseSvgProps}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'Users':
      return (
        <svg {...baseSvgProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'BarChart3':
      return (
        <svg {...baseSvgProps}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'Settings':
      return (
        <svg {...baseSvgProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'Zap':
      return (
        <svg {...baseSvgProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'Clock':
      return (
        <svg {...baseSvgProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'RefreshCw':
      return (
        <svg {...baseSvgProps}>
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      );
    case 'Headphones':
      return (
        <svg {...baseSvgProps}>
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      );
    case 'Search':
      return (
        <svg {...baseSvgProps}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case 'Plus':
      return (
        <svg {...baseSvgProps}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'X':
      return (
        <svg {...baseSvgProps}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case 'ChevronUp':
      return (
        <svg {...baseSvgProps}>
          <polyline points="18 15 12 9 6 15" />
        </svg>
      );
    case 'ChevronDown':
      return (
        <svg {...baseSvgProps}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case 'Shuffle':
      return (
        <svg {...baseSvgProps}>
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
      );
    case 'SkipBack':
      return (
        <svg {...baseSvgProps}>
          <polygon points="19 20 9 12 19 4 19 20" />
          <line x1="5" y1="19" x2="5" y2="5" />
        </svg>
      );
    case 'Play':
      return (
        <svg {...baseSvgProps}>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case 'Pause':
      return (
        <svg {...baseSvgProps}>
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      );
    case 'SkipForward':
      return (
        <svg {...baseSvgProps}>
          <polygon points="5 4 15 12 5 20 5 4" />
          <line x1="19" y1="5" x2="19" y2="19" />
        </svg>
      );
    case 'Repeat':
      return (
        <svg {...baseSvgProps}>
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      );
    case 'Volume2':
      return (
        <svg {...baseSvgProps}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      );
    case 'VolumeX':
      return (
        <svg {...baseSvgProps}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      );
    case 'Share':
      return (
        <svg {...baseSvgProps}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      );
    case 'MoreVertical':
      return (
        <svg {...baseSvgProps}>
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      );
    case 'ArrowUp':
      return (
        <svg {...baseSvgProps}>
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      );
    case 'Info':
      return (
        <svg {...baseSvgProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'AlertCircle':
      return (
        <svg {...baseSvgProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'Video':
      return (
        <svg {...baseSvgProps}>
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    case 'VideoOff':
      return (
        <svg {...baseSvgProps}>
          <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10l-2.66-1.9" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      );
    default:
      return null;
  }
};

// Map proxy component functions to local Icon wrappers
const Home = (p) => <Icon name="Home" {...p} />;
const Radio = (p) => <Icon name="Radio" {...p} />;
const Copy = (p) => <Icon name="Copy" {...p} />;
const Crown = (p) => <Icon name="Crown" {...p} />;
const Music = (p) => <Icon name="Music" {...p} />;
const ListMusic = (p) => <Icon name="ListMusic" {...p} />;
const PlusCircle = (p) => <Icon name="PlusCircle" {...p} />;
const Activity = (p) => <Icon name="Activity" {...p} />;
const Users = (p) => <Icon name="Users" {...p} />;
const BarChart3 = (p) => <Icon name="BarChart3" {...p} />;
const Settings = (p) => <Icon name="Settings" {...p} />;
const Zap = (p) => <Icon name="Zap" {...p} />;
const X = (p) => <Icon name="X" {...p} />;
const Shuffle = (p) => <Icon name="Shuffle" {...p} />;
const SkipBack = (p) => <Icon name="SkipBack" {...p} />;
const Play = (p) => <Icon name="Play" {...p} />;
const Pause = (p) => <Icon name="Pause" {...p} />;
const SkipForward = (p) => <Icon name="SkipForward" {...p} />;
const Repeat = (p) => <Icon name="Repeat" {...p} />;
const Volume2 = (p) => <Icon name="Volume2" {...p} />;
const VolumeX = (p) => <Icon name="VolumeX" {...p} />;
const Info = (p) => <Icon name="Info" {...p} />;
const AlertCircle = (p) => <Icon name="AlertCircle" {...p} />;

const TRENDING_POOL = [
  { id: 't1', title: 'Bella Ciao', artist: 'Money Heist', duration: 143, bpm: 120, key: 'A Min', pitch: 220, source: 'youtube', youtubeVideoId: '0aUav1lx3rA', img: 'https://img.youtube.com/vi/0aUav1lx3rA/mqdefault.jpg' },
  { id: 't3', title: 'Rasputin', artist: 'Boney M', duration: 283, bpm: 126, key: 'B Min', pitch: 250, source: 'youtube', youtubeVideoId: 'x5Oag4hISgU', img: 'https://img.youtube.com/vi/x5Oag4hISgU/mqdefault.jpg' },
  { id: 't2', title: 'Vaari Jaavan', artist: 'Jyoti Nooran', duration: 210, bpm: 115, key: 'D Min', pitch: 240, source: 'youtube', youtubeVideoId: 'SJ73cJXbPhE', img: 'https://img.youtube.com/vi/SJ73cJXbPhE/mqdefault.jpg' }
];

// Hardcoded fallback data for offline mode
const FALLBACK_QUEUE = [
  { id: '1', title: 'Bella Ciao', artist: 'Money Heist', votes: 24, duration: 143, pitch: 220, bpm: 120, key: 'A Min', source: 'youtube', youtubeVideoId: '0aUav1lx3rA', addedBy: 'Kabir', img: 'https://img.youtube.com/vi/0aUav1lx3rA/mqdefault.jpg', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80' },
  { id: '3', title: 'Rasputin', artist: 'Boney M', votes: 8, duration: 283, pitch: 250, bpm: 126, key: 'B Min', source: 'youtube', youtubeVideoId: 'x5Oag4hISgU', addedBy: 'Riya', img: 'https://img.youtube.com/vi/x5Oag4hISgU/mqdefault.jpg', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80' },
  { id: '2', title: 'Vaari Jaavan', artist: 'Jyoti Nooran', votes: 15, duration: 210, pitch: 240, bpm: 115, key: 'D Min', source: 'youtube', youtubeVideoId: 'SJ73cJXbPhE', addedBy: 'Rohan', img: 'https://img.youtube.com/vi/SJ73cJXbPhE/mqdefault.jpg', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80' }
];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  // --- AUTH STATE (persisted to localStorage for refresh survival) ---
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem('djroots_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [authChecking, setAuthChecking] = useState(true);

  // Check existing Supabase session on mount, but also respect localStorage fallback
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        try { localStorage.setItem('djroots_auth_user', JSON.stringify(session.user)); } catch { }
      }
      setAuthChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        try { localStorage.setItem('djroots_auth_user', JSON.stringify(session.user)); } catch { }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = useCallback((user) => {
    setAuthUser(user);
    try { localStorage.setItem('djroots_auth_user', JSON.stringify(user)); } catch { }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    try {
      localStorage.removeItem('djroots_auth_user');
      localStorage.removeItem('djroots_room_code');
      localStorage.removeItem('djroots_user_profile');
    } catch (e) { console.warn('localStorage clear failed:', e); }
  }, []);

  // Show loading spinner while checking auth (only if no cached user)
  if (authChecking && !authUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#030307]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  // Show landing page if they haven't bypassed it yet
  if (showLanding && !authUser) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Must be authenticated — show login
  if (!authUser) {
    return <LoginScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Go straight to the dashboard — room join/create is handled inside
  const authDisplayName = authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'Guest';
  const authAvatar = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null;
  return <DJRootsApp authUser={authUser} authDisplayName={authDisplayName} authAvatar={authAvatar} onLogout={handleLogout} />;
}

function DJRootsApp({ authUser, authDisplayName, authAvatar, onLogout }) {
  // --- ROOM STATE (persisted to localStorage) ---
  const [activeRoomCode, setActiveRoomCode] = useState(() => {
    try { return localStorage.getItem('djroots_room_code') || null; } catch { return null; }
  });
  const [rawUserProfile, setRawUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('djroots_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const userProfile = useMemo(() => {
    if (!rawUserProfile) return null;
    return { ...rawUserProfile, avatar_url: authAvatar || rawUserProfile.avatar_url };
  }, [rawUserProfile, authAvatar]);

  const displayAvatar = authAvatar || userProfile?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80';

  const handleJoinRoom = (code, profile) => {
    setActiveRoomCode(code);
    setRawUserProfile(profile);
    setConnectMode(null); // Close widget upon success
    try {
      localStorage.setItem('djroots_room_code', code);
      localStorage.setItem('djroots_user_profile', JSON.stringify(profile));
    } catch (e) { console.warn('localStorage save failed:', e); }
  };

  // --- OFFLINE ROOM CONNECT STATE ---
  const [connectMode, setConnectMode] = useState(null); // null | 'create' | 'join'
  const [connectName, setConnectName] = useState(authDisplayName || '');
  const [connectRoomCode, setConnectRoomCode] = useState('');
  const [connectIsPublic, setConnectIsPublic] = useState(true);
  const [publicRooms, setPublicRooms] = useState([]);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState('');

  useEffect(() => {
    if (!activeRoomCode) {
      fetchPublicRooms().then(rooms => setPublicRooms(rooms || []));
      const interval = setInterval(() => {
         fetchPublicRooms().then(rooms => setPublicRooms(rooms || []));
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [activeRoomCode]);

  const executeCreateRoom = async (e) => {
    e.preventDefault();
    if (!connectName.trim()) { setConnectError('Please enter your name'); return; }
    setConnectLoading(true); setConnectError('');
    try {
      const result = await createRoom(connectName.trim(), connectIsPublic);
      if (result) handleJoinRoom(result.room.code, result.profile);
      else setConnectError('Failed to create room.');
    } catch (err) { setConnectError('Connection error.'); }
    finally { setConnectLoading(false); }
  };

  const executeJoinRoom = async (e) => {
    e.preventDefault();
    if (!connectName.trim()) { setConnectError('Please enter your name'); return; }
    if (!connectRoomCode.trim()) { setConnectError('Please enter a room code'); return; }
    setConnectLoading(true); setConnectError('');
    try {
      const result = await joinRoomByCode(connectRoomCode.trim(), connectName.trim());
      if (result) handleJoinRoom(result.room.code, result.profile);
      else setConnectError('Room not found.');
    } catch (err) { setConnectError('Connection error.'); }
    finally { setConnectLoading(false); }
  };

  const handleLeaveRoom = () => {
    setActiveRoomCode(null);
    setRawUserProfile(null);
    try {
      localStorage.removeItem('djroots_room_code');
      localStorage.removeItem('djroots_user_profile');
    } catch (e) { console.warn('localStorage clear failed:', e); }
  };

  // --- SUPABASE BACKEND HOOK ---
  const {
    room: supabaseRoom,
    queueList: supabaseQueue,
    setQueueList: setSupabaseQueue,
    members: supabaseMembers,
    songCatalog,
    loading: supabaseLoading,
    connected: supabaseConnected,
    handleVoteSong: supabaseVote,
    handleAddSong: supabaseAddSong,
    handleRemoveSong: supabaseRemoveSong,
    handleUpdateRoom: supabaseUpdateRoom,
    handleUpdateMemberRole,
  } = useSupabaseRoom(activeRoomCode, userProfile);

  // --- EMOJI REACTIONS ---
  // Pass the room's Supabase UUID (not the short code) so the channel name is stable.
  // In offline mode (no room) reactions still appear locally via the hook's local path.
  const { reactions, sendReaction } = useReactions(supabaseRoom?.id || null, userProfile);

  // --- STATE ---
  const [activeView, setActiveView] = useState('home');
  const [activeAddTab, setActiveAddTab] = useState('search');
  const [localCurrentTrackId, setLocalCurrentTrackId] = useState(null);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [audioElapsedSeconds, setAudioElapsedSeconds] = useState(0);
  const syncChannelRef = useRef(null);
  const audioElapsedRef = useRef(0);
  useEffect(() => { audioElapsedRef.current = audioElapsedSeconds; }, [audioElapsedSeconds]);
  const [searchFilterText, setSearchFilterText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [hypeModeOn, setHypeModeOn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [djTimerSeconds, setDjTimerSeconds] = useState(300);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [waveformBars, setWaveformBars] = useState(new Array(45).fill(12));
  const [songLinkInput, setSongLinkInput] = useState('');
  const [isLoadingYutubeUrl, setIsLoadingYutubeUrl] = useState(false);
  const [skipUpvotes, setSkipUpvotes] = useState(8);
  const [skipDownvotes, setSkipDownvotes] = useState(3);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [hasMovedMouse, setHasMovedMouse] = useState(false);
  const [spectrumHeights, setSpectrumHeights] = useState(new Array(38).fill(4));
  const skipThreshold = 15;

  useEffect(() => {
    if (activeAddTab === 'search' && searchFilterText.trim().length > 2) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        const results = await searchYouTube(searchFilterText);
        setSearchResults(results);
        setIsSearching(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchFilterText, activeAddTab]);

  // --- REFS ---
  const interactiveScreenRef = useRef(null);
  const videoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const sequencerIntervalRef = useRef(null);
  const playbackIntervalRef = useRef(null);
  const recognizerRef = useRef(null);
  const requestRef = useRef(null);
  const lastGestureTimeRef = useRef(0);
  // Ref to the YouTube audio element's seek function — set by YouTubeAudioPlayer via HomeSection
  const youtubeSeekRef = useRef(null);
  // Ref to the YouTube audio element's volume control — set by YouTubeAudioPlayer via HomeSection
  const youtubeVolumeRef = useRef(null);

  // Track the user's local votes: { [song_id]: 1 | -1 }
  const [userVotes, setUserVotes] = useState({});

  // Is the current user the HOST of the active room?


  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('djroots_offline_queue');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load offline queue from localStorage', e);
    }
    return FALLBACK_QUEUE;
  });

  useEffect(() => {
    localStorage.setItem('djroots_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem('djroots_recent');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load recent queue from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('djroots_recent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  const [showChangeDJModal, setShowChangeDJModal] = useState(false);


  // --- Derived queue state (real data from Supabase, or local offline fallback) ---
  const queueList = activeRoomCode ? supabaseQueue : offlineQueue;
  const setQueueList = activeRoomCode ? setSupabaseQueue : setOfflineQueue;

  // --- DERIVED MEMO STATES ---
  
  const currentUserMember = (supabaseMembers || []).find(m => m.profileId === userProfile?.id || m.profileId === userProfile?.profileId);
  // isHost refers to the original room creator
  const isHost = activeRoomCode && supabaseRoom ? currentUserMember?.role === 'Host' : true;
  const isCurrentDJ = activeRoomCode && supabaseRoom ? userProfile?.profileId === supabaseRoom.host_id || userProfile?.id === supabaseRoom.host_id : true;
  const isCoHost = currentUserMember?.role === 'CO Host';
  const canControlPlayback = isHost || isCurrentDJ || isCoHost;
  const canControlPlaybackRef = useRef(false);
  useEffect(() => { canControlPlaybackRef.current = canControlPlayback; }, [canControlPlayback]);

  // --- SYNC PLAYBACK TIME FOR LATE JOINERS ---
  useEffect(() => {
    if (!activeRoomCode || !supabaseRoom?.id) return;
    
    const channel = supabase.channel(`sync-${supabaseRoom.id}`, {
      config: { broadcast: { self: false } }
    });

    channel
      .on('broadcast', { event: 'request-sync' }, () => {
        if (canControlPlaybackRef.current) {
          channel.send({
            type: 'broadcast',
            event: 'sync-data',
            payload: { time: audioElapsedRef.current }
          });
        }
      })
      .on('broadcast', { event: 'sync-data' }, ({ payload }) => {
        if (!canControlPlaybackRef.current && payload?.time !== undefined) {
          // Compensate for network transit and YouTube buffering time (approx ~0.35s total)
          const compensatedTime = payload.time + 0.35;
          const diff = Math.abs(audioElapsedRef.current - compensatedTime);
          
          // Relax the drift threshold to 2.5s to prevent constant stuttering and buffering
          if (diff > 2.5) {
            setAudioElapsedSeconds(compensatedTime);
            if (youtubeSeekRef.current) {
              youtubeSeekRef.current(compensatedTime);
            }
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && !canControlPlaybackRef.current) {
          channel.send({
            type: 'broadcast',
            event: 'request-sync',
            payload: {}
          });
        }
      });

    syncChannelRef.current = channel;

    // Heartbeat Sync: DJ broadcasts precise time every 2 seconds to correct drift
    const heartbeatInterval = setInterval(() => {
      if (canControlPlaybackRef.current) {
        channel.send({
          type: 'broadcast',
          event: 'sync-data',
          payload: { time: audioElapsedRef.current }
        });
      }
    }, 2000);

    return () => {
      clearInterval(heartbeatInterval);
      supabase.removeChannel(channel);
      syncChannelRef.current = null;
    };
  }, [activeRoomCode, supabaseRoom?.id]);

  const currentTrack = useMemo(() => {
    const fallback = { id: 'empty', title: 'No track playing', artist: 'Queue is empty or waiting', duration: 180, pitch: 220, bpm: 120, key: '-', img: null, userAvatar: null };
    if (activeRoomCode && supabaseRoom) {
      return queueList.find(t => t.id === supabaseRoom.current_track_id) || fallback;
    }
    
    if (localCurrentTrackId) {
      const found = queueList.find(t => t.id === localCurrentTrackId);
      if (found) return found;
    }
    
    return queueList.length > 0 ? queueList[0] : fallback;
  }, [queueList, activeRoomCode, supabaseRoom, localCurrentTrackId]);

  useEffect(() => {
    if (currentTrack && currentTrack.id !== 'empty') {
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(s => s.title !== currentTrack.title); // filter by title instead of id to prevent dupes across modes
        return [currentTrack, ...filtered].slice(0, 20);
      });
    }
  }, [currentTrack]);

  const isPlaying = activeRoomCode && supabaseRoom ? supabaseRoom.is_playing : localIsPlaying;

  const sortedAndFilteredQueue = useMemo(() => {
    const sorted = activeRoomCode && supabaseRoom 
      ? [...queueList].sort((a, b) => b.votes - a.votes)
      : [...queueList]; // Sequential order for Single Mode
      

      
    return sorted.filter(song =>
      song.title.toLowerCase().includes(searchFilterText.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchFilterText.toLowerCase())
    );
  }, [queueList, searchFilterText, activeRoomCode, supabaseRoom]);


  const upNextList = useMemo(() => {
    if (activeRoomCode && supabaseRoom) {
      // Room mode: sort by votes
      return [...queueList]
        .sort((a, b) => b.votes - a.votes)
        .filter(song => song.id !== currentTrack.id)
        .slice(0, 3);
    } else {
      // Single mode: show tracks upcoming sequentially
      const currentIdx = queueList.findIndex(t => t.id === currentTrack.id);
      if (currentIdx === -1) {
        return queueList.slice(0, 3);
      }
      // Return the next up to 3 tracks after current
      return queueList.slice(currentIdx + 1, currentIdx + 4);
    }
  }, [queueList, currentTrack.id, activeRoomCode, supabaseRoom]);


  const filteredTrending = useMemo(() => {
    return TRENDING_POOL.filter(song =>
      song.title.toLowerCase().includes(searchFilterText.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchFilterText.toLowerCase())
    );
  }, [searchFilterText]);

  // --- HELPERS / ACTIONS ---
  const addToast = (title, desc, isSuccess = true) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, title, desc, isSuccess }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // --- INITIALIZE AUDIO ENGINE ---
  const initAudioEngine = () => {
    if (typeof window === 'undefined') return;
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume / 200, ctx.currentTime);
      gainNode.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = gainNode;
    }
  };

  const triggerOscillatorTone = (freq, duration, type = 'sine') => {
    try {
      initAudioEngine();
      const ctx = audioCtxRef.current;
      const gainNode = masterGainRef.current;
      if (!ctx || !gainNode) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(gainNode);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      console.warn('Web Audio interaction warning:', err);
    }
  };

  // --- TIMERS & CONTROLLERS ---
  const togglePlayback = () => {
    // Non-hosts cannot control playback in a room
    if (activeRoomCode && !canControlPlayback) return;
    initAudioEngine();
    if (activeRoomCode && supabaseRoom) {
      if (!canControlPlayback) {
        addToast('Permission Denied', 'Only the DJ or CO Host can control playback.', false);
        return;
      }
      if (!supabaseRoom.current_track_id && queueList.length > 0) {
        supabaseUpdateRoom({ current_track_id: queueList[0].id, is_playing: true });
        return;
      }
      supabaseUpdateRoom({ is_playing: !supabaseRoom.is_playing });
      return;
    }
    if (!localCurrentTrackId && queueList.length > 0) {
      setLocalCurrentTrackId(queueList[0].id);
      setLocalIsPlaying(true);
      return;
    }
    setLocalIsPlaying(prev => !prev);
  };


  const showHomeView = () => {
    setActiveView('home');
    addToast('Home', 'Opening the room dashboard.');
  };

  const showDjModeView = () => {
    setActiveView('dj');
    addToast('DJ Mode', 'Interactive gesture workspace armed.');
  };

  const showAddSongView = () => {
    setActiveView('add-song');
    addToast('Add Song', 'Opening the song discovery console.');
  };

  const adjustVolume = (value) => {
    const parsed = parseInt(value, 10);
    setVolume(parsed);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(parsed / 200, audioCtxRef.current.currentTime);
    }
    // Also sync the YouTube <audio> element's native volume
    if (youtubeVolumeRef.current) {
      youtubeVolumeRef.current(parsed / 100);
    }
  };

  const selectTrack = (id) => {
    if (activeRoomCode && supabaseRoom) {
      if (!canControlPlayback) {
        addToast('Permission Denied', 'Only the DJ or CO Host can change tracks.', false);
        return;
      }
      supabaseUpdateRoom({ current_track_id: id, is_playing: true });
      setAudioElapsedSeconds(0);
      const targetIdx = queueList.findIndex(t => t.id === id);
      if (targetIdx !== -1) {
        addToast('Track Changed', `Selected: ${queueList[targetIdx].title}`);
      }
      return;
    }

    const targetIdx = queueList.findIndex(t => t.id === id);
    if (targetIdx !== -1) {
      setLocalCurrentTrackId(id);
      setAudioElapsedSeconds(0);
      addToast('Track Changed', `Selected: ${queueList[targetIdx].title}`);
      setLocalIsPlaying(true);
    }
  };

  const prevTrack = () => {
    if (activeRoomCode && supabaseRoom && !canControlPlayback) return;
    const currentIdx = queueList.findIndex(t => t.id === currentTrack.id);
    let target = currentIdx - 1;
    if (target < 0) target = queueList.length - 1;
    selectTrack(queueList[target].id);
  };

  const nextTrack = () => {
    if (activeRoomCode && supabaseRoom && !canControlPlayback) return;
    
    if (isShuffle && queueList.length > 0) {
      const target = Math.floor(Math.random() * queueList.length);
      selectTrack(queueList[target].id);
      return;
    }

    if (upNextList && upNextList.length > 0) {
      const targetSong = upNextList[0];
      
      // Pop the currently playing track from the queue so it doesn't replay or clutter
      if (currentTrack && currentTrack.id !== 'empty') {
        if (activeRoomCode && supabaseConnected) {
          supabaseRemoveSong(currentTrack.id);
        } else {
          setQueueList(prev => prev.filter(song => song.id !== currentTrack.id));
        }
      }
      
      selectTrack(targetSong.id);
    } else {
      if (isRepeat && queueList.length > 0) {
        const targetSong = activeRoomCode 
          ? [...queueList].sort((a,b) => b.votes - a.votes)[0] 
          : queueList[0];
        selectTrack(targetSong.id);
      } else {
        // Stop playback at end of queue
        if (activeRoomCode && supabaseRoom) {
          supabaseUpdateRoom({ is_playing: false, current_track_id: null });
        } else {
          setLocalIsPlaying(false);
          setLocalCurrentTrackId(null);
          setAudioElapsedSeconds(0);
        }
      }
    }
  };

  const voteSong = (id, value) => {
    // Prevent duplicate voting for the same value
    if (userVotes[id] === value) {
      addToast('Vote Blocked', 'You have already voted for this song.', false);
      return;
    }

    // Calculate the actual vote delta (e.g., changing from -1 to 1 means delta is +2)
    const prevVote = userVotes[id] || 0;
    const delta = value - prevVote;

    // Track locally
    setUserVotes(prev => ({ ...prev, [id]: value }));

    // Supabase path
    if (supabaseConnected) {
      supabaseVote(id, value);
    }
    // Optimistic local update (works for both online + offline)
    setQueueList(prev => prev.map(song => {
      if (song.id === id) {
        const newVotes = song.votes + delta;
        addToast('Vote Tallied', `${song.title} weight adjusted to: ${newVotes}`);
        return { ...song, votes: newVotes };
      }
      return song;
    }));
  };

  const addSongFromPool = (song) => {
    // Supabase path — async add
    if (supabaseConnected) {
      supabaseAddSong(song);
      const existing = queueList.find(q => q.title.toLowerCase() === song.title.toLowerCase());
      if (existing) {
        voteSong(existing.id, 1);
        return;
      }
      const newSong = {
        id: Date.now().toString(),
        title: song.title,
        artist: song.artist,
        votes: 1,
        duration: song.duration,
        pitch: song.pitch || 260,
        bpm: song.bpm,
        key: song.key,
        addedBy: userProfile?.name || 'Guest',
        img: song.img,
        userAvatar: displayAvatar
      };
      setQueueList(prev => [...prev, newSong]);
      addToast('Track Queued', `"${song.title}" added to the active crowd list.`);
      return;
    }

    // Offline fallback
    const existing = queueList.find(q => q.title.toLowerCase() === song.title.toLowerCase());
    if (existing) {
      voteSong(existing.id, 1);
      return;
    }

    const newSong = {
      id: Date.now().toString(),
      title: song.title,
      artist: song.artist,
      votes: 1,
      duration: song.duration,
      pitch: song.pitch || 260,
      bpm: song.bpm,
      key: song.key,
      addedBy: userProfile?.name || 'Guest',
      img: song.img,
      userAvatar: displayAvatar
    };

    setQueueList(prev => [...prev, newSong]);
    addToast('Track Queued', `"${song.title}" added to the active crowd list.`);
  };

  const playSongFromPool = async (song) => {
    if (activeRoomCode && !isHost) {
      addToast('Permission Denied', 'Only the DJ can change tracks.', false);
      return;
    }
    
    // Check if it's already in the queue
    const existing = queueList.find(q => q.title.toLowerCase() === song.title.toLowerCase());
    
    if (existing) {
      selectTrack(existing.id);
    } else {
      // Create new song object for queue
      const newSong = {
        id: Date.now().toString(),
        title: song.title,
        artist: song.artist,
        votes: 1,
        duration: song.duration,
        pitch: song.pitch || 260,
        bpm: song.bpm,
        key: song.key,
        addedBy: userProfile?.name || 'Guest',
        img: song.img,
        userAvatar: displayAvatar,
        youtubeVideoId: song.youtubeVideoId,
        source: song.source
      };
      
      setQueueList(prev => [...prev, newSong]);
      
      if (activeRoomCode && supabaseConnected) {
        // Await the insert so we get the true database UUID for the track
        const dbItem = await supabaseAddSong(newSong);
        if (dbItem && dbItem.id) {
          // Replace the optimistic temporary ID with the real database ID so selectTrack resolves instantly
          setQueueList(prev => prev.map(q => q.id === newSong.id ? { ...q, id: dbItem.id } : q));
          supabaseUpdateRoom({ current_track_id: dbItem.id, is_playing: true });
        } else {
          // Fallback if dbItem is missing for some reason
          supabaseUpdateRoom({ current_track_id: newSong.id, is_playing: true });
        }
        setAudioElapsedSeconds(0);
        addToast('Track Changed', `Selected: ${newSong.title}`);
      } else {
        setLocalCurrentTrackId(newSong.id);
        setAudioElapsedSeconds(0);
        addToast('Track Changed', `Selected: ${newSong.title}`);
        setLocalIsPlaying(true);
      }
    }
  };

  const handleAddTrackByUrl = async (e) => {
    e.preventDefault();
    if (!songLinkInput.trim()) return;

    const url = songLinkInput.trim();

    if (!isValidYouTubeUrl(url)) {
      addToast('Invalid URL', 'Please provide a valid YouTube link (youtube.com, youtu.be).');
      return;
    }

    try {
      addToast('Processing...', 'Fetching video information from YouTube...');

      const videoId = extractVideoId(url);
      const song = await createSongFromYouTube(videoId, userProfile?.name || 'Guest', displayAvatar);

      if (supabaseConnected) {
        supabaseAddSong(song);
        const existing = queueList.find(q => q.youtubeVideoId && q.youtubeVideoId === song.youtubeVideoId);
        if (existing) {
          voteSong(existing.id, 1);
          addToast('Already Queued', `"${song.title}" vote increased.`);
          setSongLinkInput('');
          return;
        }
        setQueueList(prev => [...prev, song]);
      } else {
        const existing = queueList.find(q => q.youtubeVideoId && q.youtubeVideoId === song.youtubeVideoId);
        if (existing) {
          voteSong(existing.id, 1);
          addToast('Already Queued', `"${song.title}" vote increased.`);
          setSongLinkInput('');
          return;
        }
        setQueueList(prev => [...prev, song]);
      }

      setSongLinkInput('');
      addToast('Added via YouTube', `"${song.title}" by ${song.artist} queued!`);
    } catch (error) {
      console.error('Error adding YouTube video:', error);
      addToast('Error', 'Failed to add video. Please check the URL and try again.');
    }
  };

  const deleteTrack = (id) => {
    // If deleting the currently playing track, skip to next first
    if (currentTrack?.id === id) {
      nextTrack();
    }
    
    if (activeRoomCode && supabaseConnected) {
      supabaseRemoveSong(id);
    } else {
      setQueueList(prev => prev.filter(song => song.id !== id));
    }
    addToast('Track Deleted', 'The song was removed from the queue.');
  };

  const handleSuggestSong = async (song) => {
    if (!activeRoomCode || !supabaseRoom?.id) {
      addToast('Error', 'You must be in a room to suggest songs.');
      return;
    }
    const msg = `[SUGGESTION:${JSON.stringify(song)}]`;
    try {
      await sendMessage({
        roomId: supabaseRoom.id,
        userId: userProfile.id,
        username: userProfile.name || 'Guest',
        avatarUrl: userProfile.avatar_url || null,
        message: msg
      });
      addToast('Suggestion Sent', `Suggested ${song.title} in the chat!`);
      setActiveView('chat');
    } catch (e) {
      console.error(e);
      addToast('Error', 'Failed to send suggestion.');
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const updated = !prev;
      addToast('Shuffle Toggled', updated ? 'Auto-Vibe sorting enabled.' : 'Playing in queue list order.');
      return updated;
    });
  };

  const toggleRepeat = () => {
    setIsRepeat(prev => {
      const updated = !prev;
      addToast('Repeat Toggled', updated ? 'Single track looping armed.' : 'Looping disabled.');
      return updated;
    });
  };

  const triggerHypeMode = () => {
    setHypeModeOn(prev => {
      const updated = !prev;
      if (updated) {
        addToast('HYPE MODE ENGAGED', 'Synthesizers tuned to maximum energy thresholds!', true);
      } else {
        addToast('Hype Mode Disengaged', 'Restored cosmic chill room vibe.', false);
      }
      return updated;
    });
  };

  const copyRoomCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(activeRoomCode || 'NONE');
      addToast('Room Code Copied', `Shared code: "${activeRoomCode}"`);
    }
  };

  const extendDJTime = () => {
    setDjTimerSeconds(prev => prev + 120); // Adds 2 minutes
    addToast('DJ Time Extended', 'Successfully added 2:00 to your master session.', true);
  };

  const requestNewDJ = () => {
    setShowChangeDJModal(true);
  };

  const handleRoleChange = async (profileId, newRole) => {
    if (newRole === 'member' && supabaseRoom?.host_id === profileId) {
      await supabaseUpdateRoom({ host_id: userProfile?.profileId || userProfile?.id });
      addToast('DJ Removed', 'User was removed from the DJ role automatically.', true);
    }
    await handleUpdateMemberRole(profileId, newRole);
  };

  // --- WEBCAM STREAM CONTROLLER ---
  const toggleWebcam = () => {
    if (webcamActive) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
      setWebcamActive(false);
      addToast('Webcam Off', 'Restored retro cosmic fallback environment.');
    } else {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
          .then(stream => {
            webcamStreamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            setWebcamActive(true);
            addToast('Webcam Streaming', 'Casting workspace stream metrics.');
          })
          .catch((err) => {
            console.error('Camera access error:', err);
            addToast('Webcam Blocked', `Error: ${err.message || 'Check camera access permissions.'}`, false);
          });
      } else {
        console.error('navigator.mediaDevices is undefined. Ensure you are on HTTPS or localhost.');
        addToast('Camera Unavailable', 'Camera requires a secure context (HTTPS) or localhost.', false);
      }
    }
  };

  // --- AI HAND TRACKING INITIALIZATION ---
  useEffect(() => {
    const initRecognizer = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        recognizerRef.current = recognizer;
        console.log("AI Gesture Recognizer Armed.");
      } catch (err) {
        console.error("AI Init Failed:", err);
      }
    };
    initRecognizer();
  }, []);

  // Ref keeps simulateGesture fresh inside the rAF loop (avoids stale closure)
  const simulateGestureRef = useRef(null);

  // --- AI GESTURE PREDICTION LOOP ---
  useEffect(() => {
    if (webcamActive && videoRef.current) {
      const predictWebcam = () => {
        if (!videoRef.current || !recognizerRef.current) {
          requestRef.current = requestAnimationFrame(predictWebcam);
          return;
        }
        if (videoRef.current.readyState >= 2) {
          const nowInMs = Date.now();
          let results;
          try { results = recognizerRef.current.recognizeForVideo(videoRef.current, nowInMs); }
          catch (e) { requestRef.current = requestAnimationFrame(predictWebcam); return; }

          if (results.gestures.length > 0) {
            const gestureName = results.gestures[0][0].categoryName;
            const score = results.gestures[0][0].score;
            const COOLDOWN = 1200; // ms between gestures
            if (score > 0.72 && nowInMs - lastGestureTimeRef.current > COOLDOWN) {
              lastGestureTimeRef.current = nowInMs;
              const fn = simulateGestureRef.current;
              if (!fn) { requestRef.current = requestAnimationFrame(predictWebcam); return; }

              // Standard gesture → action mapping
              if      (gestureName === 'Thumb_Up')    fn('swiperight');
              else if (gestureName === 'Thumb_Down')  fn('swipeleft');
              else if (gestureName === 'Closed_Fist') fn('fist');
              else if (gestureName === 'Open_Palm')   fn('palmup');
              else if (gestureName === 'Pointing_Up') fn('palmdown');
              // Victory ✌️ — skip next track, just send 🎉 reaction
              else if (gestureName === 'Victory')     sendReaction('🎉');
              // ILoveYou 🤟 — volume up + ❤️ reaction (palmup already sends 👏 inside fn)
              else if (gestureName === 'ILoveYou') { fn('palmup'); sendReaction('❤️'); }
            }
          }
        }
        requestRef.current = requestAnimationFrame(predictWebcam);
      };
      requestRef.current = requestAnimationFrame(predictWebcam);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [webcamActive]);

  // --- GESTURE SIMULATIONS ---
  // Called by the rAF loop (via simulateGestureRef) and by the DJMode gesture buttons.
  // Emoji reactions are sent here for button-triggered gestures so the same function
  // covers both input paths without duplicating logic.
  const simulateGesture = (type) => {
    initAudioEngine();
    const GESTURE_LABELS = {
      swiperight: '👍 Next Track',
      swipeleft:  '👎 Prev Track',
      fist:       '✊ Play/Pause',
      palmup:     '🖐 Volume Up',
      palmdown:   '☝ Volume Down',
    };
    addToast('Gesture', GESTURE_LABELS[type] || type.toUpperCase());

    if (type === 'swiperight') {
      nextTrack();
      sendReaction('👍'); // Thumb Up → next track + 👍
    }
    else if (type === 'swipeleft') { prevTrack(); }
    else if (type === 'fist')      { togglePlayback(); }
    else if (type === 'palmup') {
      setVolume(prev => {
        const next = Math.min(100, prev + 10);
        if (masterGainRef.current && audioCtxRef.current)
          masterGainRef.current.gain.setValueAtTime(next / 200, audioCtxRef.current.currentTime);
        if (youtubeVolumeRef.current) youtubeVolumeRef.current(next / 100);
        return next;
      });
      sendReaction('👏'); // Open Palm → volume up + 👏
    }
    else if (type === 'palmdown') {
      setVolume(prev => {
        const next = Math.max(0, prev - 10);
        if (masterGainRef.current && audioCtxRef.current)
          masterGainRef.current.gain.setValueAtTime(next / 200, audioCtxRef.current.currentTime);
        if (youtubeVolumeRef.current) youtubeVolumeRef.current(next / 100);
        return next;
      });
    }
  };
  // Keep the ref fresh so the rAF loop always calls the latest closure
  simulateGestureRef.current = simulateGesture;

  // --- SUBMIT ADD SONG MODAL ---
  const handleAddTrackSubmit = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const artist = e.target.artist.value;
    const duration = parseInt(e.target.duration.value);
    const pitch = parseInt(e.target.pitch.value);

    const covers = [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&q=80',
      'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=100&q=80'
    ];

    const newSong = {
      id: Date.now().toString(),
      title,
      artist,
      votes: 1,
      duration,
      pitch,
      bpm: 120,
      key: 'G Min',
      addedBy: userProfile?.name || 'Guest',
      img: covers[Math.floor(Math.random() * covers.length)],
      userAvatar: displayAvatar
    };

    if (supabaseConnected) {
      supabaseAddSong(newSong);
    }

    setQueueList(prev => [...prev, newSong]);
    setShowAddModal(false);
    addToast('Track Appended', `"${title}" has been added to the queue list.`);
  };

  // --- INTERACTIVE SCREEN MOUSE EVENT HANDLERS ---
  const handleInteractiveMouseMove = (e) => {
    if (!interactiveScreenRef.current) return;
    const rect = interactiveScreenRef.current.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    setMouseCoords({ x, y });
    setHasMovedMouse(true);
  };

  const handleInteractiveMouseDown = (e) => {
    if (!interactiveScreenRef.current) return;

    initAudioEngine();
    const tones = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00];
    const selectedTone = tones[Math.floor(Math.random() * tones.length)];
    triggerOscillatorTone(selectedTone, 0.4, 'triangle');
  };

  const seekTimeline = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPct = (e.clientX - rect.left) / rect.width;
    const newSeconds = Math.floor(clickPct * currentTrack.duration);
    setAudioElapsedSeconds(newSeconds);
    // If a YouTube track is playing, also seek the real audio element
    if (currentTrack?.source === 'youtube' && youtubeSeekRef.current) {
      youtubeSeekRef.current(newSeconds);
    } else {
      triggerOscillatorTone(currentTrack.pitch * 1.3, 0.25, 'triangle');
    }

    if (activeRoomCode && syncChannelRef.current) {
      syncChannelRef.current.send({
        type: 'broadcast',
        event: 'sync-data',
        payload: { time: newSeconds }
      });
    }
  };

  // --- COMPONENT LIFECYCLE EFFECTS ---

  useEffect(() => {
    setAudioElapsedSeconds(0);
  }, [currentTrack.id]);

  // Handle Playback Progress & DJ Timer Countdown
  useEffect(() => {
    // For YouTube tracks the real audio element fires onTimeUpdate -> setAudioElapsedSeconds
    // So we do NOT run the fake interval for YouTube tracks
    const isYouTube = currentTrack?.source === 'youtube';

    if (isPlaying && !isYouTube) {
      playbackIntervalRef.current = setInterval(() => {
        setAudioElapsedSeconds(prev => {
          if (prev < currentTrack.duration) {
            return prev + 1;
          } else {
            nextTrack();
            return 0;
          }
        });

        setDjTimerSeconds(prev => {
          if (prev > 0) return prev - 1;
          return 0;
        });
      }, 1000);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, currentTrack, isShuffle]);

  // Handle Web Audio Sequencer arpeggiator
  useEffect(() => {
    // Disable the internal sequencer/synthesizer when playing back a YouTube track
    if (isPlaying && currentTrack?.source !== 'youtube') {
      initAudioEngine();
      sequencerIntervalRef.current = setInterval(() => {
        const basePitch = currentTrack ? currentTrack.pitch : 220;
        const scale = [1, 1.2, 1.5, 1.75, 2.0];
        const notePitch = basePitch * scale[Math.floor(Math.random() * scale.length)];
        triggerOscillatorTone(notePitch, 0.4, 'sine');

        // Spike spectrum bars occasionally
        setSpectrumHeights(prev => prev.map(h => Math.random() < 0.3 ? 32 : h));
      }, 500);
    } else {
      if (sequencerIntervalRef.current) {
        clearInterval(sequencerIntervalRef.current);
      }
    }

    return () => {
      if (sequencerIntervalRef.current) {
        clearInterval(sequencerIntervalRef.current);
      }
    };
  }, [isPlaying, currentTrack?.id]);

  // Handle Spectrum dynamic bounce loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSpectrumHeights(prev =>
        prev.map(() => isPlaying ? Math.floor(Math.random() * 28) + 4 : 4)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Home dashboard waveform animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveformBars(prev =>
        prev.map(() => isPlaying ? Math.floor(Math.random() * 26) + 6 : Math.floor(Math.random() * 4) + 2)
      );
    }, isPlaying ? 180 : 400);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Ensure webcam stops streaming on unmount
  useEffect(() => {
    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Ensure video element stays connected to the stream even after hot-reloads
  useEffect(() => {
    if (webcamActive && videoRef.current && webcamStreamRef.current) {
      if (videoRef.current.srcObject !== webcamStreamRef.current) {
        videoRef.current.srcObject = webcamStreamRef.current;
        videoRef.current.play().catch(() => { });
      }
    }
  });

  // Format Helper: Seconds to MM:SS
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <ClickSpark>
    <div className="h-screen w-screen flex flex-col justify-between overflow-hidden select-none bg-[#030307] text-[#e4e4e7] relative">

      {/* FLOATING EMOJI REACTIONS OVERLAY — pointer-events:none, never blocks interaction */}
      <FloatingReactionContainer reactions={reactions} />
      
      {/* ENTER WORLD OVERLAY */}
      {!hasEntered && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030307] cursor-pointer group transition-opacity duration-1000"
          onClick={() => {
            setHasEntered(true);
            // We NO LONGER auto-unmute here. We wait for explicit "Tap to Unmute" from HUD to bypass mobile autoplay restrictions.
          }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Interactive Play Button */}
            <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
              {/* Ripple Rings */}
              <div className="absolute inset-0 rounded-full border border-violet-500/30 scale-100 group-hover:scale-[1.5] group-hover:opacity-0 transition-all duration-1000 ease-out" />
              <div className="absolute inset-4 rounded-full border border-fuchsia-500/30 scale-100 group-hover:scale-[1.3] group-hover:opacity-0 transition-all duration-700 ease-out delay-75" />
              
              {/* Solid Button */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_0_60px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_100px_rgba(217,70,239,0.8)] group-hover:scale-110 transition-all duration-500 flex items-center justify-center">
                <Play className="w-10 h-10 text-white ml-2 drop-shadow-lg" />
              </div>
            </div>

            {/* Typography */}
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl transition-all duration-700 group-hover:scale-105">
              DJ ROOTS
            </h1>
            <div className="flex items-center gap-4 text-zinc-500 font-bold text-xs tracking-[0.3em] uppercase">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-zinc-600" />
              <span className="group-hover:text-violet-400 transition-colors duration-500">Tap to start</span>
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-zinc-600" />
            </div>
          </div>
        </div>
      )}

      {/* EXPLICIT STYLE INJECTIONS TO PREVENT UNSTYLED PREVIEWS */}
      <link href="https://cdn.tailwindcss.com" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{
        __html: `
        body {
          background-color: #030307 !important;
          color: #e4e4e7 !important;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          margin: 0 !important;
          overflow: hidden !important;
        }
        .hud-font {
          font-family: 'Share Tech Mono', monospace !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        /* Glowing neon shadows and accents */
        .neon-glow-violet {
          box-shadow: 0 0 25px rgba(139, 92, 246, 0.25) !important;
          border-color: rgba(139, 92, 246, 0.4) !important;
        }
        .neon-text-violet {
          text-shadow: 0 0 10px rgba(139, 92, 246, 0.6) !important;
        }
        .neon-text-emerald {
          text-shadow: 0 0 10px rgba(16, 185, 129, 0.6) !important;
        }
      `}} />

      {/* TOP HEADER */}
      <header className="bg-zinc-950/70 backdrop-blur-md border-b border-zinc-900 px-6 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Radio className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-wider text-white uppercase">DJ ROOTS</span>
              <span className="bg-violet-500/10 text-violet-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-violet-500/20">V2.0 LIVE</span>
            </div>
            <p className="text-[10px] text-zinc-500">Crowd Vibes. You Control.</p>
          </div>
        </div>

        {/* Room Stats — only shown when in a room */}
        <div className="hidden md:flex items-center gap-5">
          {activeRoomCode ? (
            <>
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-500 font-semibold tracking-wider uppercase">ROOM CODE</span>
                <div className="flex items-center gap-1.5">
                  <span className="hud-font text-emerald-400 text-xs font-bold tracking-widest">{activeRoomCode}</span>
                  <button onClick={copyRoomCode} className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/40 px-3 py-1 rounded-xl border border-zinc-800/60">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="hud-font text-zinc-300 text-xs font-semibold">{supabaseMembers.length} in Room</span>
              </div>
            </>
          ) : (
            <span className="text-[10px] text-zinc-600 font-semibold italic">No active room — Join or Create one</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors border border-zinc-800/50 hover:border-zinc-700 bg-zinc-900/30 px-2.5 py-1.5 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Sign Out</span>
          </button>

          <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xs font-bold text-white">{userProfile?.name || authDisplayName}</span>
                <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1 rounded font-bold uppercase border border-emerald-500/15">SUPER DJ</span>
            </div>
            <img src={displayAvatar} alt="Avatar" className="w-8 h-8 rounded-lg object-cover ring-2 ring-violet-500/20" />
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE WRAPPER */}
      <div className="flex-1 flex flex-row gap-4 p-4 min-h-0 w-full overflow-hidden">



        {/* SLEEK LEFT SIDEBAR */}
        <aside className="w-60 bg-zinc-950/40 backdrop-blur-xl border border-zinc-900/80 p-3.5 rounded-2xl flex flex-col flex-shrink-0 min-h-0 overflow-y-auto no-scrollbar">
          <div className="flex flex-col min-h-full">
            <div className="space-y-4 mb-4">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2">Navigation</span>

              <nav className="flex flex-col gap-1">
                <button onClick={showHomeView} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left w-full ${activeView === 'home' ? 'bg-violet-600/10 text-violet-400 border-violet-500/20' : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50'}`}>
                  <Home className={`w-4 h-4 ${activeView === 'home' ? 'text-violet-400' : ''}`} /> Home
                </button>
                <button onClick={() => { setActiveView('queue'); addToast('Queue', 'Navigating to song queue.'); }} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left w-full ${activeView === 'queue' ? 'bg-violet-600/10 text-violet-400 border-violet-500/20' : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50'}`}>
                  <ListMusic className={`w-4 h-4 ${activeView === 'queue' ? 'text-violet-400' : ''}`} /> Queue
                </button>
                <button onClick={showAddSongView} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left w-full ${activeView === 'add-song' ? 'bg-violet-600/10 text-violet-400 border-violet-500/20' : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50'}`}>
                  <PlusCircle className={`w-4 h-4 ${activeView === 'add-song' ? 'text-violet-400' : ''}`} /> Add Song
                </button>
                {isHost && (
                  <button onClick={showDjModeView} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left w-full ${activeView === 'dj' ? 'bg-violet-600/10 text-violet-400 border-violet-500/20' : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50'}`}>
                    <span className="flex items-center gap-3">
                      <Activity className={`w-4 h-4 ${activeView === 'dj' ? 'text-violet-400' : ''}`} /> DJ Mode
                    </span>
                    <span className="bg-violet-500/20 text-violet-400 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">LIVE</span>
                  </button>
                )}
                <button disabled={!activeRoomCode} onClick={() => { setActiveView('people'); addToast('People', 'Displaying current audience members.'); }} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left w-full disabled:opacity-50 disabled:cursor-not-allowed ${activeView === 'people' ? 'bg-violet-600/10 text-violet-400 border-violet-500/20' : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50'}`}>
                  <Users className={`w-4 h-4 ${activeView === 'people' ? 'text-violet-400' : ''}`} /> People
                </button>
                <button disabled={!activeRoomCode} onClick={() => { setActiveView('chat'); }} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left w-full disabled:opacity-50 disabled:cursor-not-allowed ${activeView === 'chat' ? 'bg-violet-600/10 text-violet-400 border-violet-500/20' : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50'}`}>
                  <span style={{fontSize:'1rem', lineHeight:1}}>💬</span>
                  <span>Live Chat</span>
                </button>

              </nav>

              {/* Thin Hype Mode Card */}
              <div onClick={triggerHypeMode} className="bg-gradient-to-br from-indigo-950/20 to-violet-950/15 border border-violet-900/30 p-3.5 rounded-xl cursor-pointer hover:border-violet-500/40 transition-all group relative overflow-hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
                      <Zap className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Hype Mode</h4>
                      <p className="text-[9px] text-zinc-400">Raise hands to spark!</p>
                    </div>
                  </div>
                  <div className={`w-7 h-3.5 rounded-full bg-zinc-800 relative transition-colors duration-300 ${hypeModeOn ? 'bg-violet-600' : ''}`}>
                    <div className={`w-2.5 h-2.5 rounded-full bg-zinc-500 absolute top-0.5 transition-all ${hypeModeOn ? 'left-[14px] bg-white' : 'left-0.5'}`} />
                  </div>
                </div>
              </div>

              {/* Offline Connect Widget (Sidebar) */}
              {!activeRoomCode && (
                <div className="bg-zinc-900/40 border border-violet-900/30 p-3 rounded-xl mt-4">
                  {!connectMode ? (
                    <div className="space-y-2">
                      <button onClick={() => setConnectMode('join')} className="w-full bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all">
                        Join Room
                      </button>
                      <button onClick={() => setConnectMode('create')} className="w-full bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 py-2 rounded-lg text-zinc-300 text-[10px] font-bold uppercase tracking-wider transition-all">
                        Create Room
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={connectMode === 'create' ? executeCreateRoom : executeJoinRoom} className="flex flex-col gap-2">
                      <input type="text" value={connectName} onChange={e => setConnectName(e.target.value)} placeholder="DJ Name" className="bg-[#08080f] border border-zinc-800 rounded-md px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-violet-500/60 w-full" />
                      {connectMode === 'join' && (
                        <input type="text" value={connectRoomCode} onChange={e => setConnectRoomCode(e.target.value.toUpperCase())} placeholder="Code" className="bg-[#08080f] border border-zinc-800 rounded-md px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-violet-500/60 w-full uppercase" />
                      )}
                      {connectMode === 'create' && (
                        <label className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1 mb-1 cursor-pointer">
                          <input type="checkbox" checked={connectIsPublic} onChange={e => setConnectIsPublic(e.target.checked)} className="rounded border-zinc-700 bg-[#08080f] text-violet-600 focus:ring-violet-500/30" />
                          Make room public
                        </label>
                      )}
                      {connectError && <div className="text-[9px] text-red-400">{connectError}</div>}
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setConnectMode(null)} className="flex-1 text-[9px] text-zinc-500 hover:text-white uppercase font-bold tracking-wider">Back</button>
                        <button type="submit" disabled={connectLoading} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider disabled:opacity-50">
                          {connectMode === 'join' ? 'Join' : 'Start'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Public Rooms List */}
              {!activeRoomCode && (
                <div className="bg-zinc-900/40 border border-violet-900/30 p-3 rounded-xl mt-4 space-y-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Live Public Rooms</span>
                  {publicRooms.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {publicRooms.map(r => (
                        <div key={r.id} className="flex items-center justify-between bg-[#08080f] border border-zinc-800 p-2 rounded-lg group hover:border-violet-500/50 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={r.host?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&q=80'} alt="DJ Avatar" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-white truncate">{r.name}</p>
                              <p className="text-[9px] text-zinc-500 truncate">{r.host?.name || 'DJ'} • {r.memberCount} members</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setConnectName(authDisplayName || '');
                              setConnectRoomCode(r.code);
                              setConnectMode('join');
                            }} 
                            className="bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                          >
                            Join
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-[#08080f] border border-zinc-800 rounded-lg">
                      <p className="text-[10px] text-zinc-500">No public rooms yet.</p>
                      <p className="text-[9px] text-zinc-600 mt-1">Start a room to broadcast here!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-auto space-y-3">
              {/* Current DJ Summary - Only show if activeRoomCode exists */}
              {activeRoomCode && (
                <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-xl space-y-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Current DJ</span>
                  <div className="flex items-center gap-2.5">
                    <img src={displayAvatar} alt="Avatar" className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-white">{userProfile?.name || 'Guest'}</span>
                        <Crown className="w-3 h-3 text-amber-400" />
                      </div>
                    </div>
                  </div>
                  {isHost && (
                    <div className="flex gap-1 mt-1">
                      <button onClick={requestNewDJ} className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[9px] font-bold py-1.5 rounded-lg text-zinc-300 transition-all">
                        Change
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Leave Room - Only show if activeRoomCode exists */}
              {activeRoomCode && (
                <button
                  onClick={handleLeaveRoom}
                  className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 text-red-400 text-[9px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Leave Room
                </button>
              )}
            </div>
          </div>
        </aside >

        {/* HomeSection is ALWAYS mounted so the <audio> element persists across navigation.
             We toggle display:flex/none instead of unmounting to keep the music alive. */}
        <div style={{
          display: activeView === 'home' ? 'flex' : 'none',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}>
          <HomeSection
            currentTrack={currentTrack}
            audioElapsedSeconds={audioElapsedSeconds}
            formatTime={formatTime}
            volume={volume}
            adjustVolume={adjustVolume}
            waveformBars={waveformBars}
            isPlaying={isPlaying}
            isMuted={isMuted}
            isShuffle={isShuffle}
            isRepeat={isRepeat}
            toggleShuffle={toggleShuffle}
            toggleRepeat={toggleRepeat}
            prevTrack={prevTrack}
            nextTrack={nextTrack}
            togglePlayback={togglePlayback}
            sortedAndFilteredQueue={sortedAndFilteredQueue}
            searchFilterText={searchFilterText}
            setSearchFilterText={setSearchFilterText}
            selectTrack={selectTrack}
            voteSong={voteSong}
            queueList={queueList}
            setShowAddModal={setShowAddModal}
            copyRoomCode={copyRoomCode}
            djTimerSeconds={djTimerSeconds}
            setActiveView={setActiveView}
            activeRoomCode={activeRoomCode}
            onJoinRoom={handleJoinRoom}
            authDisplayName={authDisplayName}
            onTimeUpdate={(t) => setAudioElapsedSeconds(t)}
            onRegisterSeek={(fn) => { youtubeSeekRef.current = fn; }}
            onRegisterVolume={(fn) => { youtubeVolumeRef.current = fn; }}
            isHost={isHost}
            roomId={supabaseRoom?.id || null}
            userProfile={userProfile}
            canControlPlayback={canControlPlayback}
            onAddSong={addSongFromPool}
            onPlaySong={playSongFromPool}
          />
        </div>

        {
          activeView === 'add-song' ? (
            <AddSongSection
              activeAddTab={activeAddTab}
              setActiveAddTab={setActiveAddTab}
              searchFilterText={searchFilterText}
              setSearchFilterText={setSearchFilterText}
              filteredTrending={filteredTrending}
              searchResults={searchResults}
              isSearching={isSearching}
              addSongFromPool={addSongFromPool}
              playSongFromPool={playSongFromPool}
              onSuggestSong={handleSuggestSong}
              songLinkInput={songLinkInput}
              setSongLinkInput={setSongLinkInput}
              handleAddTrackByUrl={handleAddTrackByUrl}
              isLoadingYutubeUrl={isLoadingYutubeUrl}
              addToast={addToast}
              currentTrack={currentTrack}
              waveformBars={waveformBars}
              isPlaying={isPlaying}
              audioElapsedSeconds={audioElapsedSeconds}
              formatTime={formatTime}
              upNextList={upNextList}
              skipUpvotes={skipUpvotes}
              setSkipUpvotes={setSkipUpvotes}
              skipDownvotes={skipDownvotes}
              setSkipDownvotes={setSkipDownvotes}
              skipThreshold={skipThreshold}
              recentlyPlayed={recentlyPlayed}
            />
          ) : null
        }

        {
          activeView === 'dj' ? (
            <DJModeSection
              interactiveScreenRef={interactiveScreenRef}
              videoRef={videoRef}
              webcamActive={webcamActive}
              toggleWebcam={toggleWebcam}
              simulateGesture={simulateGesture}
              handleInteractiveMouseMove={handleInteractiveMouseMove}
              handleInteractiveMouseDown={handleInteractiveMouseDown}
              hypeModeOn={hypeModeOn}
              spectrumHeights={spectrumHeights}
              hasMovedMouse={hasMovedMouse}
              mouseCoords={mouseCoords}
              sortedAndFilteredQueue={sortedAndFilteredQueue}
              currentTrack={currentTrack}
              selectTrack={selectTrack}
              voteSong={voteSong}
              searchFilterText={searchFilterText}
              setSearchFilterText={setSearchFilterText}
              setActiveView={setActiveView}
              queueList={queueList}
              toggleShuffle={toggleShuffle}
              activeRoomCode={activeRoomCode}
            />
          ) : null
        }

        {
          activeView === 'queue' ? (
            <QueueSection
              sortedAndFilteredQueue={sortedAndFilteredQueue}
              searchFilterText={searchFilterText}
              setSearchFilterText={setSearchFilterText}
              voteSong={voteSong}
              queueList={queueList}
              setQueueList={setQueueList}
              currentTrack={currentTrack}
              audioElapsedSeconds={audioElapsedSeconds}
              formatTime={formatTime}
              waveformBars={waveformBars}
              isPlaying={isPlaying}
              skipUpvotes={skipUpvotes}
              skipDownvotes={skipDownvotes}
              skipThreshold={skipThreshold}
              setActiveView={setActiveView}
              toggleShuffle={toggleShuffle}
              activeRoomCode={activeRoomCode}
              isHost={isHost}
              selectTrack={selectTrack}
              deleteTrack={deleteTrack}
            />
          ) : null
        }

        {
          activeView === 'people' ? (
            <PeopleSection
              currentTrack={currentTrack}
              audioElapsedSeconds={audioElapsedSeconds}
              formatTime={formatTime}
              waveformBars={waveformBars}
              sortedAndFilteredQueue={sortedAndFilteredQueue}
              setActiveView={setActiveView}
              copyRoomCode={copyRoomCode}
              addToast={addToast}
              isPlaying={isPlaying}
              roomCode={activeRoomCode}
              members={supabaseMembers}
              isHost={isHost}
              onUpdateRole={handleRoleChange}
            />
          ) : null
        }

        {/* LiveChat is persistently mounted so the realtime subscription and scroll
             position survive tab switches. We toggle visibility via display. */}
        <div style={{
          display: activeView === 'chat' ? 'flex' : 'none',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}>
          <LiveChat
            roomId={supabaseRoom?.id || null}
            userProfile={userProfile}
            canControlPlayback={canControlPlayback}
            onAddSong={addSongFromPool}
            onPlaySong={playSongFromPool}
          />
        </div>

      </div >

      {/* TIMELINE CONTROL FOOTER */}
      < footer className="bg-zinc-950 border-t border-zinc-900 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-20" >
        <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
          <div className="relative group w-11 h-11 rounded-lg overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md flex-shrink-0 flex items-center justify-center border border-violet-500/10">
            {currentTrack.img ? (
              <img src={currentTrack.img} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            ) : null}
            <div className="absolute inset-0 bg-black/30"></div>
            <Music className="w-4.5 h-4.5 text-white animate-pulse relative z-10" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate max-w-[180px]">{currentTrack.title}</span>
            <span className="text-[10px] text-zinc-500 truncate max-w-[180px]">{currentTrack.artist}</span>
          </div>
        </div>

        {/* Center Timeline Playback sliders */}
        <div className="flex flex-col items-center gap-2 w-full md:max-w-[450px]">
          {canControlPlayback ? (
            <div className="flex items-center gap-4.5">
              <button onClick={toggleShuffle} className={`p-1 transition-all ${isShuffle ? 'text-violet-400' : 'text-zinc-500 hover:text-white'}`}>
                <Shuffle className="w-3.5 h-3.5" />
              </button>
              <button onClick={prevTrack} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 rounded-lg text-zinc-300 hover:text-white transition-all">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlayback}
                className={`p-3 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center ${isPlaying ? 'bg-emerald-500 text-black shadow-emerald-500/10' : 'bg-violet-600 text-white shadow-violet-600/10'}`}
              >
                {isPlaying ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current" />}
              </button>
              <button onClick={nextTrack} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 rounded-lg text-zinc-300 hover:text-white transition-all">
                <SkipForward className="w-4 h-4" />
              </button>
              <button onClick={toggleRepeat} className={`p-1 transition-all ${isRepeat ? 'text-violet-400' : 'text-zinc-500 hover:text-white'}`}>
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest bg-violet-500/10 px-4 py-2 rounded-full border border-violet-500/20">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Listening to DJ</span>
            </div>
          )}

          {/* Custom Track progress bar */}
          <div className="flex items-center gap-3 w-full text-[10px]">
            <span className="hud-font text-zinc-500">{formatTime(audioElapsedSeconds)}</span>
            <div
              onClick={canControlPlayback ? seekTimeline : undefined}
              className={`flex-1 h-1 bg-zinc-900 rounded-full ${canControlPlayback ? 'cursor-pointer' : 'cursor-default'} relative border border-zinc-800/40`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full"
                style={{ width: `${(audioElapsedSeconds / currentTrack.duration) * 100}%` }}
              />
            </div>
            <span className="hud-font text-zinc-500">{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Volume Control + Reaction Bar */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0 pr-2 w-full">
          {/* Emoji Reactions — compact toggle in the footer */}
          <ReactionBar onSend={sendReaction} compact />

          {isMuted && (
            <button
              onClick={() => setIsMuted(false)}
              className="px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              Enter DJ
            </button>
          )}
          <button
             onClick={() => setIsMuted(!isMuted)}
             className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
             title={isMuted ? "Unmute" : "Mute"}
          >
             {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => {
              if (isMuted) setIsMuted(false);
              adjustVolume(e.target.value);
            }}
            className="w-24 accent-violet-500"
          />
        </div>
      </footer >

      {/* CUSTOM ADD SONG MODAL */}
      < div className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${showAddModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add Custom DJ Track</h3>
            <button onClick={() => setShowAddModal(false)} className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddTrackSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[9px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Track Title</label>
              <input name="title" type="text" placeholder="e.g. Save Your Tears" required className="w-full bg-zinc-900 border border-zinc-850 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none placeholder-zinc-500" />
            </div>
            <div>
              <label className="block text-[9px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Artist Name</label>
              <input name="artist" type="text" placeholder="e.g. The Weeknd" required className="w-full bg-zinc-900 border border-zinc-850 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none placeholder-zinc-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Duration (s)</label>
                <input name="duration" type="number" min="30" max="600" defaultValue="180" required className="w-full bg-zinc-900 border border-zinc-850 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Pitch (Hz)</label>
                <input name="pitch" type="number" min="100" max="800" defaultValue="260" required className="w-full bg-zinc-900 border border-zinc-850 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
              </div>
            </div>

            <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-md">
              Add to Queue List
            </button>
          </form>
        </div>
      </div >

      {/* CHANGE DJ MODAL */}
      {showChangeDJModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl relative z-50">
            <h3 className="text-white font-black uppercase tracking-wider mb-2">Change DJ</h3>
            <p className="text-zinc-400 text-xs mb-4">Select a CO Host to take over as DJ.</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {(supabaseMembers || []).filter(m => m.role === 'CO Host' && m.profileId !== userProfile?.id && m.profileId !== userProfile?.profileId).map(member => {
                const isThisMemberDJ = member.profileId === supabaseRoom?.host_id;
                return (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 transition-all">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt="Avatar" className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs font-bold text-white">{member.name}</div>
                        <div className="text-[10px] text-zinc-500">{member.role}</div>
                      </div>
                    </div>
                    {isThisMemberDJ ? (
                      <button 
                        onClick={() => {
                          supabaseUpdateRoom({ host_id: userProfile?.profileId || userProfile?.id });
                          addToast('DJ Removed', `${member.name} is no longer the DJ.`, true);
                          setShowChangeDJModal(false);
                        }}
                        className="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        Remove DJ
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          supabaseUpdateRoom({ host_id: member.profileId });
                          addToast('DJ Changed', `${member.name} is now the DJ.`, true);
                          setShowChangeDJModal(false);
                        }}
                        className="bg-violet-600/20 text-violet-400 hover:bg-violet-600 hover:text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        Make DJ
                      </button>
                    )}
                  </div>
                );
              })}
              {(supabaseMembers || []).filter(m => m.role === 'CO Host' && m.profileId !== userProfile?.id && m.profileId !== userProfile?.profileId).length === 0 && (
                <div className="text-center text-zinc-500 text-xs py-4">No CO Hosts available. Assign a CO Host from the People list first.</div>
              )}
            </div>
            <button onClick={() => setShowChangeDJModal(false)} className="mt-4 w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM ALERTS */}
      < div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 pointer-events-none" >
        {
          toasts.map(toast => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 bg-zinc-950 border p-3 rounded-xl shadow-xl max-w-xs pointer-events-auto transform transition-all duration-350 ${toast.isSuccess ? 'border-violet-500/30' : 'border-zinc-800'
                }`}
            >
              <div className="p-1 rounded bg-violet-500/10 text-violet-400">
                {toast.isSuccess ? <Info className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">{toast.title}</h4>
                <p className="text-[9px] text-zinc-400 truncate mt-0.5">{toast.desc}</p>
              </div>
            </div>
          ))
        }
      </div >
    </div >
    </ClickSpark>
  );
}
