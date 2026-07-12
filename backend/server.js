const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const play = require('play-dl');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors({
//   // origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   // credentials: true
//   origin: process.env.FRONTEND_URL,
//   credentials: false,
// }));

const corsHosts = process.env.CORS_HOSTS?.split(",").map(h => h.trim()) ?? ["http://localhost:5173"]
const corsOptions = {
  origin: (origin, callback) => {
    if (!corsHosts || !origin || corsHosts.includes(origin)) {
      callback(null, origin || "*")
    } else {
      callback(new Error("fekfjekf"))
    }
  },
  methods: [],
  credentials: true,
}

app.use(cors(corsOptions))

app.use(express.json());

/**
 * GET /api/youtube/stream/:videoId
 * Extracts audio stream URL from YouTube video
 * Returns: { url, format, duration, title }
 */
app.get('/api/youtube/stream/:videoId', async (req, res) => {
  const {
    videoId
  } = req.params;
  console.log("HIT")
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({
      error: 'Invalid video ID'
    });
  }

  try {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`🎵 Extracting stream for: ${videoId}`);

    const streamInfo = await play.stream(youtubeUrl, { discordPlayerCompatibility: false });

    const streamUrl = streamInfo?.url;
    if (!streamUrl) {
      return res.status(404).json({
        error: 'Could not extract stream URL from this video'
      });
    }

    console.log(`\uD83D\uDD01 Proxying audio stream for: ${videoId}`);

    // Support range requests for seeking
    const rangeHeader = req.headers.range;
    const reqHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };
    if (rangeHeader) reqHeaders['Range'] = rangeHeader;

    // Proxy the audio through our backend to avoid browser CORS restrictions
    const protocol = streamUrl.startsWith('https') ? https : http;
    const proxyReq = protocol.get(streamUrl, {
      headers: reqHeaders
    }, (audioRes) => {
      const status = rangeHeader && audioRes.statusCode === 206 ? 206 : 200;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Type', audioRes.headers['content-type'] || 'audio/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      if (audioRes.headers['content-length']) res.setHeader('Content-Length', audioRes.headers['content-length']);
      if (audioRes.headers['content-range']) res.setHeader('Content-Range', audioRes.headers['content-range']);
      res.status(status);
      audioRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err.message);
      if (!res.headersSent) res.status(500).json({
        error: 'Stream proxy failed',
        message: err.message
      });
    });

    req.on('close', () => proxyReq.destroy());

  } catch (error) {
    console.error(`Error extracting stream for ${videoId}:`, error.message);
    res.status(500).json({
      error: 'Failed to extract stream URL',
      message: error.message
    });
  }
});

/**
 * GET /api/youtube/metadata/:videoId
 * Extracts metadata from YouTube video
 * Returns: { title, duration, channelTitle, description }
 */
app.get('/api/youtube/metadata/:videoId', async (req, res) => {
  const {
    videoId
  } = req.params;

  if (!videoId) {
    return res.status(400).json({
      error: 'Video ID is required'
    });
  }

  try {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({
        error: 'Invalid video ID format'
      });
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`Extracting metadata for video: ${videoId}`);

    const info = await play.video_info(youtubeUrl);

    res.json({
      success: true,
      title: info.video_details.title || 'Unknown',
      duration: info.video_details.durationInSec || null,
      channelTitle: info.video_details.channel?.name || 'Unknown',
      description: info.video_details.description || '',
      thumbnail: info.video_details.thumbnails[0]?.url || null,
      uploadDate: info.video_details.uploadedAt || null
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
  const {
    videoId
  } = req.body;

  if (!videoId) {
    return res.status(400).json({
      error: 'Video ID is required'
    });
  }

  try {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({
        error: 'Invalid video ID format'
      });
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`Extracting full info for video: ${videoId}`);

    const info = await play.video_info(youtubeUrl);
    const streamInfo = await play.stream(youtubeUrl, { discordPlayerCompatibility: false });

    res.json({
      success: true,
      title: info.video_details.title || 'Unknown',
      duration: info.video_details.durationInSec || null,
      artist: info.video_details.channel?.name || 'Unknown',
      description: info.video_details.description || '',
      thumbnail: info.video_details.thumbnails[0]?.url || null,
      url: streamInfo?.url || null,
      format: streamInfo?.type || 'audio/mp4',
      ext: 'm4a'
    });

  } catch (error) {
    console.error(`Error extracting full info for ${videoId}:`, error.message);
    res.status(500).json({
      error: 'Failed to extract video information',
      message: error.message
    });
  }
});

/**
 * GET /api/youtube/oembed/:videoId
 * Fetches YouTube oEmbed metadata server-side (no CORS issues)
 * Returns: { title, author_name, thumbnail_url }
 */
app.get('/api/youtube/oembed/:videoId', async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid video ID' });
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const oembedRes = await new Promise((resolve, reject) => {
      https.get(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DJ-Roots/1.0)',
        }
      }, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => resolve({ status: r.statusCode, body: data }));
      }).on('error', reject);
    });

    if (oembedRes.status !== 200) {
      return res.status(404).json({ error: 'Video not found or not embeddable' });
    }

    const parsed = JSON.parse(oembedRes.body);
    res.json({
      success: true,
      title: parsed.title,
      author_name: parsed.author_name,
      thumbnail_url: parsed.thumbnail_url,
    });
  } catch (error) {
    console.error(`oEmbed fetch error for ${videoId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch oEmbed metadata', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'YouTube Stream Extractor'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🎵 YouTube Stream Backend Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Get stream: GET http://localhost:${PORT}/api/youtube/stream/:videoId`);
});