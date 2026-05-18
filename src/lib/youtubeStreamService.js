/**
 * YouTube Stream Service
 * Communicates with the backend server to extract audio streams from YouTube videos
 */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Get the audio stream URL for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<{url: string, format: string, duration: number, title: string}>}
 */
export const getYouTubeStreamUrl = async (videoId) => {
  if (!videoId) {
    throw new Error('Video ID is required');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/youtube/stream/${videoId}`, {
      headers: {
        "ngrok-skip-browser-warning": "000",
        "bypass-tunnel-reminder":"asddsa",
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to extract stream URL');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting stream URL:', error);
    throw error;
  }
};

/**
 * Get metadata for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<{title: string, duration: number, channelTitle: string, description: string, thumbnail: string}>}
 */
export const getYouTubeMetadata = async (videoId) => {
  if (!videoId) {
    throw new Error('Video ID is required');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/youtube/metadata/${videoId}`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
        "bypass-tunnel-reminder":"asddsa",
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to extract metadata');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting metadata:', error);
    throw error;
  }
};

/**
 * Get both stream URL and metadata in one request
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<{title: string, duration: number, artist: string, url: string, format: string, thumbnail: string}>}
 */
export const getYouTubeStreamInfo = async (videoId) => {
  if (!videoId) {
    throw new Error('Video ID is required');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/youtube/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "69420",
        "bypass-tunnel-reminder":"asddsa",
      },
      body: JSON.stringify({
        videoId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to extract stream information');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting stream info:', error);
    throw error;
  }
};

/**
 * Check if the backend server is running
 * @returns {Promise<boolean>}
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        "ngrok-skip-browser-warning": "69420",
        "bypass-tunnel-reminder":"asddsa",
      }
    });
    return response.ok;
  } catch {
    return false;
  }
};