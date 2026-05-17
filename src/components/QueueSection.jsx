import {
  Music,
  Play,
  Zap,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
} from './icons.jsx';

export default function QueueSection({
  sortedAndFilteredQueue,
  searchFilterText,
  setSearchFilterText,
  voteSong,
  queueList,
  currentTrack,
  formatTime,
  isPlaying,
  setActiveView,
  activeRoomCode,
  isHost,
  selectTrack,
}) {
  // ─── ROOM MODE: Voting Interface ───────────────────────────────────────────
  if (activeRoomCode) {
    return (
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex flex-col h-full bg-zinc-950/40 border border-zinc-900/80 rounded-2xl overflow-hidden relative">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-zinc-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <ThumbsUp className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-wider">VOTE NEXT SONG</h2>
                <p className="text-[10px] text-zinc-500">Vote to shape what plays next</p>
              </div>
              <span className="bg-violet-900/40 text-violet-300 text-xs font-bold px-3 py-1 rounded-full border border-violet-500/20 ml-2">
                {sortedAndFilteredQueue.length} tracks
              </span>
            </div>
            <button
              onClick={() => setActiveView('add-song')}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Music className="w-3.5 h-3.5" /> Add Song
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-zinc-800/40">
            <input
              type="text"
              placeholder="Search songs..."
              value={searchFilterText}
              onChange={e => setSearchFilterText(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-violet-500 rounded-xl px-4 py-2 text-xs text-white focus:outline-none placeholder-zinc-600 transition-colors"
            />
          </div>

          {/* Voting Cards */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
            {sortedAndFilteredQueue.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
                <Music className="w-8 h-8 text-zinc-600" />
                <span className="text-zinc-500 text-sm font-bold">No songs in the queue yet</span>
                <button onClick={() => setActiveView('add-song')} className="text-violet-400 text-xs underline">Add the first one</button>
              </div>
            )}
            {sortedAndFilteredQueue.map((track, idx) => {
              const isNowPlaying = currentTrack && currentTrack.id === track.id;
              const isTop = idx === 0;
              return (
                <div
                  key={track.id}
                  className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    isNowPlaying
                      ? 'bg-gradient-to-r from-violet-950/50 to-fuchsia-950/30 border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                      : isTop
                      ? 'bg-zinc-900/60 border-zinc-700/50 shadow-md'
                      : 'bg-zinc-900/30 border-zinc-800/40 hover:border-zinc-700/60'
                  }`}
                >
                  {/* Rank badge */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                    isNowPlaying ? 'bg-violet-500 text-white' : isTop ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isNowPlaying ? <Play className="w-3 h-3 fill-white" /> : idx + 1}
                  </div>

                  {/* Cover */}
                  <img src={track.img || 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=80&q=80'} alt="Cover" className="w-12 h-12 rounded-xl object-cover shadow-md flex-shrink-0" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold truncate ${isNowPlaying ? 'text-white' : 'text-zinc-200'}`}>{track.title}</span>
                      {isNowPlaying && (
                        <span className="text-[9px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" /> Now Playing
                        </span>
                      )}
                      {isTop && !isNowPlaying && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">🔥 Up Next</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{track.artist}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">Added by <span className="text-zinc-400">{track.addedBy}</span></p>
                  </div>

                  {/* Vote Score (center) */}
                  <div className="flex flex-col items-center px-4">
                    <span className={`text-xl font-black hud-font ${track.votes > 0 ? 'text-emerald-400' : track.votes < 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                      {track.votes > 0 ? '+' : ''}{track.votes}
                    </span>
                    <span className="text-[9px] text-zinc-600 uppercase tracking-wider">votes</span>
                  </div>

                  {/* Vote Buttons & Host Controls */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {isHost && !isNowPlaying && (
                      <button
                        onClick={() => selectTrack(track.id)}
                        className="p-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 transition-all active:scale-90 flex items-center justify-center mb-1"
                      >
                        <Play className="w-4 h-4 fill-violet-400" />
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => voteSong(track.id, 1)}
                        className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 transition-all active:scale-90"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => voteSong(track.id, -1)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 transition-all active:scale-90"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-[11px] text-zinc-600 py-3 border-t border-zinc-800/50 flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 text-violet-500" />
            Highest voted song plays next · Songs at -5 get skipped
          </div>
        </div>
      </main>
    );
  }

  // ─── SINGLE MODE: Regular Queue Table ─────────────────────────────────────
  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="w-full flex flex-col h-full bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-6 relative overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-extrabold text-white tracking-wider">QUEUE</h2>
            <span className="bg-violet-900/40 text-violet-300 text-xs font-bold px-3 py-1 rounded-full border border-violet-500/20">
              {sortedAndFilteredQueue.length} Songs
            </span>
          </div>
          <button
            onClick={() => setActiveView('add-song')}
            className="flex items-center gap-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <Music className="w-4 h-4" /> Add Song
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/60 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2 w-12 text-center">#</th>
                <th className="pb-3">Song</th>
                <th className="pb-3 hidden sm:table-cell">Duration</th>
                <th className="pb-3 text-right pr-4">Play</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredQueue.map((track, idx) => {
                const isNowPlaying = currentTrack && currentTrack.id === track.id;
                return (
                  <tr key={track.id} className={`group border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-all ${isNowPlaying ? 'bg-violet-900/10 border-violet-500/20' : ''}`}>
                    <td className="py-4 pl-2 text-center align-middle">
                      {isNowPlaying
                        ? <div className="flex items-center justify-center"><Play className="w-4 h-4 text-violet-400 fill-violet-400" /></div>
                        : <span className="text-sm text-zinc-400 font-bold">{idx + 1}</span>
                      }
                    </td>
                    <td className="py-4 align-middle">
                      <div className="flex items-center gap-4">
                        <img src={track.img} alt="Cover" className="w-12 h-12 rounded-xl object-cover shadow-md" />
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-bold truncate max-w-[200px] ${isNowPlaying ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>{track.title}</h4>
                            {isNowPlaying && (
                              <span className="bg-violet-600/20 border border-violet-500/30 text-violet-400 text-[9px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                                <div className="flex items-end gap-0.5 h-2">
                                  <div className="w-[2px] bg-violet-400 h-[40%] rounded-full animate-bounce" />
                                  <div className="w-[2px] bg-violet-400 h-[80%] rounded-full animate-bounce delay-75" />
                                  <div className="w-[2px] bg-violet-400 h-[100%] rounded-full animate-bounce delay-150" />
                                </div>
                                Now Playing
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{track.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 hidden sm:table-cell align-middle">
                      <span className="text-xs font-bold text-zinc-300">{formatTime(track.duration)}</span>
                    </td>
                    <td className="py-4 text-right pr-4 align-middle">
                      <button 
                        onClick={() => selectTrack(track.id)}
                        className="p-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-500 transition-all cursor-pointer inline-flex items-center justify-center w-8 h-8"
                      >
                        <Play className="w-4 h-4 fill-violet-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sortedAndFilteredQueue.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <span className="text-zinc-500 text-sm font-bold">No tracks found.</span>
            </div>
          )}
        </div>

        <div className="text-center text-[11px] text-zinc-500 pt-4 mt-auto border-t border-zinc-800/50 flex items-center justify-center gap-2 font-medium">
          <Zap className="w-3.5 h-3.5 text-violet-500" />
          Songs with -5 or more votes will be skipped
        </div>
      </div>
    </main>
  );
}
