# YouTube Song Playback - Setup Guide

## Overview
This guide explains how to set up and run the DJ-Roots application with full YouTube song playback support.

## Components

### 1. Frontend (React + Vite)
- Main DJ-Roots application
- Uses `YouTubeAudioPlayer` component for playback
- Communicates with backend to get audio streams

### 2. Backend Server (Node.js + Express)
- Extracts audio streams from YouTube videos using `yt-dlp`
- Provides REST API endpoints for stream extraction
- Runs on port 5000

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- yt-dlp (should be pre-installed on Linux)
- npm or yarn

### Install yt-dlp (if not already installed)
```bash
# Ubuntu/Debian
sudo apt-get install yt-dlp

# macOS
brew install yt-dlp

# Or using pip
pip install yt-dlp
```

### Step 1: Frontend Setup
```bash
cd /path/to/DJ-Roots
npm install
```

Create/update `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_BACKEND_URL=http://localhost:5000
```

### Step 2: Backend Setup
```bash
cd /path/to/DJ-Roots/backend
npm install
```

Create `.env` file:
```
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
# Backend will run on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

### Production Mode

**Build Frontend:**
```bash
npm run build
npm run preview  # Test the build locally
```

**Deploy Backend:**
- Deploy the `/backend` folder to your server
- Run `npm install && npm start` on the server
- Make sure to update `VITE_BACKEND_URL` in frontend `.env` to point to your deployed backend

## How It Works

1. **User adds a YouTube URL:**
   - Frontend extracts video ID from the URL
   - Calls backend to get stream URL
   - Backend uses yt-dlp to extract the audio stream

2. **Stream is fetched:**
   - Backend returns the playable audio URL
   - Frontend loads it into HTML5 audio player

3. **Song plays:**
   - User can play/pause, adjust volume, seek through the track
   - All controls are built into the `YouTubeAudioPlayer` component

## API Endpoints

### `GET /api/youtube/stream/:videoId`
Extracts and returns the audio stream URL for a YouTube video.

**Response:**
```json
{
  "success": true,
  "url": "https://rr.../stream.m4a",
  "format": "audio/mp4",
  "duration": 213,
  "title": "Song Title",
  "ext": "m4a"
}
```

### `GET /api/youtube/metadata/:videoId`
Gets video metadata without extracting the stream.

**Response:**
```json
{
  "success": true,
  "title": "Song Title",
  "duration": 213,
  "channelTitle": "Artist Name",
  "description": "...",
  "thumbnail": "https://..."
}
```

### `POST /api/youtube/info`
Gets both stream URL and metadata in one request.

**Request Body:**
```json
{
  "videoId": "dQw4w9WgXcQ"
}
```

**Response:**
```json
{
  "success": true,
  "title": "...",
  "duration": 213,
  "artist": "...",
  "url": "https://...",
  "thumbnail": "https://..."
}
```

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "YouTube Stream Extractor"
}
```

## Troubleshooting

### Backend won't start
- Make sure port 5000 is not in use: `lsof -i :5000`
- Check that yt-dlp is installed: `which yt-dlp`
- Check Node.js version: `node --version` (should be v14+)

### Stream extraction fails
- The video might be age-restricted or region-blocked
- YouTube might have updated their protection
- Try updating yt-dlp: `pip install --upgrade yt-dlp`

### CORS errors
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- For development: `http://localhost:5173` or `http://localhost:3000`

### Frontend can't connect to backend
- Make sure `VITE_BACKEND_URL` in frontend `.env` is correct
- Make sure backend is running: `curl http://localhost:5000/health`
- Check browser console for errors

## Environment Variables

### Frontend (.env)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_YOUTUBE_API_KEY` - (Optional) YouTube Data API key
- `VITE_BACKEND_URL` - Backend server URL (default: http://localhost:5000)

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `NODE_ENV` - Environment (development/production)

## Performance Considerations

- **First stream extraction:** May take 5-15 seconds (yt-dlp needs to analyze the video)
- **Subsequent requests:** Faster as YouTube might cache the URL
- **Stream URLs expire:** After some time (typically 6 hours), they need to be re-extracted

## Limitations

- YouTube streams are extracted in real-time; extraction may fail if YouTube updates their protection
- Age-restricted videos cannot be played
- Region-restricted videos won't work in certain countries
- Some videos with copyright blocks may not be extractable

## License

This implementation uses yt-dlp (GPL-3.0) for video processing.

## Support

For issues, check:
1. Backend logs (Terminal 1)
2. Browser console (F12)
3. Network tab in DevTools
4. yt-dlp version: `yt-dlp --version`
