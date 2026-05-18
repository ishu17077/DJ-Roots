import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from './icons.jsx';

/**
 * YouTube Audio Player Component
 * Uses HTML5 audio element to play extracted YouTube audio streams
 * Supports playback control, volume, and progress tracking
 */
export default function YouTubeAudioPlayer({
  videoId,
  title,
  streamUrl,
  duration,
  isPlaying = false,
  isMuted = false,
  onPlay = () => { },
  onPause = () => { },
  onTimeUpdate = () => { },
  onEnded = () => { },
  onError = () => { },
  onRegisterSeek = () => { },
  onRegisterVolume = () => { },
  autoplay = false,
  showControls = true,
}) {
  const audioRef = useRef(null);
  const retryCountRef = useRef(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(1);
  const [blobUrl, setBlobUrl] = useState(null);
  const [isBlobFallback, setIsBlobFallback] = useState(false);

  // Reset retry counter and error state when a new stream URL arrives
  useEffect(() => {
    retryCountRef.current = 0;
    setError(null);
    setBlobUrl(null);
    setIsBlobFallback(false);
  }, [streamUrl]);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Register seek function so parent (App.jsx) can seek the real audio element
  useEffect(() => {
    onRegisterSeek((seconds) => {
      if (audioRef.current) {
        audioRef.current.currentTime = seconds;
      }
    });
    // Cleanup: unregister on unmount
    return () => onRegisterSeek(null);
  }, [onRegisterSeek]);

  // Register volume control so the bottom bar slider controls the real audio element
  useEffect(() => {
    onRegisterVolume((vol) => {
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, Math.min(1, vol));
      }
    });
    return () => onRegisterVolume(null);
  }, [onRegisterVolume]);

  // Auto-play when isPlaying prop changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && !error) {
      audioRef.current.play().catch(err => {
        console.error('Playback error:', err);
        setError('Failed to play audio');
        onError(err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, error, onError]);

  // Update progress
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  // Handle play
  const handlePlay = () => {
    onPlay();
  };

  // Handle pause
  const handlePause = () => {
    onPause();
  };

  // Handle ended
  const handleEnded = () => {
    onEnded();
  };

  // Handle error — retry up to 3 times before showing the error UI
  const fetchStreamAsBlob = async (url) => {
    const response = await fetch(url, {
      headers: {
        'ngrok-skip-browser-warning': '000',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Stream fetch failed (${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    setBlobUrl(objectUrl);
    setIsBlobFallback(true);

    if (audioRef.current) {
      audioRef.current.src = objectUrl;
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => { });
    }

    return objectUrl;
  };

  const handleError = async (e) => {
    console.error('Audio element error:', e);

    if (!isBlobFallback && streamUrl) {
      try {
        setError(null);
        await fetchStreamAsBlob(streamUrl);
        return;
      } catch (fetchError) {
        console.warn('Blob fallback failed:', fetchError);
      }
    }

    if (retryCountRef.current < 3) {
      retryCountRef.current++;
      const delay = retryCountRef.current * 2000; // 2s, 4s, 6s
      console.log(`Retrying audio stream (attempt ${retryCountRef.current}) in ${delay}ms...`);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          if (isPlaying) audioRef.current.play().catch(() => { });
        }
      }, delay);
    } else {
      setError('Failed to load audio stream');
      onError(e);
    }
  };

  // Handle loading
  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!duration || !audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time helper
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="w-full aspect-video bg-zinc-900 border border-red-500/30 rounded-lg flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-sm font-semibold mb-2">Audio Stream Error</p>
          <p className="text-zinc-400 text-xs">{error}</p>
          <p className="text-zinc-500 text-xs mt-2">This video may not support audio extraction</p>
        </div>
      </div>
    );
  }

  if (!streamUrl) {
    return (
      <div className="w-full aspect-video bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-zinc-400 text-sm font-semibold mb-2">Loading Audio...</p>
          <div className="animate-spin inline-block">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={isBlobFallback && blobUrl ? blobUrl : streamUrl}
        crossOrigin="anonymous"
        muted={isMuted}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
      />

      {/* Player UI */}
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
                  if (audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause();
                    } else {
                      audioRef.current.play();
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
          ✓ Audio streaming {isPlaying ? '• Playing' : isLoading ? '• Loading...' : ''}
        </div>
      </div>
    </div>
  );
}
