/**
 * YouTube Service - Extract video IDs, fetch metadata, and generate embed URLs.
 */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = import.meta.env.VITE_YOUTUBE_API_BASE_URL || 'https://www.googleapis.com/youtube/v3';

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
 * Fetch video metadata from YouTube Data API v3.
 * Falls back to noembed if API key is not configured or request fails.
 */
export const fetchVideoMetadata = async (videoId) => {
  if (!videoId) {
    return getDefaultMetadata();
  }

  try {
    if (YOUTUBE_API_KEY) {
      const params = new URLSearchParams({
        part: 'snippet,contentDetails,status',
        id: videoId,
        key: YOUTUBE_API_KEY,
      });

      const response = await fetch(`${YOUTUBE_API_BASE_URL}/videos?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        const item = data?.items?.[0];

        if (item?.status?.embeddable === false) {
          return {
            ...getDefaultMetadata(videoId),
            embeddable: false,
            success: false,
          };
        }

        if (item) {
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
            embeddable: item.status?.embeddable !== false,
            success: true,
          };
        }
      } else {
        console.warn('YouTube Data API request failed, falling back to noembed');
      }
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const fallbackResponse = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(youtubeUrl)}`);
    if (!fallbackResponse.ok) {
      return getDefaultMetadata(videoId);
    }
    const fallbackData = await fallbackResponse.json();

    return {
      title: fallbackData.title || 'Unknown Title',
      channelTitle: fallbackData.author_name || 'Unknown Artist',
      duration: 180,
      thumbnail: fallbackData.thumbnail_url || getThumbnailUrl(videoId),
      videoId,
      embeddable: true,
      success: true
    };
  } catch (error) {
    console.warn('Error fetching YouTube metadata:', error);
    return getDefaultMetadata(videoId);
  }
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
export const createSongFromYouTube = async (videoId, addedBy = 'Guest') => {
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
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&q=80'
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
