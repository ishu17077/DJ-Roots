# 🎧 DJ Roots - Interactive Crowd DJ System

**Crowd Vibes. You Control.** 

DJ Roots is a highly interactive, real-time audio streaming platform that allows a crowd to democratically control the vibe. Users can join a room, queue YouTube tracks, upvote/downvote songs, and experience a synchronized audio stream across all connected devices—all in a visually stunning 3D interface.

> [!NOTE] 
> **For Judges / Reviewers**: This project features a robust **Local Backend + Tunnel** setup to bypass YouTube's aggressive bot detection (Po-Token) and geo-blocking that typically break standard cloud deployments (like Render or Heroku). 

---

## ✨ Key Features (What makes this special)

1. **Real-Time Synchronization**: Built on Supabase, the queue, currently playing track, and votes are synced with near-zero latency across all devices in a room.
2. **Democratic Queue**: The crowd votes on what plays next. The song with the most votes instantly moves to the top.
3. **Advanced Audio Extraction**: A custom Node.js backend wraps `yt-dlp` to extract high-quality audio directly from YouTube. It dynamically applies the `android_vr` client to bypass YouTube's latest Proof-of-Origin (Po-Token) checks.
4. **DJ Gestures (Webcam Mode)**: Step away from the keyboard! Use your webcam and hand gestures (powered by MediaPipe) to:
   - **Thumbs Up / Down**: Vote on the current playing track.
   - **Pinch & Drag**: Adjust the global volume.
   - **Swipe Left / Right**: Skip to the next or previous tracks.
5. **Autoplay Compliance**: A slick "Enter World" overlay ensures that browsers don't block the synchronized audio playback.

---

## 🛠️ Quick Start Guide for Judges

To fully experience the application, you need to run **both** the frontend and the backend locally. Running the backend on your residential IP ensures YouTube won't block the extraction requests!

### 1. Environment Setup

**Frontend (`/.env`)**
Create a `.env` file in the root of the project:
```env
# Create a free Supabase project and get these keys
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# The local Express Backend URL
VITE_BACKEND_URL=http://localhost:5000
```

**Backend (`/backend/.env`)**
Create a `.env` file inside the `/backend` folder:
```env
PORT=5000
# Allow your local frontend to hit the backend
CORS_HOSTS=http://localhost:5173

# (OPTIONAL) Path to your YouTube cookies.txt file. 
# Only required if you are hosting on a Cloud VPS and need to bypass bot checks.
# If running locally on your PC, you DO NOT need cookies!
# YOUTUBE_COOKIES_PATH=./cookies.txt
```

### 2. Start the Backend (Audio Extraction Engine)
The backend requires `python3` and the `yt-dlp` package to extract audio from YouTube.

First, install `yt-dlp` globally on your machine:
```bash
# Depending on your OS, you may need to use pip3 instead of pip
pip install -U yt-dlp
```
*(Verify it installed correctly by running `yt-dlp --version`)*

Next, start the Node.js backend:
```bash
cd backend
npm install
npm run dev
```
*(The backend will run on `http://localhost:5000`)*

### 3. Start the Frontend (React Application)
Open a new terminal window at the root of the project:
```bash
npm install
npm run dev
```
*(The frontend will run on `http://localhost:5173`)*

---

## 🎮 How to Test / Evaluate

1. Open `http://localhost:5173` in your browser.
2. **Sign Up / Log In**: Use any email (Supabase auth will handle it).
3. **Create a Room**: Enter your DJ name to create a new room. You are now the Host.
4. **Add Songs**: Click "Add Song", search for a track, or pick from the trending pool.
5. **Start the Party**: Click the neon **"ENTER DJ ROOTS"** overlay to bypass browser audio restrictions. The music will immediately start streaming and visualizing.
6. **Test the Sync**: Open a *second* browser window (Incognito), log in with a different account, and "Join Room" using the Room Code displayed in the top right of the host's screen.
7. **Vote**: Vote on tracks from the second window and watch the queue reorder in real-time on the host's screen!
8. **Try Gestures**: Click the Webcam icon (top right) to enable DJ Mode. Give a thumbs up to the camera and watch your vote register!

---

## 📦 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, GSAP, Three.js
- **Backend**: Node.js, Express, `youtube-dl-exec` (yt-dlp)
- **Database / Auth**: Supabase (PostgreSQL, Realtime Subscriptions)
- **Machine Learning**: Google MediaPipe Tasks Vision

---
*Built with ❤️ for the ultimate collaborative listening experience.*
