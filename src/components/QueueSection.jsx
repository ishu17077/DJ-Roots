import { 
  ChevronDown, 
  MoreVertical, 
  Zap, 
  ThumbsUp, 
  ThumbsDown, 
  Play, 
  Trash2, 
  Shuffle, 
  Music 
} from './icons.jsx';

export default function QueueSection({
  sortedAndFilteredQueue,
  searchFilterText,
  setSearchFilterText,
  voteSong,
  queueList,
  setQueueList,
  currentTrack,
  audioElapsedSeconds,
  formatTime,
  waveformBars,
  isPlaying,
  skipUpvotes,
  skipDownvotes,
  skipThreshold,
  setShowAddModal,
  toggleShuffle
}) {
  const upNextTracks = sortedAndFilteredQueue.filter(t => currentTrack && t.id !== currentTrack.id).slice(0, 3);

  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full">
        
        {/* LEFT COLUMN: QUEUE LIST */}
        <div className="xl:col-span-8 flex flex-col h-full bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-6 relative overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-extrabold text-white tracking-wider">QUEUE</h2>
              <span className="bg-violet-900/40 text-violet-300 text-xs font-bold px-3 py-1 rounded-full border border-violet-500/20">
                {sortedAndFilteredQueue.length} Songs
              </span>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <Music className="w-4 h-4" />
              Add Song
            </button>
          </div>

          {/* Filters & Tabs */}
          <div className="flex items-center gap-8 mb-4 border-b border-zinc-800/60 pb-3">
            <button className="text-violet-400 text-sm font-bold relative pb-3 border-b-2 border-violet-500 -mb-[14px]">
              Upcoming
            </button>
            <button className="text-zinc-500 hover:text-zinc-300 text-sm font-bold pb-3 -mb-[14px] transition-colors">
              History
            </button>
            <div className="ml-auto flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 cursor-pointer hover:border-zinc-700 transition-colors">
              <span className="text-xs text-zinc-400 font-semibold">Sorted by: Votes</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/60 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-12 text-center">#</th>
                  <th className="pb-3">Song</th>
                  <th className="pb-3 hidden sm:table-cell">Added By</th>
                  <th className="pb-3 text-center">Votes</th>
                  <th className="pb-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredQueue.map((track, idx) => {
                  const isNowPlaying = currentTrack && currentTrack.id === track.id;
                  
                  return (
                    <tr key={track.id} className={`group border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-all ${isNowPlaying ? 'bg-violet-900/10 border-violet-500/20' : ''}`}>
                      
                      {/* Rank / Play Icon */}
                      <td className="py-4 pl-2 text-center align-middle">
                        {isNowPlaying ? (
                          <div className="flex items-center justify-center">
                            <Play className="w-4 h-4 text-violet-400 fill-violet-400" />
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-400 font-bold">{idx + 1}</span>
                        )}
                      </td>

                      {/* Song Info */}
                      <td className="py-4 align-middle">
                        <div className="flex items-center gap-4">
                          <img src={track.img} alt="Cover" className="w-12 h-12 rounded-xl object-cover shadow-md" />
                          <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-bold truncate max-w-[140px] sm:max-w-[200px] ${isNowPlaying ? 'text-white' : 'text-zinc-200 group-hover:text-white transition-colors'}`}>
                                {track.title}
                              </h4>
                              {isNowPlaying && (
                                <span className="bg-violet-600/20 border border-violet-500/30 text-violet-400 text-[9px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                                  <div className="flex items-end gap-0.5 h-2">
                                    <div className="w-[2px] bg-violet-400 h-[40%] rounded-full animate-bounce"></div>
                                    <div className="w-[2px] bg-violet-400 h-[80%] rounded-full animate-bounce delay-75"></div>
                                    <div className="w-[2px] bg-violet-400 h-[100%] rounded-full animate-bounce delay-150"></div>
                                    <div className="w-[2px] bg-violet-400 h-[60%] rounded-full animate-bounce delay-75"></div>
                                  </div>
                                  Now Playing
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 truncate max-w-[140px] sm:max-w-[200px] mt-0.5">{track.artist}</p>
                          </div>
                        </div>
                      </td>

                      {/* Added By */}
                      <td className="py-4 hidden sm:table-cell align-middle">
                        <div className="flex items-center gap-3">
                          <img src={track.userAvatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&q=80'} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-300">{track.addedBy}</span>
                            <span className="text-[10px] text-zinc-600">{((idx * 5) + 2) % 15 + 1}m ago</span>
                          </div>
                        </div>
                      </td>

                      {/* Votes Score */}
                      <td className="py-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`hud-font text-sm font-bold ${track.votes > 0 ? 'text-emerald-400' : track.votes < 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                            {track.votes > 0 ? '+' : ''}{track.votes}
                          </span>
                          {track.votes > 0 ? (
                            <ArrowUpTrend className="w-4 h-4 text-emerald-400" />
                          ) : track.votes < 0 ? (
                            <ArrowDownTrend className="w-4 h-4 text-rose-400" />
                          ) : null}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right pr-2 align-middle">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => voteSong(track.id, 1)} className="p-1.5 rounded-lg border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-500 transition-all group/btn">
                            <ThumbsUp className="w-4 h-4 group-active/btn:scale-90 transition-transform" />
                          </button>
                          <button onClick={() => voteSong(track.id, -1)} className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/30 hover:bg-rose-500/10 text-rose-500 transition-all group/btn">
                            <ThumbsDown className="w-4 h-4 group-active/btn:scale-90 transition-transform" />
                          </button>
                          <button className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors ml-2">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
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

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="xl:col-span-4 flex flex-col gap-5 h-full overflow-y-auto no-scrollbar">
          
          {/* NOW PLAYING CARD REMOVED */}

          {/* VOTE TO SKIP CARD */}
          <div className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-5 shadow-lg">
            <h3 className="text-[10px] text-violet-400 font-bold uppercase tracking-widest mb-2">Vote to Skip</h3>
            <p className="text-xs text-zinc-400 mb-4">Downvote to skip this song</p>
            
            <div className="h-2 w-full bg-zinc-900 rounded-full flex overflow-hidden mb-4 border border-zinc-800">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(skipUpvotes / (skipUpvotes + skipDownvotes || 1)) * 100}%` }}></div>
              <div className="bg-rose-500 h-full transition-all" style={{ width: `${(skipDownvotes / (skipUpvotes + skipDownvotes || 1)) * 100}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                <span className="hud-font text-emerald-500 text-sm font-bold">{skipUpvotes}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hud-font text-rose-500 text-sm font-bold">{skipDownvotes}</span>
                <ThumbsDown className="w-4 h-4 text-rose-500" />
              </div>
            </div>
            
            <div className="text-[10px] text-zinc-500 font-medium">
              Need {Math.max(0, skipThreshold - skipDownvotes)} more downvotes to skip
            </div>
          </div>

          {/* UP NEXT AND QUEUE ACTIONS CARDS REMOVED */}

        </div>
      </div>
    </main>
  );
}

function ArrowUpTrend({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );
}

function ArrowDownTrend({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}
