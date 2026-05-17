const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const youtubeDl = require('youtube-dl-exec').create(process.env.YOUTUBE_DL_BINARY || 'yt-dlp');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

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
  const {
    videoId
  } = req.params;

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({
      error: 'Invalid video ID'
    });
  }

  try {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`\uD83C\uDFB5 Extracting stream for: ${videoId}`);

    const dlOptions = {
      dumpSingleJson: true,
      format: 'bestaudio/best',
      extractorArgs: 'youtube:player_client=android_vr,tv_embedded,default',
      quiet: true,
      noWarnings: true,
    };

    // Use cookies if the file exists to bypass YouTube bot detection
    // Render mounts Secret Files in Docker at /etc/secrets/

    /*
    let cookiesPath = process.env.YOUTUBE_COOKIES_PATH;
    if (!cookiesPath && fs.existsSync('/etc/secrets/cookies.txt')) {
      cookiesPath = '/etc/secrets/cookies.txt';
    } else if (!cookiesPath && fs.existsSync(path.join(__dirname, 'cookies.txt'))) {
      cookiesPath = path.join(__dirname, 'cookies.txt');
    }

    if (cookiesPath && fs.existsSync(cookiesPath)) {
      // yt-dlp attempts to write back to the cookies file to keep session tokens fresh.
      // Since /etc/secrets/ is a read-only file system, we must provide a writable copy.
      const writableCookiesPath = path.join(require('os').tmpdir(), 'yt_cookies.txt');
      try {
        if (!fs.existsSync(writableCookiesPath)) {
          fs.copyFileSync(cookiesPath, writableCookiesPath);
        }
        dlOptions.cookies = writableCookiesPath;
      } catch (err) {
        console.error('Failed to copy cookies to writable path:', err);
        dlOptions.cookies = cookiesPath;
      }
    }
    */


    // Get stream info as JSON (no getUrl flag - they conflict with dumpSingleJson)
    const info = await youtubeDl(youtubeUrl, dlOptions);

    const streamUrl = info?.url;
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