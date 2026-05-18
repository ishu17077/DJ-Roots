import React, { useState } from 'react';
import YouTubeAudioPlayer from './YouTubeAudioPlayer.jsx';
import {
    Activity,
    Music,
    Clock,
} from './icons.jsx';

export default function HomeSection({
    currentTrack,
    audioElapsedSeconds,
    formatTime,
    waveformBars,
    isPlaying,
    isMuted,
    activeRoomCode,
    onJoinRoom,
    authDisplayName,
    onTimeUpdate = () => {},
    onRegisterSeek = () => {},
    onRegisterVolume = () => {},
}) {
    // Point directly at the backend proxy — it streams audio through itself to avoid CORS
    const BACKEND = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
    const streamUrl = (currentTrack?.source === 'youtube' && currentTrack?.youtubeVideoId)
        ? `${BACKEND}/api/youtube/stream/${currentTrack.youtubeVideoId}`
        : null;

    return (
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative rounded-3xl border border-zinc-800/50 shadow-2xl">
            {/* Full blur background */}
            <div className="absolute inset-0 bg-zinc-950 z-0" />
            <div
                className="absolute inset-0 opacity-40 blur-[100px] saturate-200 transition-all duration-1000 mix-blend-screen scale-110"
                style={{ backgroundImage: `url(${currentTrack?.img || ''})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
            />

            {/* Hidden audio engine — keeps playing across navigation */}
            {streamUrl && (
                <div style={{ position: 'absolute', visibility: 'hidden', height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <YouTubeAudioPlayer
                        videoId={currentTrack.youtubeVideoId}
                        title={currentTrack.title}
                        streamUrl={streamUrl}
                        duration={currentTrack.duration}
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        showControls={false}
                        onTimeUpdate={onTimeUpdate}
                        onRegisterSeek={onRegisterSeek}
                        onRegisterVolume={onRegisterVolume}
                    />
                </div>
            )}

            {/* Content split */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-between w-full min-h-0 relative gap-8 lg:gap-16 z-10">

                {/* Left Side: Vinyl CD — always visible */}
                <div className="w-full lg:w-1/2 flex items-center justify-center relative h-full min-h-0 shrink-1">
                    <div className="relative flex items-center justify-center w-[clamp(250px,50vh,460px)] h-[clamp(250px,50vh,460px)] shrink-0">
                        {/* Neon glow behind vinyl */}
                        <div
                            className="absolute inset-0 blur-[70px] rounded-full pointer-events-none scale-90 transition-opacity duration-700"
                            style={{
                                background: currentTrack?.img
                                    ? `radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)`
                                    : 'radial-gradient(circle, rgba(217,70,239,0.3) 0%, transparent 70%)',
                                opacity: isPlaying ? 1 : 0.5
                            }}
                        />

                        {/* Vinyl disc — spins when playing */}
                        <div
                            className="relative w-full h-full rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.9)] ring-1 ring-white/5"
                            style={{
                                background: 'radial-gradient(circle, #1a1a1a 0%, #000000 100%)',
                                animation: isPlaying ? 'spin 6s linear infinite' : 'none',
                            }}
                        >
                            {/* Vinyl grooves */}
                            <div className="absolute inset-[2%]  border border-white/[0.04] rounded-full" />
                            <div className="absolute inset-[6%]  border border-white/[0.04] rounded-full" />
                            <div className="absolute inset-[11%] border border-white/[0.07] rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" />
                            <div className="absolute inset-[17%] border border-white/[0.04] rounded-full" />
                            <div className="absolute inset-[23%] border border-white/[0.07] rounded-full" />
                            <div className="absolute inset-[29%] border border-white/[0.04] rounded-full" />
                            <div className="absolute inset-[34%] border border-white/[0.07] rounded-full" />

                            {/* Specular highlight / shimmer */}
                            <div className="absolute inset-0 rounded-full pointer-events-none"
                                style={{ boxShadow: 'inset 30px -20px 60px rgba(217,70,239,0.25), inset -20px 30px 50px rgba(255,255,255,0.04)', mixBlendMode: 'screen' }}
                            />

                            {/* Center label: album art if available, DJ ROOTS logo otherwise */}
                            <div className="relative w-[35%] h-[35%] rounded-full z-10 flex flex-col items-center justify-center overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,1)]">
                                {currentTrack?.img ? (
                                    <>
                                        <img
                                            src={currentTrack.img}
                                            alt="Album Art"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        {/* Subtle overlay so center hole reads */}
                                        <div className="absolute inset-0 bg-black/20 rounded-full" />
                                    </>
                                ) : (
                                    <div className="absolute inset-0 bg-[#080214] rounded-full flex flex-col items-center justify-center">
                                        <Activity className="w-[30%] h-[30%] text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                                        <span className="text-white text-[clamp(7px,1vw,11px)] font-black tracking-widest mt-[4%]">DJ ROOTS</span>
                                    </div>
                                )}
                                {/* Spindle hole — always on top */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10%] h-[10%] bg-zinc-950 rounded-full border border-black shadow-[inset_0_2px_4px_rgba(0,0,0,1)] ring-1 ring-white/10 z-20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Info */}
                <div className="w-full lg:w-1/2 flex flex-col items-start max-w-[600px] shrink-0 z-10 pl-0 lg:pl-8">

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-950/40 mb-2 lg:mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(217,70,239,0.15)] w-max shrink-0">
                        <div className="flex items-end gap-[2px] h-3">
                            <span className={`w-[2px] bg-fuchsia-400 rounded-full ${isPlaying ? 'animate-[bounce_0.8s_ease-in-out_infinite]' : ''}`} style={{ height: '6px' }} />
                            <span className={`w-[2px] bg-fuchsia-400 rounded-full ${isPlaying ? 'animate-[bounce_1.2s_ease-in-out_infinite]' : ''}`} style={{ height: '10px' }} />
                            <span className={`w-[2px] bg-fuchsia-400 rounded-full ${isPlaying ? 'animate-[bounce_0.9s_ease-in-out_infinite]' : ''}`} style={{ height: '8px' }} />
                        </div>
                        <span className="text-[9px] lg:text-[10px] text-fuchsia-100 font-bold tracking-widest uppercase">{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
                    </div>

                    {/* Title & Artist */}
                    <h2 className="text-[clamp(2.5rem,5.5vw,5.5rem)] font-black text-white tracking-tight mb-1 lg:mb-2 leading-[1.05] drop-shadow-2xl w-full line-clamp-2 shrink-0">{currentTrack.title}</h2>
                    <h3 className="text-[clamp(1.25rem,2.5vw,2.25rem)] text-zinc-400 font-medium tracking-wide mb-2 lg:mb-8 shrink-0 truncate w-full">{currentTrack.artist}</h3>

                    {/* Stats Badges */}
                    <div className="flex flex-wrap items-center gap-3 lg:gap-4 mb-4 lg:mb-10 w-full shrink-0">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10">
                            <Activity className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-fuchsia-400" />
                            <span className="text-[10px] lg:text-xs text-zinc-300 font-bold tracking-wider">{currentTrack.bpm || '128'} BPM</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10">
                            <Music className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-fuchsia-400" />
                            <span className="text-[10px] lg:text-xs text-zinc-300 font-bold tracking-wider">{currentTrack.key || 'E Minor'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10">
                            <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-fuchsia-400" />
                            <span className="text-[10px] lg:text-xs text-zinc-300 font-bold tracking-wider">{formatTime(currentTrack.duration)}</span>
                        </div>
                    </div>

                    {/* Waveform progress */}
                    <div className="w-full h-10 lg:h-16 flex items-center justify-between gap-1 mb-2 lg:mb-5 mt-2 opacity-90 overflow-hidden shrink-0">
                        {Array.from({ length: 80 }).map((_, i) => {
                            const percent = i / 80;
                            const isPassed = percent <= ((audioElapsedSeconds || 0) / currentTrack.duration);
                            const seed = (currentTrack.title.length * i) + i;
                            const staticH = 12 + Math.abs(Math.sin(seed * 0.4) * 16) + Math.cos(seed * 0.1) * 8;
                            const dancingH = waveformBars && waveformBars[i % waveformBars.length] ? waveformBars[i % waveformBars.length] : 0;
                            const barHeight = isPlaying ? Math.max(4, staticH + (dancingH * 0.8)) : Math.max(4, staticH);
                            return (
                                <div
                                    key={i}
                                    className={`w-[2px] lg:w-[3px] rounded-full transition-all duration-300 ${isPassed ? 'bg-gradient-to-t from-fuchsia-600 via-fuchsia-400 to-rose-300 shadow-[0_0_8px_rgba(217,70,239,0.5)]' : 'bg-white/10'}`}
                                    style={{ height: `${barHeight}px`, maxHeight: '100%' }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}
