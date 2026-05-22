import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from './icons.jsx';

/**
 * YouTube Audio Player Component
 * Uses the official YouTube IFrame API instead of a backend proxy.
 * This guarantees max audio quality, zero proxy buffering, and perfect syncing.
 */
export default function YouTubeAudioPlayer({
  videoId,
  title,
  duration,
  streamUrl,
  isPlaying = false,
  isMuted = false,
  onMuteChange = () => { },
  onPlay = () => { },
  onPause = () => { },
  onTimeUpdate = () => { },
  onEnded = () => { },
  onError = () => { },
  onRegisterSeek = () => { },
  onRegisterVolume = () => { },
  showControls = true,
}) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const fallbackAudioRef = useRef(null);
  const progressInterval = useRef(null);
  
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(1);
  const [useFallback, setUseFallback] = useState(false);

  // Use refs for callbacks to avoid stale closures in YT player events
  const callbacksRef = useRef({ onPlay, onPause, onEnded, onError, onTimeUpdate });
  const isPlayingRef = useRef(isPlaying);
  
  useEffect(() => {
    callbacksRef.current = { onPlay, onPause, onEnded, onError, onTimeUpdate };
  }, [onPlay, onPause, onEnded, onError, onTimeUpdate]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize YouTube IFrame API
  useEffect(() => {
    const initPlayer = () => {
      if (!containerRef.current) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
          mute: 1
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            setIsLoading(false);
            event.target.setVolume(volume * 100);
            if (isPlaying) event.target.playVideo();
          },
          onStateChange: (event) => {
            const YT = window.YT;
            if (event.data === YT.PlayerState.PLAYING) {
              setIsLoading(false);
              callbacksRef.current.onPlay();
              startProgressInterval();
            } else if (event.data === YT.PlayerState.PAUSED) {
              callbacksRef.current.onPause();
              stopProgressInterval();
            } else if (event.data === YT.PlayerState.ENDED) {
              callbacksRef.current.onEnded();
              stopProgressInterval();
            } else if (event.data === YT.PlayerState.BUFFERING) {
              setIsLoading(true);
            }
          },
          onError: (event) => {
            console.error('YouTube Player Error:', event.data);
            // If error is 101 or 150 (embed restricted), fallback to proxy
            if (event.data === 101 || event.data === 150 || event.data === 2) {
              setUseFallback(true);
            } else {
              setError('Failed to load track from YouTube.');
              callbacksRef.current.onError(event.data);
            }
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    }

    return () => {
      stopProgressInterval();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- BACKGROUND TAB KEEP-ALIVE (TWO-PRONGED APPROACH) ---
  //
  // PROBLEM: Chrome throttles setInterval/setTimeout in minimized/background tabs,
  // so a normal watchdog becomes useless. YouTube also pauses embedded videos in hidden tabs.
  //
  // SOLUTION 1 — Web Worker heartbeat:
  //   Web Workers run in a separate thread that Chrome does NOT throttle.
  //   The worker sends a 'ping' every 1s. The main thread receives it and
  //   force-plays the YouTube player if it has been unexpectedly paused.
  //
  // SOLUTION 2 — Silent audio loop:
  //   Playing a 1-second silent audio clip on repeat registers this tab as an
  //   "active audio tab" with the browser. Chrome will not aggressively throttle
  //   or background-pause active audio tabs.
  const workerRef = useRef(null);
  const silentAudioRef = useRef(null);

  useEffect(() => {
    // --- Silent audio loop ---
    // A minimal 1-second silent WAV encoded as a data URI
    const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    const silentAudio = new Audio(SILENT_WAV);
    silentAudio.loop = true;
    silentAudio.volume = 0.001; // Essentially silent but browser counts it as active audio
    silentAudioRef.current = silentAudio;

    // Start silent audio the first time user interacts (required by browser autoplay policy)
    const startSilentAudio = () => {
      silentAudio.play().catch(() => {}); // Ignore errors — will retry on next interaction
      document.removeEventListener('click', startSilentAudio);
      document.removeEventListener('keydown', startSilentAudio);
    };
    document.addEventListener('click', startSilentAudio, { once: true });
    document.addEventListener('keydown', startSilentAudio, { once: true });

    // --- Web Worker heartbeat ---
    try {
      const workerBlob = new Blob([
        `let iv=null;
         self.onmessage=(e)=>{
           if(e.data==='start'){if(iv)return;iv=setInterval(()=>self.postMessage('ping'),1000);}
           else if(e.data==='stop'){clearInterval(iv);iv=null;}
         };`
      ], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(workerBlob));

      worker.onmessage = () => {
        // This runs every 1s, even in background/minimized tabs!
        if (
          isPlayingRef.current &&
          playerRef.current &&
          typeof playerRef.current.getPlayerState === 'function'
        ) {
          const state = playerRef.current.getPlayerState();
          // PlayerState: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
          if (state === 2) {
            // Paused but should be playing — YouTube background-throttled us. Force resume!
            playerRef.current.playVideo();
          }
        }
      };

      worker.postMessage('start');
      workerRef.current = worker;
    } catch (err) {
      console.warn('[KeepAlive] Web Worker failed, falling back to visibilitychange only:', err);
    }

    // --- Visibility change fallback ---
    // Also resume immediately when user switches back to tab
    const handleVisibilityChange = () => {
      if (
        !document.hidden &&
        isPlayingRef.current &&
        playerRef.current &&
        typeof playerRef.current.getPlayerState === 'function'
      ) {
        const state = playerRef.current.getPlayerState();
        if (state === 2 || state === 5 || state === -1) {
          playerRef.current.playVideo();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Cleanup
      if (workerRef.current) {
        workerRef.current.postMessage('stop');
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
        silentAudioRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  // Sync videoId
  useEffect(() => {
    setUseFallback(false);
    setError(null);
    if (playerRef.current && isReady && playerRef.current.loadVideoById) {
      setIsLoading(true);
      playerRef.current.loadVideoById(videoId);
      if (!isPlaying) {
        playerRef.current.pauseVideo();
      }
    }
  }, [videoId, isReady]);

  // Sync play/pause state
  useEffect(() => {
    if (useFallback) {
      if (fallbackAudioRef.current) {
        if (isPlaying) {
          fallbackAudioRef.current.play().catch(e => console.error('Fallback play error:', e));
        } else {
          fallbackAudioRef.current.pause();
        }
      }
      return;
    }
    
    if (playerRef.current && isReady) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isReady, useFallback]);

  // Expose Seek Function
  useEffect(() => {
    onRegisterSeek((seconds) => {
      if (useFallback && fallbackAudioRef.current) {
        fallbackAudioRef.current.currentTime = seconds;
        setCurrentTime(seconds);
      } else if (playerRef.current && isReady && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      }
    });
    return () => onRegisterSeek(null);
  }, [onRegisterSeek, isReady, useFallback]);

  // Expose Volume Function
  useEffect(() => {
    onRegisterVolume((vol) => {
      const newVol = Math.max(0, Math.min(100, vol * 100));
      if (useFallback && fallbackAudioRef.current) {
        fallbackAudioRef.current.volume = Math.max(0, Math.min(1, vol));
      } else if (playerRef.current && isReady && typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(newVol);
      }
    });
    return () => onRegisterVolume(null);
  }, [onRegisterVolume, isReady, useFallback]);

  // Sync mute state with prop
  useEffect(() => {
    if (useFallback) {
      if (fallbackAudioRef.current) {
        fallbackAudioRef.current.muted = isMuted;
      }
      return;
    }
    
    if (playerRef.current && isReady) {
      if (isMuted) {
        if (typeof playerRef.current.mute === 'function') playerRef.current.mute();
      } else {
        if (typeof playerRef.current.unMute === 'function') playerRef.current.unMute();
      }
    }
  }, [isMuted, isReady, useFallback]);

  // Interval for Time updates (IFrame)
  function startProgressInterval() {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        callbacksRef.current.onTimeUpdate(time);
      }
    }, 250);
  }

  function stopProgressInterval() {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }

  // Local Controls
  const toggleMute = () => {
    onMuteChange(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current && isReady) {
      playerRef.current.setVolume(newVolume * 100);
      if (newVolume > 0 && isMuted) {
        onMuteChange(false);
      }
    }
  };

  const handleProgressClick = (e) => {
    if (!duration || !playerRef.current || !isReady) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showControls) {
    return (
      <div className="fixed top-0 left-0 w-[200px] h-[200px] opacity-[0.01] pointer-events-none z-[-1]">
        <div ref={containerRef} />
        {useFallback && streamUrl && (
          <audio
            ref={fallbackAudioRef}
            src={streamUrl}
            onPlay={callbacksRef.current.onPlay}
            onPause={callbacksRef.current.onPause}
            onEnded={callbacksRef.current.onEnded}
            onTimeUpdate={(e) => callbacksRef.current.onTimeUpdate(e.target.currentTime)}
            onError={(e) => {
              console.error("Fallback audio error:", e);
              callbacksRef.current.onError(e);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 relative">
      {/* Invisible YouTube Player */}
      <div className="fixed top-0 left-0 w-[200px] h-[200px] opacity-[0.01] pointer-events-none z-[-1]">
        <div ref={containerRef} />
        {useFallback && streamUrl && (
          <audio
            ref={fallbackAudioRef}
            src={streamUrl}
            onPlay={callbacksRef.current.onPlay}
            onPause={callbacksRef.current.onPause}
            onEnded={callbacksRef.current.onEnded}
            onTimeUpdate={(e) => callbacksRef.current.onTimeUpdate(e.target.currentTime)}
            onError={(e) => callbacksRef.current.onError(e)}
          />
        )}
      </div>

      {error ? (
        <div className="w-full aspect-video bg-zinc-900 border border-red-500/30 rounded-lg flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-400 text-sm font-semibold mb-2">Audio Stream Error</p>
            <p className="text-zinc-400 text-xs">{error}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 border border-zinc-800/60 rounded-lg p-4 backdrop-blur">
          {/* Title */}
          <h4 className="text-xs font-bold text-white truncate mb-3">{title || 'Playing...'}</h4>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-zinc-400">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-1 bg-zinc-800 rounded-full cursor-pointer group hover:h-1.5 transition-all"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="float-right h-full w-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1" />
              </div>
            </div>
            <span className="text-[10px] text-zinc-400">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          {showControls && (
            <div className="flex items-center justify-between">
              {/* Play/Pause Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (playerRef.current && isReady) {
                      if (isPlaying) {
                        playerRef.current.pauseVideo();
                      } else {
                        playerRef.current.playVideo();
                      }
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors text-white"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isLoading ? (
                    <div className="animate-spin">
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full" />
                    </div>
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Volume Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-zinc-400 hover:text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-zinc-800 rounded-full cursor-pointer accent-violet-500"
                  title="Volume"
                />
              </div>
            </div>
          )}

          {/* Status */}
          <div className="text-[9px] text-zinc-500 mt-2">
            ✓ Official High-Quality Audio {isPlaying ? '• Playing' : isLoading ? '• Loading...' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
