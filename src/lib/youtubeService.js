/**
 * YouTube Service - Extract video IDs, fetch metadata, and generate embed URLs.
 */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
// Always use the videos endpoint directly - env var is ignored to avoid misconfiguration
const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

/**
 * Extract video ID from various YouTube URL formats
 * @param {string} url - YouTube URL (youtube.com, youtu.be, youtube-nocookie.com)
 * @returns {string|null} - Video ID or null if invalid
 */
export const extractVideoId = (url) => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Handle youtube.com and www.youtube.com
    if (hostname === 'youtube.com' || hostname === 'www.youtube.com') {
      return urlObj.searchParams.get('v');
    }

    // Handle youtu.be short format
    if (hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }

    // Handle youtube-nocookie.com embed format
    if (hostname === 'youtube-nocookie.com' || hostname === 'www.youtube-nocookie.com') {
      const match = urlObj.pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Validate if a URL is a valid YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  return extractVideoId(url) !== null;
};

const parseIso8601DurationToSeconds = (isoDuration) => {
  if (!isoDuration || typeof isoDuration !== 'string') return 180;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 180;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return (hours * 3600) + (minutes * 60) + seconds || 180;
};

/**
 * Fetch video metadata. Priority:
 * 1. YouTube Data API v3 (if API key configured)
 * 2. Backend oEmbed proxy (server-side, no CORS)
 * 3. Direct YouTube oEmbed (sometimes works)
 * 4. noembed.com as last resort
 */
export const fetchVideoMetadata = async (videoId) => {
  if (!videoId) return getDefaultMetadata();

  // 1. YouTube Data API v3
  if (YOUTUBE_API_KEY) {
    try {
      const params = new URLSearchParams({
        part: 'snippet,contentDetails,status',
        id: videoId,
        key: YOUTUBE_API_KEY,
      });
      const response = await fetch(`${YOUTUBE_VIDEOS_URL}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const item = data?.items?.[0];
        if (item) {
          if (item.status?.embeddable === false) {
            return { ...getDefaultMetadata(videoId), embeddable: false, success: false };
          }
          const thumb =
            item.snippet?.thumbnails?.maxres?.url ||
            item.snippet?.thumbnails?.standard?.url ||
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url ||
            getThumbnailUrl(videoId);
          return {
            title: item.snippet?.title || 'Unknown Title',
            channelTitle: item.snippet?.channelTitle || 'Unknown Artist',
            duration: parseIso8601DurationToSeconds(item.contentDetails?.duration),
            thumbnail: thumb,
            videoId,
            embeddable: true,
            success: true,
          };
        }
      }
    } catch (e) {
      console.warn('YouTube API v3 failed:', e);
    }
  }

  // 2. Backend oEmbed proxy (works when backend is running)
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/youtube/oembed/${videoId}`, {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'bypass-tunnel-reminder': 'asddsa',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.title) {
        return {
          title: data.title,
          channelTitle: data.author_name || 'Unknown Artist',
          duration: 180,
          thumbnail: data.thumbnail_url || getThumbnailUrl(videoId),
          videoId,
          embeddable: true,
          success: true,
        };
      }
    }
  } catch (e) {
    console.warn('Backend oEmbed proxy failed:', e.message);
  }

  // 3. noembed.com
  try {
    const noembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(noembedUrl, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const data = await response.json();
      if (data.title && !data.title.toLowerCase().startsWith('youtube video')) {
        return {
          title: data.title,
          channelTitle: data.author_name || 'Unknown Artist',
          duration: 180,
          thumbnail: data.thumbnail_url || getThumbnailUrl(videoId),
          videoId,
          embeddable: true,
          success: true,
        };
      }
    }
  } catch (e) {
    console.warn('noembed fallback failed:', e.message);
  }

  return getDefaultMetadata(videoId);
};

/**
 * Get YouTube thumbnail URL directly from video ID
 * Uses YouTube's public image service (no auth required)
 * @param {string} videoId - YouTube video ID
 * @returns {string} - Thumbnail URL
 */
export const getThumbnailUrl = (videoId) => {
  // Use high quality thumbnail (hqdefault - 480x360)
  // Falls back to mqdefault (320x180) if not available
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Get default metadata when fetch fails
 * @param {string} videoId - Video ID (optional)
 * @returns {Object} - Default metadata object
 */
const getDefaultMetadata = (videoId = null) => {
  return {
    title: 'YouTube Video',
    duration: 180, // Default 3 minutes
    thumbnail: videoId ? getThumbnailUrl(videoId) : 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=120&q=80',
    videoId: videoId || '',
    success: false
  };
};

export const buildEmbedUrl = (videoId) => {
  if (!videoId) return '';

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    fs: '1',
    autoplay: '0',
    controls: '1',
    playsinline: '1',
    enablejsapi: '1',
    mute: '0',
  });
  if (origin) {
    params.set('origin', origin);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Extract artist info from video title (heuristic approach)
 * Format is usually "Artist - Song Title" or "Artist: Song Title"
 * @param {string} title - Video title
 * @returns {string} - Extracted artist or "Unknown Artist"
 */
export const extractArtistFromTitle = (title) => {
  if (!title) return 'Unknown Artist';

  // Split by common separators
  const separators = [' - ', ' — ', ': ', ' | '];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const parts = title.split(sep);
      if (parts.length >= 2) {
        return parts[0].trim();
      }
    }
  }

  return 'Unknown Artist';
};

/**
 * Create a complete song object from YouTube video ID
 * Fetches metadata and formats for queue system
 * @param {string} videoId - YouTube video ID
 * @param {string} addedBy - User who added the song
 * @returns {Promise<Object>} - Complete song object for queue
 */
export const createSongFromYouTube = async (videoId, addedBy = 'Guest', userAvatar = null) => {
  const metadata = await fetchVideoMetadata(videoId);
  if (metadata.embeddable === false) {
    throw new Error('This YouTube video cannot be embedded.');
  }
  const artist = metadata.channelTitle || extractArtistFromTitle(metadata.title);

  return {
    id: `youtube-${videoId}`,
    title: metadata.title,
    artist: artist,
    votes: 1,
    duration: metadata.duration,
    pitch: 260, // Default pitch
    bpm: 120, // Default BPM
    key: 'G Min', // Default key
    addedBy: addedBy,
    img: metadata.thumbnail,
    youtubeVideoId: videoId,
    embedUrl: buildEmbedUrl(videoId),
    source: 'youtube',
    userAvatar: userAvatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&q=80'
  };
};

/**
 * Validate and process a YouTube URL
 * @param {string} url - Raw user input URL
 * @returns {Promise<Object>} - { valid: boolean, videoId: string|null, error: string|null }
 */
export const processYouTubeUrl = async (url) => {
  if (!url || !url.trim()) {
    return {
      valid: false,
      videoId: null,
      error: 'URL is empty'
    };
  }

  const videoId = extractVideoId(url);

  if (!videoId) {
    return {
      valid: false,
      videoId: null,
      error: 'Invalid YouTube URL format. Use youtube.com, youtu.be, or a valid video link.'
    };
  }

  // Optionally verify video exists (basic check)
  try {
    const metadata = await fetchVideoMetadata(videoId);
    return {
      valid: true,
      videoId: videoId,
      error: null,
      metadata: metadata
    };
  } catch (error) {
    return {
      valid: false,
      videoId: null,
      error: 'Unable to fetch video information. Please check the URL.'
    };
  }
};

/**
 * Search YouTube for a song query
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of formatted song objects
 */
export const searchYouTube = async (query) => {
  if (!query || !query.trim()) return [];
  
  // Try backend first since it doesn't need API keys and handles scraping natively
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/youtube/search?q=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'bypass-tunnel-reminder': 'asddsa',
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.results) {
        return data.results.map(item => ({
          id: `youtube-${item.videoId}`,
          title: item.title,
          artist: item.channelTitle || extractArtistFromTitle(item.title),
          duration: item.duration || 180,
          img: item.thumbnail || getThumbnailUrl(item.videoId),
          youtubeVideoId: item.videoId,
          source: 'youtube',
          pitch: 260,
          bpm: 120,
          key: 'G Min',
          votes: 1
        }));
      }
    }
  } catch (e) {
    console.warn('Backend search failed:', e);
  }

  // Fallback to Data API v3 if key exists
  if (YOUTUBE_API_KEY) {
    try {
      const params = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: '15',
        key: YOUTUBE_API_KEY,
      });
      const response = await fetch(`${YOUTUBE_VIDEOS_URL.replace('/videos', '/search')}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        return data.items.map(item => ({
          id: `youtube-${item.id.videoId}`,
          title: item.snippet.title,
          artist: item.snippet.channelTitle || extractArtistFromTitle(item.snippet.title),
          duration: 180, // search api doesn't return duration, default to 3m
          img: item.snippet.thumbnails?.high?.url || getThumbnailUrl(item.id.videoId),
          youtubeVideoId: item.id.videoId,
          source: 'youtube',
          pitch: 260,
          bpm: 120,
          key: 'G Min',
          votes: 1
        }));
      }
    } catch (e) {
      console.warn('YouTube API v3 search failed:', e);
    }
  }
  
  return [];
};

/**
 * Fetch top trending music videos from YouTube API directly
 * Uses chart=mostPopular and videoCategoryId=10 (Music)
 */
export const getTrendingMusic = async () => {
  if (!YOUTUBE_API_KEY) return [];
  
  try {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      chart: 'mostPopular',
      videoCategoryId: '10', // 10 is Music
      maxResults: '20',
      key: YOUTUBE_API_KEY,
    });
    const response = await fetch(`${YOUTUBE_VIDEOS_URL}?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      return data.items.map(item => {
        // Parse ISO 8601 duration
        let durationSecs = 180;
        if (item.contentDetails && item.contentDetails.duration) {
          const match = item.contentDetails.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
          if (match) {
            const h = (parseInt(match[1]) || 0);
            const m = (parseInt(match[2]) || 0);
            const s = (parseInt(match[3]) || 0);
            durationSecs = h * 3600 + m * 60 + s;
          }
        }
        
        return {
          id: `youtube-${item.id}`,
          title: item.snippet.title,
          artist: item.snippet.channelTitle || extractArtistFromTitle(item.snippet.title),
          duration: durationSecs,
          img: item.snippet.thumbnails?.high?.url || getThumbnailUrl(item.id),
          youtubeVideoId: item.id,
          source: 'youtube',
          pitch: 260,
          bpm: 120,
          key: 'G Min',
          votes: 1
        };
      });
    }
  } catch (e) {
    console.warn('YouTube API v3 getTrendingMusic failed:', e);
  }
  return [];
};
