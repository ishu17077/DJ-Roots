import { useEffect, useRef, useState, useMemo } from 'react';

/**
 * YouTube Player Component
 * Embeds YouTube videos without ads using youtube-nocookie.com
 * Supports playback control and error handling
 */
export default function YouTubePlayer({
  videoId,
  embedUrl,
  title,
  onReady = () => { },
  onError = () => { },
  autoplay = false,
  muted = false,
  controls = true,
  showInfo = true,
}) {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Build dynamic embed URL with autoplay parameter
  const dynamicEmbedUrl = useMemo(() => {
    if (!embedUrl) return '';
    // Replace autoplay parameter based on prop
    const url = new URL(embedUrl);
    url.searchParams.set('autoplay', autoplay ? '1' : '0');
    url.searchParams.set('controls', controls ? '1' : '0');
    if (muted) {
      url.searchParams.set('mute', '1');
    } else {
      url.searchParams.set('mute', '0');
    }
    return url.toString();
  }, [embedUrl, autoplay, muted, controls]);

  useEffect(() => {
    if (!videoId || !embedUrl) {
      setError('No video ID or embed URL provided');
      return;
    }

    setIsLoading(false);
  }, [videoId, embedUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);

    if (iframeRef.current?.contentWindow && !muted) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }),
        '*'
      );
      if (autoplay) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      }
    }

    onReady();
  };

  const handleIframeError = () => {
    setError('Failed to load YouTube video');
    onError();
  };

  if (error) {
    return (
      <div className="w-full aspect-video bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-sm font-semibold mb-2">Error Loading Video</p>
          <p className="text-zinc-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800 ${isLoading ? 'animate-pulse' : ''}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
            <div className="animate-spin">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={dynamicEmbedUrl}
          title={title || 'YouTube Video'}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>

      {showInfo && (
        <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-lg p-3">
          <h4 className="text-xs font-bold text-white truncate">{title || 'YouTube Video'}</h4>
          <p className="text-[10px] text-zinc-400 mt-1">
            ✓ No ads • Streaming from YouTube • {muted ? 'Muted' : 'Audio enabled'}
          </p>
        </div>
      )}
    </div>
  );
}
