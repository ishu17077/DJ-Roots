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
  isPlaying = false,
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
  const progressInterval = useRef(null);
  
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

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
          playsinline: 1
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
              onPlay();
              startProgressInterval();
            } else if (event.data === YT.PlayerState.PAUSED) {
              onPause();
              stopProgressInterval();
            } else if (event.data === YT.PlayerState.ENDED) {
              onEnded();
              stopProgressInterval();
            } else if (event.data === YT.PlayerState.BUFFERING) {
              setIsLoading(true);
            }
          },
          onError: (event) => {
            console.error('YouTube Player Error:', event.data);
            setError('Failed to load track from YouTube.');
            onError(event.data);
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

  // Sync videoId
  useEffect(() => {
    if (playerRef.current && isReady && playerRef.current.loadVideoById) {
      setIsLoading(true);
      setError(null);
      playerRef.current.loadVideoById(videoId);
      if (!isPlaying) {
        playerRef.current.pauseVideo();
      }
    }
  }, [videoId, isReady]); // isPlaying is handled below

  // Sync play/pause state
  useEffect(() => {
    if (playerRef.current && isReady) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isReady]);

  // Expose Seek Function
  useEffect(() => {
    onRegisterSeek((seconds) => {
      if (playerRef.current && isReady && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      }
    });
    return () => onRegisterSeek(null);
  }, [onRegisterSeek, isReady]);

  // Expose Volume Function
  useEffect(() => {
    onRegisterVolume((vol) => {
      const newVol = Math.max(0, Math.min(100, vol * 100));
      if (playerRef.current && isReady && typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(newVol);
      }
    });
    return () => onRegisterVolume(null);
  }, [onRegisterVolume, isReady]);

  // Interval for Time updates
  function startProgressInterval() {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate(time);
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
    if (playerRef.current && isReady) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current && isReady) {
      playerRef.current.setVolume(newVolume * 100);
      if (newVolume > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
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

  return (
    <div className="w-full space-y-3 relative">
      {/* Invisible YouTube Player */}
      <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
        <div ref={containerRef} />
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
