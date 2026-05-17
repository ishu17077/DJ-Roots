/**
 * Extract video ID from various YouTube URL formats
 * Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
 */
export function extractYoutubeVideoId(url) {
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be short links
    if (urlObj.hostname === 'youtu.be' || urlObj.hostname === 'www.youtu.be') {
      return urlObj.pathname.slice(1).split('?')[0];
    }
    
    // Handle youtube.com and www.youtube.com
    if (urlObj.hostname === 'youtube.com' || urlObj.hostname === 'www.youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }
    
    // Handle youtube.com/embed/... format
    if (urlObj.pathname.includes('/embed/')) {
      const match = urlObj.pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
    }
  } catch (error) {
    console.error('Invalid URL:', error);
  }
  
  return null;
}

/**
 * Get standard YouTube thumbnail URL from video ID
 */
export function getYoutubeThumbnail(videoId) {
  // Using highest quality thumbnail available
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Check if URL is a YouTube URL
 */
export function isYoutubeUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    return (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'www.youtu.be'
    );
  } catch {
    return false;
  }
}
