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
import { useSupabaseRoom } from './lib/useSupabaseRoom.js';
import { supabase } from './lib/supabase.js';
import { createRoom, joinRoomByCode } from './lib/supabaseService.js';
import { isValidYouTubeUrl, createSongFromYouTube, extractVideoId } from './lib/youtubeService.js';

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
const Info = (p) => <Icon name="Info" {...p} />;
const AlertCircle = (p) => <Icon name="AlertCircle" {...p} />;

const TRENDING_POOL = [
  { id: 't1', title: 'Blinding Lights', artist: 'The Weeknd', duration: 201, bpm: 120, key: 'F Min', pitch: 293, img: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120&q=80' },
  { id: 't2', title: 'Die For You', artist: 'The Weeknd', duration: 234, bpm: 134, key: 'C# Min', pitch: 220, img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80' },
  { id: 't3', title: 'Levitating', artist: 'Dua Lipa', duration: 203, bpm: 103, key: 'F# Maj', pitch: 330, img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&q=80' },
  { id: 't4', title: 'Flowers', artist: 'Miley Cyrus', duration: 200, bpm: 118, key: 'A Min', pitch: 261, img: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=120&q=80' },
  { id: 't5', title: 'Calm Down', artist: 'Rema', duration: 239, bpm: 107, key: 'B Maj', pitch: 311, img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=120&q=80' }
];

// Hardcoded fallback data for offline mode
const FALLBACK_QUEUE = [
  { id: '1', title: 'Die For You', artist: 'The Weeknd', votes: 24, duration: 234, pitch: 220, bpm: 134, key: 'C# Min', addedBy: 'Kabir', img: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120&q=80', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80' },
  { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', votes: 18, duration: 200, pitch: 293, bpm: 128, key: 'E Min', addedBy: 'Riya', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80' },
  { id: '3', title: 'Levitating', artist: 'Dua Lipa', votes: 10, duration: 203, pitch: 330, bpm: 103, key: 'F# Maj', addedBy: 'Meera', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&q=80', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80' },
  { id: '4', title: 'Heat Waves', artist: 'Glass Animals', votes: -2, duration: 235, pitch: 180, bpm: 81, key: 'B Maj', addedBy: 'Rohan', img: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=120&q=80', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80' },
  { id: '5', title: 'Save Your Tears', artist: 'The Weeknd', votes: -5, duration: 215, pitch: 261, bpm: 118, key: 'G Maj', addedBy: 'Aman', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&q=80', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80' },
  { id: '6', title: 'Peaches', artist: 'Justin Bieber', votes: -8, duration: 198, pitch: 311, bpm: 90, key: 'C Maj', addedBy: 'Ishita', img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=120&q=80', userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80' }
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
  return <DJRootsApp authUser={authUser} authDisplayName={authDisplayName} onLogout={handleLogout} />;
}

function DJRootsApp({ authUser, authDisplayName, onLogout }) {
  // --- ROOM STATE (persisted to localStorage) ---
  const [activeRoomCode, setActiveRoomCode] = useState(() => {
    try { return localStorage.getItem('djroots_room_code') || null; } catch { return null; }
  });
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('djroots_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleJoinRoom = (code, profile) => {
    setActiveRoomCode(code);
    setUserProfile(profile);
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
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState('');

  const executeCreateRoom = async (e) => {
    e.preventDefault();
    if (!connectName.trim()) { setConnectError('Please enter your name'); return; }
    setConnectLoading(true); setConnectError('');
    try {
      const result = await createRoom(connectName.trim());
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
    setUserProfile(null);
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
  } = useSupabaseRoom(activeRoomCode, userProfile);

  // --- STATE ---
  const [activeView, setActiveView] = useState('home');
  const [activeAddTab, setActiveAddTab] = useState('search');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [audioElapsedSeconds, setAudioElapsedSeconds] = useState(0);
  const [searchFilterText, setSearchFilterText] = useState('');
  const [webcamActive, setWebcamActive] = useState(false);
  const [hypeModeOn, setHypeModeOn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [djTimerSeconds, setDjTimerSeconds] = useState(300);
  const [volume, setVolume] = useState(75);
  const [waveformBars, setWaveformBars] = useState(new Array(45).fill(12));
  const [songLinkInput, setSongLinkInput] = useState('');
  const [isLoadingYutubeUrl, setIsLoadingYutubeUrl] = useState(false);
  const [skipUpvotes, setSkipUpvotes] = useState(8);
  const [skipDownvotes, setSkipDownvotes] = useState(3);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [hasMovedMouse, setHasMovedMouse] = useState(false);
  const [spectrumHeights, setSpectrumHeights] = useState(new Array(38).fill(4));
  const skipThreshold = 15;

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

  // Track the user's local votes: { [song_id]: 1 | -1 }
  const [userVotes, setUserVotes] = useState({});

  const [offlineQueue, setOfflineQueue] = useState(() => [TRENDING_POOL[0], TRENDING_POOL[1]]);

  // --- Derived queue state (real data from Supabase, or local offline fallback) ---
  const queueList = activeRoomCode ? supabaseQueue : offlineQueue;
  const setQueueList = activeRoomCode ? setSupabaseQueue : setOfflineQueue;

  // --- DERIVED MEMO STATES ---
  const currentTrack = useMemo(() => {
    return queueList[currentTrackIndex] || { title: 'Unknown', artist: 'Unknown', duration: 180, pitch: 220, bpm: 120, key: 'G Min', img: '', userAvatar: '' };
  }, [queueList, currentTrackIndex]);

  const sortedAndFilteredQueue = useMemo(() => {
    const sorted = [...queueList].sort((a, b) => b.votes - a.votes);
    return sorted.filter(song =>
      song.title.toLowerCase().includes(searchFilterText.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchFilterText.toLowerCase())
    );
  }, [queueList, searchFilterText]);

  const upNextList = useMemo(() => {
    return [...queueList].sort((a, b) => b.votes - a.votes).filter(song => song.id !== currentTrack.id).slice(0, 3);
  }, [queueList, currentTrack.id]);

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
    initAudioEngine();
    setIsPlaying(prev => !prev);
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
  };

  const selectTrack = (id) => {
    const targetIdx = queueList.findIndex(t => t.id === id);
    if (targetIdx !== -1) {
      setCurrentTrackIndex(targetIdx);
      setAudioElapsedSeconds(0);
      addToast('Track Changed', `Selected: ${queueList[targetIdx].title}`);
    }
  };

  const prevTrack = () => {
    let target = currentTrackIndex - 1;
    if (target < 0) target = queueList.length - 1;
    selectTrack(queueList[target].id);
  };

  const nextTrack = () => {
    if (isShuffle) {
      const target = Math.floor(Math.random() * queueList.length);
      selectTrack(queueList[target].id);
      return;
    }
    let target = currentTrackIndex + 1;
    if (target >= queueList.length) target = 0;
    selectTrack(queueList[target].id);
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
      supabaseVote(id, delta);
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
      userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&q=80'
    };

    setQueueList(prev => [...prev, newSong]);
    addToast('Track Queued', `"${song.title}" added to the active crowd list.`);
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
      const song = await createSongFromYouTube(videoId, userProfile?.name || 'Guest');

      if (supabaseConnected) {
        supabaseAddSong(song);
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
    addToast('DJ Rotation Triggered', 'Requesting next candidate in hierarchy hierarchy.', true);
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
          .catch(() => {
            addToast('Webcam Blocked', 'Please check camera access permissions.', false);
          });
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
          numHands: 1
        });
        recognizerRef.current = recognizer;
        console.log("AI Gesture Recognizer Armed.");
      } catch (err) {
        console.error("AI Init Failed:", err);
      }
    };
    initRecognizer();
  }, []);

  // --- AI GESTURE PREDICTION LOOP ---
  useEffect(() => {
    if (webcamActive && videoRef.current) {
      const predictWebcam = () => {
        if (!videoRef.current || !recognizerRef.current) return;

        if (videoRef.current.readyState >= 2) {
          const nowInMs = Date.now();
          const results = recognizerRef.current.recognizeForVideo(videoRef.current, nowInMs);

          if (results.gestures.length > 0) {
            const gestureName = results.gestures[0][0].categoryName;
            const score = results.gestures[0][0].score;

            if (score > 0.6 && nowInMs - lastGestureTimeRef.current > 1500) {
              if (gestureName === 'Closed_Fist') {
                simulateGesture('fist');
                lastGestureTimeRef.current = nowInMs;
              } else if (gestureName === 'Open_Palm') {
                simulateGesture('palmup');
                lastGestureTimeRef.current = nowInMs;
              } else if (gestureName === 'Thumb_Up') {
                simulateGesture('swiperight');
                lastGestureTimeRef.current = nowInMs;
              } else if (gestureName === 'Thumb_Down') {
                simulateGesture('swipeleft');
                lastGestureTimeRef.current = nowInMs;
              } else if (gestureName === 'Pointing_Up') {
                simulateGesture('palmdown');
                lastGestureTimeRef.current = nowInMs;
              }
            }
          }
        }
        requestRef.current = requestAnimationFrame(predictWebcam);
      };
      requestRef.current = requestAnimationFrame(predictWebcam);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [webcamActive]);

  // --- GESTURE SIMULATIONS ---
  const simulateGesture = (type) => {
    initAudioEngine();
    addToast('Gesture Captured', `AI HUD detected tracking signature: ${type.toUpperCase()}`);

    if (type === 'swiperight') {
      nextTrack();
    } else if (type === 'swipeleft') {
      prevTrack();
    } else if (type === 'fist') {
      togglePlayback();
    } else if (type === 'palmup') {
      if (masterGainRef.current && audioCtxRef.current) {
        const currentVol = masterGainRef.current.gain.value;
        masterGainRef.current.gain.setValueAtTime(Math.min(1.0, currentVol + 0.1), audioCtxRef.current.currentTime);
      }
    } else if (type === 'palmdown') {
      if (masterGainRef.current && audioCtxRef.current) {
        const currentVol = masterGainRef.current.gain.value;
        masterGainRef.current.gain.setValueAtTime(Math.max(0.05, currentVol - 0.1), audioCtxRef.current.currentTime);
      }
    }
  };

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
      userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&q=80'
    };

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
  };

  // --- COMPONENT LIFECYCLE EFFECTS ---

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
  }, [isPlaying, currentTrackIndex]);

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
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-between overflow-hidden select-none bg-[#030307] text-[#e4e4e7]">
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

        {/* Room Stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 font-semibold tracking-wider uppercase">ROOM CODE</span>
            <div className="flex items-center gap-1.5">
              <span id="room-code-txt" className="hud-font text-emerald-400 text-xs font-bold tracking-widest">{activeRoomCode || 'OFFLINE'}</span>
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
            <span className="hud-font text-zinc-300 text-xs font-semibold">{supabaseMembers.length} People in Room</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 font-semibold tracking-wider uppercase mb-0.5">VIBE METER</span>
            <div className="flex items-center gap-1.5">
              <span className="hud-font text-violet-400 text-xs font-bold uppercase tracking-wider">{hypeModeOn ? 'OVERDRIVE' : 'HIGH'}</span>
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-1 bg-violet-500 h-1.5 rounded-full"></div>
                <div className={`w-1 bg-violet-500 h-2.5 rounded-full ${isPlaying ? 'animate-bounce' : ''}`}></div>
                <div className="w-1 bg-violet-500 h-2 rounded-full"></div>
                <div className={`w-1 bg-violet-500 h-3 rounded-full ${isPlaying ? 'animate-bounce delay-75' : ''}`}></div>
              </div>
            </div>
          </div>
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
            <img src={userProfile?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80'} alt="Avatar" className="w-8 h-8 rounded-lg object-cover ring-2 ring-violet-500/20" />
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
                <button onClick={showDjModeView} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left w-full ${activeView === 'dj' ? 'bg-violet-600/10 text-violet-400 border-violet-500/20' : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50'}`}>
                  <span className="flex items-center gap-3">
                    <Activity className={`w-4 h-4 ${activeView === 'dj' ? 'text-violet-400' : ''}`} /> DJ Mode
                  </span>
                  <span className="bg-violet-500/20 text-violet-400 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">LIVE</span>
                </button>
                <button disabled={!activeRoomCode} onClick={() => { setActiveView('people'); addToast('People', 'Displaying current audience members.'); }} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left w-full disabled:opacity-50 disabled:cursor-not-allowed ${activeView === 'people' ? 'bg-violet-600/10 text-violet-400 border-violet-500/20' : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50'}`}>
                  <Users className={`w-4 h-4 ${activeView === 'people' ? 'text-violet-400' : ''}`} /> People
                </button>
                <button onClick={() => { setActiveView('settings'); addToast('Settings', 'Opening room properties.'); }} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left w-full ${activeView === 'settings' ? 'bg-violet-600/10 text-violet-400 border-violet-500/20' : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50'}`}>
                  <Settings className={`w-4 h-4 ${activeView === 'settings' ? 'text-violet-400' : ''}`} /> Settings
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
            </div>

            <div className="mt-auto space-y-3">
              {/* Current DJ Summary - Only show if activeRoomCode exists */}
              {activeRoomCode && (
                <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-xl space-y-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Current DJ</span>
                  <div className="flex items-center gap-2.5">
                    <img src={userProfile?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80'} alt="Avatar" className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-white">{userProfile?.name || 'Guest'}</span>
                        <Crown className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="hud-font text-violet-400 text-xs font-bold">
                        {formatTime(djTimerSeconds)} <span className="text-[9px] text-zinc-500">Left</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={extendDJTime} className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[9px] font-bold py-1.5 rounded-lg text-zinc-300 transition-all">
                      Extend
                    </button>
                    <button onClick={requestNewDJ} className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[9px] font-bold py-1.5 rounded-lg text-zinc-300 transition-all">
                      Change
                    </button>
                  </div>
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
            onTimeUpdate={(t) => setAudioElapsedSeconds(Math.floor(t))}
            onRegisterSeek={(fn) => { youtubeSeekRef.current = fn; }}
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
              addSongFromPool={addSongFromPool}
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
              setShowAddModal={setShowAddModal}
              queueList={queueList}
              toggleShuffle={toggleShuffle}
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
              setShowAddModal={setShowAddModal}
              toggleShuffle={toggleShuffle}
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
            />
          ) : null
        }

        {
          activeView === 'settings' ? (
            <SettingsSection />
          ) : null
        }

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

          {/* Custom Track progress bar */}
          <div className="flex items-center gap-3 w-full text-[10px]">
            <span className="hud-font text-zinc-500">{formatTime(audioElapsedSeconds)}</span>
            <div
              onClick={seekTimeline}
              className="flex-1 h-1 bg-zinc-900 rounded-full cursor-pointer relative border border-zinc-800/40"
            >
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full"
                style={{ width: `${(audioElapsedSeconds / currentTrack.duration) * 100}%` }}
              />
            </div>
            <span className="hud-font text-zinc-500">{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0 pr-2 w-full">
          <Volume2 className="w-4 h-4 text-zinc-500" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => adjustVolume(e.target.value)}
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
  );
}
