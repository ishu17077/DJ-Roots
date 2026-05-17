import React, { useState, useEffect } from 'react';
import YouTubeAudioPlayer from './YouTubeAudioPlayer.jsx';
import {
    Activity,
    Music,
    Clock,
    MoreVertical
} from './icons.jsx';
<<<<<<< Updated upstream
import { getYouTubeStreamUrl } from '../lib/youtubeStreamService.js';
=======
import ElectricBorder from './ElectricBorder.jsx';
>>>>>>> Stashed changes

export default function HomeSection({
    currentTrack,
    audioElapsedSeconds,
    formatTime,
    waveformBars,
    isPlaying,
    activeRoomCode,
    onJoinRoom,
    authDisplayName
}) {
    const [streamUrl, setStreamUrl] = useState(null);
    const [streamLoading, setStreamLoading] = useState(false);
    const [streamError, setStreamError] = useState(null);

    // Fetch stream URL when YouTube track changes
    useEffect(() => {
        if (currentTrack?.source === 'youtube' && currentTrack?.youtubeVideoId) {
            setStreamLoading(true);
            setStreamError(null);
            setStreamUrl(null);

            getYouTubeStreamUrl(currentTrack.youtubeVideoId)
                .then(data => {
                    setStreamUrl(data.url);
                    setStreamLoading(false);
                })
                .catch(err => {
                    console.error('Stream error:', err);
                    setStreamError(err.message);
                    setStreamLoading(false);
                });
        } else {
            setStreamUrl(null);
            setStreamError(null);
        }
    }, [currentTrack?.youtubeVideoId, currentTrack?.source]);

    return (
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative rounded-3xl border border-zinc-800/50 shadow-2xl">
            {/* Full blur background matching the image */}
            <div className="absolute inset-0 bg-zinc-950 z-0" />
            <div
                className="absolute inset-0 opacity-40 blur-[100px] saturate-200 transition-all duration-1000 mix-blend-screen scale-110"
                style={{ backgroundImage: `url(${currentTrack?.img || ''})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
            />

<<<<<<< Updated upstream
            <section className="relative z-10 flex flex-col p-6 lg:p-10 h-full">
                {/* Top Header inside the main view to match "DJ ROOTS" and right icons */}
                <div className="flex items-center justify-between w-full mb-4 lg:mb-8 shrink-0 relative z-20">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center">
                            <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-fuchsia-500" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white font-black text-lg lg:text-xl tracking-widest leading-none mb-0.5">DJ ROOTS</h1>
                            <p className="text-zinc-500 text-[8px] lg:text-[9px] uppercase tracking-widest font-bold">Crowd Vibes. You Control.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 lg:gap-6">
                        <button className="text-fuchsia-500 hover:text-fuchsia-400 transition-colors drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 lg:w-6 lg:h-6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        </button>
                        <button className="text-zinc-500 hover:text-white transition-colors">
                            <MoreVertical className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>
                    </div>
                </div>
=======
          {/* Content split */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-between w-full min-h-0 relative gap-8 lg:gap-16 z-10">
              
              {/* Left Side: Vinyl */}
              <div className="w-full lg:w-1/2 flex items-center justify-center relative h-full min-h-0 shrink-1">
                 {/* Responsive vinyl sizing container */}
                 <div className="relative flex items-center justify-center w-[clamp(250px,50vh,460px)] h-[clamp(250px,50vh,460px)] shrink-0">
                     <ElectricBorder color="#d946ef" speed={1.5} chaos={0.12} style={{ borderRadius: '9999px' }} className="w-full h-full">
                         {/* Neon Glow behind vinyl */}
                         <div className="absolute inset-0 bg-fuchsia-600/30 blur-[60px] lg:blur-[80px] rounded-full pointer-events-none scale-90"></div>
                         
                         <div className={`relative w-full h-full rounded-full bg-[radial-gradient(circle,_#1a1a1a_0%,_#000000_100%)] flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.8)] ring-1 ring-white/5 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                            {/* Vinyl Grooves with metallic reflection */}
                            <div className="absolute inset-[2%] border border-white/5 rounded-full"></div>
                            <div className="absolute inset-[6%] border border-white/5 rounded-full"></div>
                            <div className="absolute inset-[12%] border border-white/10 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"></div>
                            <div className="absolute inset-[18%] border border-white/5 rounded-full"></div>
                            <div className="absolute inset-[26%] border border-white/10 rounded-full"></div>
                            <div className="absolute inset-[32%] border border-white/5 rounded-full"></div>
                            
                            {/* Lighting / Specular highlights on vinyl */}
                            <div className="absolute inset-0 rounded-full shadow-[inset_30px_-20px_60px_rgba(217,70,239,0.3)] mix-blend-screen pointer-events-none"></div>
                            <div className="absolute inset-0 rounded-full shadow-[inset_-20px_30px_50px_rgba(255,255,255,0.05)] mix-blend-screen pointer-events-none"></div>

                            {/* Center Label */}
                            <div className="relative w-[34%] h-[34%] bg-[#080214] rounded-full z-10 flex flex-col items-center justify-center border border-fuchsia-900/40 shadow-[0_0_30px_rgba(0,0,0,1)]">
                                <Activity className="w-[30%] h-[30%] text-fuchsia-400 mb-[2%] drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                                <span className="text-white text-[clamp(8px,1.2vw,12px)] font-black tracking-widest mt-[2%]">DJ ROOTS</span>
                                <span className="text-zinc-500 text-[clamp(4px,0.6vw,6px)] uppercase tracking-widest mt-[2%] font-bold">Crowd Vibes. You Control.</span>
                                
                                {/* Spindle hole */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[6%] h-[6%] bg-zinc-950 rounded-full border border-black shadow-[inset_0_2px_4px_rgba(0,0,0,1)] ring-1 ring-white/10"></div>
                            </div>
                         </div>
                     </ElectricBorder>
                 </div>
              </div>
>>>>>>> Stashed changes

                {/* Content split */}
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-between w-full min-h-0 relative gap-8 lg:gap-16 z-10">

                    {/* Left Side: YouTube Audio Player or Vinyl */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center relative h-full min-h-0 shrink-1">
                        {currentTrack?.source === 'youtube' && currentTrack?.youtubeVideoId ? (
                            <div className="w-full px-6 max-w-lg">
                                <YouTubeAudioPlayer
                                    videoId={currentTrack.youtubeVideoId}
                                    title={currentTrack.title}
                                    streamUrl={streamUrl}
                                    duration={currentTrack.duration}
                                    isPlaying={isPlaying}
                                    showControls={true}
                                />
                            </div>
                        ) : (
                            <>
                                {/* Responsive vinyl sizing container */}
                                <div className="relative flex items-center justify-center w-[clamp(250px,50vh,460px)] h-[clamp(250px,50vh,460px)] shrink-0">
                                    {/* Neon Glow behind vinyl */}
                                    <div className="absolute inset-0 bg-fuchsia-600/30 blur-[60px] lg:blur-[80px] rounded-full pointer-events-none scale-90"></div>

                                    <div className={`relative w-full h-full rounded-full bg-[radial-gradient(circle,_#1a1a1a_0%,_#000000_100%)] flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.8)] ring-1 ring-white/5 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                                        {/* Vinyl Grooves with metallic reflection */}
                                        <div className="absolute inset-[2%] border border-white/5 rounded-full"></div>
                                        <div className="absolute inset-[6%] border border-white/5 rounded-full"></div>
                                        <div className="absolute inset-[12%] border border-white/10 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"></div>
                                        <div className="absolute inset-[18%] border border-white/5 rounded-full"></div>
                                        <div className="absolute inset-[26%] border border-white/10 rounded-full"></div>
                                        <div className="absolute inset-[32%] border border-white/5 rounded-full"></div>

                                        {/* Lighting / Specular highlights on vinyl */}
                                        <div className="absolute inset-0 rounded-full shadow-[inset_30px_-20px_60px_rgba(217,70,239,0.3)] mix-blend-screen pointer-events-none"></div>
                                        <div className="absolute inset-0 rounded-full shadow-[inset_-20px_30px_50px_rgba(255,255,255,0.05)] mix-blend-screen pointer-events-none"></div>

                                        {/* Center Label */}
                                        <div className="relative w-[34%] h-[34%] bg-[#080214] rounded-full z-10 flex flex-col items-center justify-center border border-fuchsia-900/40 shadow-[0_0_30px_rgba(0,0,0,1)]">
                                            <Activity className="w-[30%] h-[30%] text-fuchsia-400 mb-[2%] drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                                            <span className="text-white text-[clamp(8px,1.2vw,12px)] font-black tracking-widest mt-[2%]">DJ ROOTS</span>
                                            <span className="text-zinc-500 text-[clamp(4px,0.6vw,6px)] uppercase tracking-widest mt-[2%] font-bold">Crowd Vibes. You Control.</span>

                                            {/* Spindle hole */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[6%] h-[6%] bg-zinc-950 rounded-full border border-black shadow-[inset_0_2px_4px_rgba(0,0,0,1)] ring-1 ring-white/10"></div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Side: Info */}
                    <div className="w-full lg:w-1/2 flex flex-col items-start max-w-[600px] shrink-0 z-10 pl-0 lg:pl-8">

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-950/40 mb-2 lg:mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(217,70,239,0.15)] w-max shrink-0">
                            <div className="flex items-end gap-[2px] h-3">
                                <span className={`w-[2px] bg-fuchsia-400 rounded-full ${isPlaying ? 'animate-[bounce_0.8s_ease-in-out_infinite]' : ''}`} style={{ height: '6px' }}></span>
                                <span className={`w-[2px] bg-fuchsia-400 rounded-full ${isPlaying ? 'animate-[bounce_1.2s_ease-in-out_infinite]' : ''}`} style={{ height: '10px' }}></span>
                                <span className={`w-[2px] bg-fuchsia-400 rounded-full ${isPlaying ? 'animate-[bounce_0.9s_ease-in-out_infinite]' : ''}`} style={{ height: '8px' }}></span>
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

                        {/* Detailed Waveform (Acts as progress timeline) */}
                        <div className="w-full h-10 lg:h-16 flex items-center justify-between gap-1 mb-2 lg:mb-5 mt-2 opacity-90 overflow-hidden shrink-0">
                            {Array.from({ length: 80 }).map((_, i) => {
                                const percent = i / 80;
                                const isPassed = percent <= ((audioElapsedSeconds || 0) / currentTrack.duration);

                                // Create a realistic static waveform footprint unique to each song
                                const seed = (currentTrack.title.length * i) + i;
                                const staticH = 12 + Math.abs(Math.sin(seed * 0.4) * 16) + Math.cos(seed * 0.1) * 8;

                                // When playing, add the live audio dancing heights from App.jsx
                                const dancingH = waveformBars && waveformBars[i % waveformBars.length] ? waveformBars[i % waveformBars.length] : 0;
                                const barHeight = isPlaying ? Math.max(4, staticH + (dancingH * 0.8)) : Math.max(4, staticH);

                                return (
                                    <div
                                        key={i}
                                        className={`w-[2px] lg:w-[3px] rounded-full transition-all duration-300 ${isPassed ? 'bg-gradient-to-t from-fuchsia-600 via-fuchsia-400 to-rose-300 shadow-[0_0_8px_rgba(217,70,239,0.5)]' : 'bg-white/10'}`}
                                        style={{ height: `${barHeight}px`, maxHeight: '100%' }}
                                    />
                                )
                            })}
                        </div>


                    </div>
                </div>
            </section>
        </main>
    );
}
