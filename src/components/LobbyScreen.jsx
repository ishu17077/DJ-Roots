import { useState } from 'react';
import { createRoom, joinRoomByCode } from '../lib/supabaseService.js';

export default function LobbyScreen({ onJoinRoom }) {
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await createRoom(name.trim());
      if (result) {
        onJoinRoom(result.room.code, result.profile);
      } else {
        setError('Failed to create room. Check your connection.');
      }
    } catch (err) {
      setError('Connection error. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!roomCode.trim()) { setError('Please enter a room code'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await joinRoomByCode(roomCode.trim(), name.trim());
      if (result) {
        onJoinRoom(result.room.code, result.profile);
      } else {
        setError('Room not found. Check the code and try again.');
      }
    } catch (err) {
      setError('Connection error. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden bg-[#030307] text-[#e4e4e7] relative">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(217,70,239,0.06)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#1e1e2f 1px, transparent 1px), linear-gradient(90deg, #1e1e2f 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-600/5 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-fuchsia-600/5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-white tracking-tight">DJ ROOTS</h1>
              <p className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">Crowd Vibes. You Control.</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-zinc-950/60 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">

          {/* Mode Selector (initial state) */}
          {mode === null && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white text-center mb-6">Get Started</h2>

              <button
                onClick={() => setMode('create')}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:300%_300%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
                <span className="relative flex items-center justify-center gap-3 text-sm tracking-wider uppercase">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Create a Room
                </span>
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-zinc-800"></div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-800"></div>
              </div>

              <button
                onClick={() => setMode('join')}
                className="w-full bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-700/50 hover:border-violet-500/30 text-white font-bold py-4 rounded-2xl transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-3 text-sm tracking-wider uppercase">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Join a Room
                </span>
              </button>
            </div>
          )}

          {/* Create Room Form */}
          {mode === 'create' && (
            <form onSubmit={handleCreate} className="space-y-5">
              <button
                type="button"
                onClick={() => { setMode(null); setError(''); }}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors mb-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="15 18 9 12 15 6" /></svg>
                Back
              </button>

              <h2 className="text-lg font-bold text-white">Create a New Room</h2>
              <p className="text-xs text-zinc-400">Start a DJ session. A unique room code will be generated for your guests.</p>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav"
                  autoFocus
                  className="w-full bg-[#08080f] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/60 placeholder-zinc-600 transition-all"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creating...
                  </span>
                ) : 'Create Room'}
              </button>
            </form>
          )}

          {/* Join Room Form */}
          {mode === 'join' && (
            <form onSubmit={handleJoin} className="space-y-5">
              <button
                type="button"
                onClick={() => { setMode(null); setError(''); }}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors mb-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="15 18 9 12 15 6" /></svg>
                Back
              </button>

              <h2 className="text-lg font-bold text-white">Join a Room</h2>
              <p className="text-xs text-zinc-400">Enter the 6-character room code shared by the host.</p>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Riya"
                  autoFocus
                  className="w-full bg-[#08080f] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/60 placeholder-zinc-600 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ROOTS26"
                  maxLength={6}
                  className="w-full bg-[#08080f] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/60 placeholder-zinc-600 transition-all tracking-[0.3em] text-center font-bold uppercase hud-font"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Joining...
                  </span>
                ) : 'Join Room'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-zinc-600 mt-6 tracking-wider">
          Built with ❤️ by DJ Roots · Real-time powered by Supabase
        </p>
      </div>

      {/* CSS for shimmer effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: -300% 0; }
          100% { background-position: 300% 0; }
        }
      `}} />
    </div>
  );
}
