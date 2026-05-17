/**
 * Fetch YouTube video metadata using noembed.com (free, no auth required)
 * Fallback: Use basic title parsing from URL or video ID
 */
export async function fetchYoutubeMetadata(videoId) {
  try {
    const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Metadata fetch failed');
    
    const data = await response.json();
    
    return {
      title: data.title || `Video ${videoId.slice(0, 8)}`,
      artist: data.author_name || 'YouTube',
      duration: 180,
      description: data.description || '',
    };
  } catch (error) {
    console.warn('Could not fetch metadata from noembed:', error);
    // Return fallback with minimal info
    return {
      title: `YouTube Video (${videoId.slice(0, 8)})`,
      artist: 'YouTube',
      duration: 180, // Default 3 minutes
      description: '',
    };
  }
}

/**
 * Try alternate metadata source using iframely
 */
export async function fetchYoutubeMetadataAlt(videoId) {
  try {
    // Using YouTube's oembed endpoint as alternative
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Metadata fetch failed');
    
    const data = await response.json();
    
    return {
      title: data.title || `Video ${videoId.slice(0, 8)}`,
      artist: data.author_name || 'YouTube',
      duration: 180,
      description: '',
    };
  } catch (error) {
    console.warn('Could not fetch metadata from oembed:', error);
    return null;
  }
}

/**
 * Helper function to estimate video duration (placeholder)
 * In a real app, you'd need to parse the video or use metadata
 */
// Duration estimation is handled directly now (default 180 seconds)

/**
 * Get comprehensive YouTube metadata with fallbacks
 */
export async function getYoutubeVideoInfo(videoId) {
  let metadata = await fetchYoutubeMetadata(videoId);
  
  // If primary source fails, try alternate
  if (!metadata || metadata.title.includes('Video')) {
    const altMetadata = await fetchYoutubeMetadataAlt(videoId);
    if (altMetadata) {
      metadata = altMetadata;
    }
  }
  
  return metadata;
}
