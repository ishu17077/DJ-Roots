const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const youtubeDl = require('youtube-dl-exec');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

/**
 * GET /api/youtube/stream/:videoId
 * Extracts audio stream URL from YouTube video
 * Returns: { url, format, duration, title }
 */
app.get('/api/youtube/stream/:videoId', async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    // Validate video ID format
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID format' });
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`Extracting stream for video: ${videoId}`);

    // Extract the best audio-only format
    const stream = await youtubeDl(youtubeUrl, {
      quiet: true,
      noWarnings: true,
      dumpSingleJson: true,
      format: 'bestaudio[ext=m4a]/bestaudio',
      getUrl: true,
    });

    if (!stream || !stream.url) {
      return res.status(404).json({
        error: 'Could not extract stream URL from this video',
        details: 'The video may be unavailable, restricted, or does not allow audio extraction'
      });
    }

    // Return the stream data
    res.json({
      success: true,
      url: stream.url,
      format: stream.format || 'audio/mp4',
      duration: stream.duration || null,
      title: stream.title || 'Unknown',
      ext: stream.ext || 'm4a'
    });

  } catch (error) {
    console.error(`Error extracting stream for ${videoId}:`, error.message);

    // Handle specific error cases
    if (error.message.includes('Video unavailable') || error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Video not found or unavailable',
        message: error.message
      });
    }

    if (error.message.includes('not available in your country')) {
      return res.status(403).json({
        error: 'Video not available in your region',
        message: error.message
      });
    }

    if (error.message.includes('age restricted')) {
      return res.status(403).json({
        error: 'Age-restricted content cannot be played',
        message: error.message
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Failed to extract stream URL',
      message: error.message || 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/youtube/metadata/:videoId
 * Extracts metadata from YouTube video
 * Returns: { title, duration, channelTitle, description }
 */
app.get('/api/youtube/metadata/:videoId', async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID format' });
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`Extracting metadata for video: ${videoId}`);

    const info = await youtubeDl(youtubeUrl, {
      quiet: true,
      noWarnings: true,
      dumpSingleJson: true,
      noPlaylist: true,
    });

    res.json({
      success: true,
      title: info.title || 'Unknown',
      duration: info.duration || null,
      channelTitle: info.channel || info.uploader || 'Unknown',
      description: info.description || '',
      thumbnail: info.thumbnail || null,
      uploadDate: info.upload_date || null
    });

  } catch (error) {
    console.error(`Error extracting metadata for ${videoId}:`, error.message);
    res.status(500).json({
      error: 'Failed to extract metadata',
      message: error.message
    });
  }
});

/**
 * POST /api/youtube/info
 * Get both stream URL and metadata in one request
 */
app.post('/api/youtube/info', async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID format' });
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`Extracting full info for video: ${videoId}`);

    // Get full info including stream URL
    const info = await youtubeDl(youtubeUrl, {
      quiet: true,
      noWarnings: true,
      dumpSingleJson: true,
      format: 'bestaudio[ext=m4a]/bestaudio',
    });

    res.json({
      success: true,
      title: info.title || 'Unknown',
      duration: info.duration || null,
      artist: info.channel || info.uploader || 'Unknown',
      description: info.description || '',
      thumbnail: info.thumbnail || null,
      url: info.url || null,
      format: info.format || 'audio/mp4',
      ext: info.ext || 'm4a'
    });

  } catch (error) {
    console.error(`Error extracting full info for ${videoId}:`, error.message);
    res.status(500).json({
      error: 'Failed to extract video information',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'YouTube Stream Extractor' });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🎵 YouTube Stream Backend Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Get stream: GET http://localhost:${PORT}/api/youtube/stream/:videoId`);
});
