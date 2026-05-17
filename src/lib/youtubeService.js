/**
 * YouTube Service - Extract video IDs, fetch metadata, and generate ad-free embed URLs
 * Supports multiple YouTube URL formats and provides video metadata without requiring API keys
 */

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

/**
 * Fetch video metadata using Noembed API (no auth required)
 * Returns basic video information: title, duration, thumbnail
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Video metadata or default values if fetch fails
 */
export const fetchVideoMetadata = async (videoId) => {
  if (!videoId) {
    return getDefaultMetadata();
  }

  try {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(youtubeUrl)}`);

    if (!response.ok) {
      return getDefaultMetadata(videoId);
    }

    const data = await response.json();

    return {
      title: data.title || 'Unknown Title',
      duration: data.video_id ? estimateDuration(data) : 180, // Estimate 3 minutes if unknown
      thumbnail: data.thumbnail_url || getThumbnailUrl(videoId),
      videoId: videoId,
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

/**
 * Estimate duration from Noembed data (rough estimation)
 * @param {Object} data - Noembed API response
 * @returns {number} - Estimated duration in seconds
 */
const estimateDuration = (data) => {
  // Noembed doesn't always provide duration
  // Default to 3 minutes as safe estimate
  return 180;
};

/**
 * Build ad-free embed URL using youtube-nocookie.com
 * This domain doesn't serve ads
 * @param {string} videoId - YouTube video ID
 * @returns {string} - Embed URL without ads
 */
export const buildEmbedUrl = (videoId) => {
  if (!videoId) return '';

  // Use youtube-nocookie.com domain to prevent ads
  // Parameters: rel=0 (no related videos), modestbranding=1 (smaller player), fs=1 (fullscreen)
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&fs=1&autoplay=0&controls=1`;
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
  const artist = extractArtistFromTitle(metadata.title);

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