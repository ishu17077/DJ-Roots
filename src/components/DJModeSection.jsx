import {
  ChevronDown,
  ChevronUp,
  Headphones,
  Plus,
  Search,
  Shuffle,
  Video,
  VideoOff,
} from './icons.jsx';

export default function DJModeSection({
  interactiveScreenRef,
  videoRef,
  webcamActive,
  toggleWebcam,
  simulateGesture,
  handleInteractiveMouseMove,
  handleInteractiveMouseDown,
  hypeModeOn,
  spectrumHeights,
  hasMovedMouse,
  mouseCoords,
  sortedAndFilteredQueue,
  currentTrack,
  selectTrack,
  voteSong,
  searchFilterText,
  setSearchFilterText,
  setShowAddModal,
  queueList,
  toggleShuffle,
}) {
  return (
    <>
      <main className="flex-1 bg-zinc-950/20 backdrop-blur-xl border border-zinc-900/80 rounded-2xl overflow-hidden flex flex-col min-h-0 relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-violet-600/10 text-violet-400 border border-violet-500/30 px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest z-30 flex items-center gap-1.5 shadow-lg pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping"></span>
          DJ Workspace Active
        </div>

        <div
          ref={interactiveScreenRef}
          onMouseMove={handleInteractiveMouseMove}
          onMouseDown={handleInteractiveMouseDown}
          className="flex-1 relative cursor-crosshair overflow-hidden flex items-center justify-center bg-[#04040a]"
        >
          {/* Corner Brackets properly framing the video area */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-violet-500/40 pointer-events-none z-20"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-violet-500/40 pointer-events-none z-20"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-violet-500/40 pointer-events-none z-20"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-violet-500/40 pointer-events-none z-20"></div>

          {/* Persistent Camera Toggle Button */}
          <div className="absolute top-4 left-4 pl-6 pt-1 z-30 pointer-events-auto">
            <button onClick={toggleWebcam} className="px-3 py-1.5 rounded-xl text-[10px] font-extrabold bg-zinc-900/80 backdrop-blur-md border border-violet-500/30 text-white hover:bg-violet-600 transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              {webcamActive ? (
                <>
                  <VideoOff className="w-3.5 h-3.5 text-red-400" /> Disable AI Camera Tracker
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5 text-violet-400" /> Enable AI Camera Tracker
                </>
              )}
            </button>
          </div>

          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${webcamActive ? 'block' : 'hidden'}`}
            autoPlay
            playsInline
            muted
          />

          <div className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-300 ${webcamActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06)_0%,transparent_65%)]"></div>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#1e1e2f 1px, transparent 1px), linear-gradient(90deg, #1e1e2f 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="relative z-10">
              <div className="w-40 h-40 rounded-full bg-zinc-900/60 border-2 border-violet-500/30 relative flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-2xl transition-transform duration-500">
                <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=450&q=80" alt="Room bg" className="absolute inset-0 w-full h-full object-cover opacity-35" />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-950/70 via-transparent to-transparent"></div>
                <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/40 relative z-10">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-bold tracking-widest text-zinc-300 uppercase">Gesture Space Virtual Room</h3>
              <p className="text-[10px] text-zinc-500 mt-1 max-w-sm mx-auto">Click and drag across this dark canvas to generate expanding neon ripple chords.</p>
            </div>
          </div>


          <div className="absolute top-4 right-4 z-20 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 p-3.5 rounded-xl w-48 text-[11px] shadow-xl">
            <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider mb-2">Gesture Guide</span>
            <div className="space-y-1.5">
              {[
                ['swiperight', '👍 Thumb Up', 'Next'],
                ['swipeleft', '👎 Thumb Down', 'Prev'],
                ['fist', '✊ Closed Fist', 'Mute'],
                ['palmup', '🖐️ Open Palm', 'Vol +'],
                ['palmdown', '☝️ Pointing Up', 'Vol -'],
              ].map(([type, label, action]) => (
                <div key={type} onClick={() => simulateGesture(type)} className="flex items-center justify-between hover:bg-zinc-900/50 p-1.5 rounded cursor-pointer transition-all">
                  <span className="text-zinc-400">{label}</span>
                  <span className="bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded text-[8px] font-bold">{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 bg-violet-600/10 border-y border-violet-500/30 py-4 text-center z-20 pointer-events-none transition-all duration-300 ${hypeModeOn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <span className="hud-font text-white text-xl font-black tracking-widest">HYPE MODE LEVEL MAX</span>
            <p className="text-[9px] text-zinc-300 font-semibold mt-1">Sensors mapped to live virtual audience.</p>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-2 bg-zinc-950/70 backdrop-blur-md border border-zinc-900/80 p-3 rounded-xl">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1">
              <span className="hud-font uppercase text-violet-400 tracking-wider font-bold">Live Spectrum Analyzer</span>
              <span className="hud-font">FREQ GAIN: +12dB</span>
            </div>
            <div className="flex items-end gap-1 h-8 justify-between w-full">
              {spectrumHeights.map((ht, idx) => (
                <div key={idx} className="flex-1 bg-gradient-to-t from-violet-600 via-violet-500 to-emerald-400 rounded-full transition-all duration-300" style={{ height: `${ht}px` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500">
          <span className="hud-font">
            {hasMovedMouse ? `G-SENSOR TRACKER: ACTIVE (x: ${mouseCoords.x}, y: ${mouseCoords.y})` : 'G-SENSOR TRACKER: WAITING FOR POSITION'}
          </span>
          <span className="hud-font">LATENCY: 4.2ms | FPS: 60</span>
        </div>
      </main>

      <aside className="w-80 bg-zinc-950/40 backdrop-blur-xl border border-zinc-900/80 rounded-2xl flex flex-col min-h-0 flex-shrink-0 overflow-hidden">
        <div className="p-4 border-b border-zinc-900/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Playlist Deck</span>
            <h3 className="text-xs font-extrabold text-white mt-0.5">Song Queue</h3>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Song
          </button>
        </div>

        <div className="p-3 border-b border-zinc-900/40 bg-zinc-950/20">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search playlist tracks..."
              value={searchFilterText}
              onChange={e => setSearchFilterText(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-violet-500 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-white focus:outline-none placeholder-zinc-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {sortedAndFilteredQueue.map((song) => (
            <div
              key={song.id}
              onClick={() => selectTrack(song.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${song.id === currentTrack.id ? 'bg-gradient-to-r from-violet-950/30 to-zinc-900/40 border-violet-500/20 shadow' : 'bg-zinc-900/20 border-transparent hover:border-zinc-850 hover:bg-zinc-900/40'}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={song.img} alt="Art" className="w-8 h-8 rounded-md object-cover" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-white truncate">{song.title}</span>
                  <span className="text-[9px] text-zinc-500 truncate">{song.artist}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`hud-font text-[9px] font-bold ${song.votes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {song.votes >= 0 ? '+' : ''}{song.votes}
                </span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={(e) => { e.stopPropagation(); voteSong(song.id, 1); }} className="p-0.5 rounded hover:bg-zinc-850 text-zinc-500 hover:text-emerald-400 transition-colors">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); voteSong(song.id, -1); }} className="p-0.5 rounded hover:bg-zinc-850 text-zinc-500 hover:text-red-400 transition-colors">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-zinc-950 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500">
          <span>Total Queued: <b className="text-white">{queueList.length}</b></span>
          <span onClick={toggleShuffle} className="cursor-pointer hover:text-white transition-all flex items-center gap-1">
            <Shuffle className="w-3 h-3 text-violet-400" /> Auto-Vibe Sort
          </span>
        </div>
      </aside>
    </>
  );
}
