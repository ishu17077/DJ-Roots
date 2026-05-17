# Quick Start - YouTube Playback Fixed! 🎵

## What Was Fixed
Your DJ-Roots app now has **full YouTube song playback** with complete control (play, pause, seek, volume).

## How to Get Started (3 steps)

### Step 1: Start the Backend Server
```bash
cd backend
npm install
npm start
```

You should see:
```
🎵 YouTube Stream Backend Server running on http://localhost:5000
   Health check: http://localhost:5000/health
```

### Step 2: Create Frontend .env (if not exists)
Create or update `.env` in the root directory:
```
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Step 3: Start the Frontend
In a new terminal:
```bash
npm install   # if not done already
npm run dev
```

## Test It Out ✅

1. Open http://localhost:5173 in your browser
2. Go to "Add Song" → "URL" tab
3. Paste a YouTube URL (example: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
4. Click add song
5. Select the song from the queue
6. **Click Play** - you should hear the music!

## New Features

- ▶️ **Play/Pause** - Full playback control
- 🔊 **Volume Control** - Adjust volume and mute
- ⏱️ **Seek Bar** - Jump to any part of the song
- 📊 **Progress Display** - See current time and duration
- ⚠️ **Error Handling** - Clear error messages if extraction fails

## Architecture

```
YouTube Video
    ↓
Backend (yt-dlp)
    ↓
Audio Stream URL
    ↓
Frontend (HTML5 Player)
    ↓
🎵 Music Playing!
```

## Troubleshooting

**Backend won't start?**
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Try a different port
PORT=3001 npm start
```

**Stream extraction taking too long?**
- First extraction takes 5-15 seconds (normal!)
- Subsequent plays are faster
- Check backend logs for errors

**No sound or error message?**
- Make sure backend is running
- Check browser console (F12)
- Video might be age-restricted or region-blocked

## Files Changed

- ✨ `backend/server.js` - NEW backend service
- ✨ `src/components/YouTubeAudioPlayer.jsx` - NEW audio player
- ✨ `src/lib/youtubeStreamService.js` - NEW service layer
- 📝 `src/components/HomeSection.jsx` - UPDATED to use new player
- 📝 `src/components/icons.jsx` - ADDED VolumeX icon
- 📝 `.env.example` - ADDED VITE_BACKEND_URL

## For Production

When deploying:
1. Build frontend: `npm run build`
2. Deploy backend to your server
3. Update `VITE_BACKEND_URL` to your backend URL
4. Make sure yt-dlp is installed on the server

See `BACKEND_SETUP.md` for detailed setup instructions.

## No API Keys Needed! 🎉

You don't need:
- ❌ YouTube Data API key
- ❌ OAuth tokens
- ❌ YouTube Premium

The backend uses **yt-dlp** (open-source, free, no authentication needed).

---

**Questions?** Check `BACKEND_SETUP.md` for detailed documentation.

Happy DJ-ing! 🎧
