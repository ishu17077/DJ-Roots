import {
  ChevronLeft,
  ChevronRight,
  Info,
  Link,
  Music,
  PlayCircle,
  Plus,
  Search,
} from './icons.jsx';

export default function AddSongSection({
  activeAddTab,
  setActiveAddTab,
  searchFilterText,
  setSearchFilterText,
  filteredTrending,
  addSongFromPool,
  playSongFromPool,
  songLinkInput,
  setSongLinkInput,
  handleAddTrackByUrl,
  isLoadingYutubeUrl,
  addToast,
  currentTrack,
  waveformBars,
  isPlaying,
  audioElapsedSeconds,
  formatTime,
  upNextList,
  recentlyPlayed = [],
}) {
  const filteredRecent = recentlyPlayed.filter(song =>
    song.title.toLowerCase().includes(searchFilterText.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchFilterText.toLowerCase())
  );
  return (
    <>
      <main className="flex-1 flex flex-col gap-4 min-h-0">
        <section className="bg-zinc-950/40 border border-zinc-900/80 p-6 rounded-2xl flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar gap-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/15 text-violet-400 border border-violet-500/20">
              <Music className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-wider text-white uppercase">Add Song</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">Add songs to the queue and let the crowd decide.</p>
            </div>
          </div>

          <div className="flex gap-4 border-b border-zinc-900 pb-1">
            {[
              ['search', 'Trending'],
              ['url', 'URL'],
              ['library', 'Recently Played'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveAddTab(tab)}
                className={`text-xs font-extrabold pb-2 transition-all relative ${activeAddTab === tab ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {label}
                {activeAddTab === tab ? <span className="absolute bottom-0 inset-x-0 h-[2px] bg-violet-500 rounded-full" /> : null}
              </button>
            ))}
          </div>

          {activeAddTab !== 'url' ? (
            <>
              <div className="relative mb-5">
                <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchFilterText}
                  onChange={(e) => setSearchFilterText(e.target.value)}
                  placeholder="Search for a song, artist or album..."
                  className="w-full bg-[#08080f]/90 border border-zinc-800/80 focus:border-violet-500/80 rounded-xl pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none placeholder-zinc-500 tracking-wide transition-all"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-wider text-white uppercase">
                    {activeAddTab === 'library' ? 'Recently Played' : 'Trending Right Now'}
                  </h3>
                  <div className="flex gap-1.5">
                    <button onClick={() => addToast('Carousel Scroll', 'Displaying previous page.')} className="p-1 rounded bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-white transition-all">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => addToast('Carousel Scroll', 'Displaying next page.')} className="p-1 rounded bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-white transition-all">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                  {(activeAddTab === 'library' ? filteredRecent : filteredTrending).length > 0 ? (
                    (activeAddTab === 'library' ? filteredRecent : filteredTrending).map((song) => (
                      <div key={song.id} className="bg-zinc-900/10 border border-zinc-900 p-2 rounded-xl flex flex-col justify-between gap-3 group hover:border-zinc-800 transition-all">
                        <div className="space-y-2">
                          <div className="aspect-square w-full rounded-lg overflow-hidden relative">
                            <img src={song.img} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate leading-snug">{song.title}</h4>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{song.artist}</p>
                          </div>
                        </div>
                        {activeAddTab === 'library' ? (
                          <button
                            onClick={() => playSongFromPool(song)}
                            className="w-full bg-violet-600 border border-violet-500 hover:bg-violet-500 hover:text-white text-[10px] font-black py-1.5 rounded-lg text-white transition-all flex items-center justify-center gap-1 shadow-md shadow-violet-900/50"
                          >
                            <PlayCircle className="w-3.5 h-3.5" /> Play
                          </button>
                        ) : (
                          <div className="flex gap-1.5 w-full">
                            <button
                              onClick={() => addSongFromPool(song)}
                              className="flex-1 bg-violet-600/10 border border-violet-500/20 hover:bg-violet-600 hover:text-white text-[10px] font-black py-1.5 rounded-lg text-violet-400 transition-all flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add
                            </button>
                            <button
                              onClick={() => playSongFromPool(song)}
                              className="flex-1 bg-violet-600 border border-violet-500 hover:bg-violet-500 hover:text-white text-[10px] font-black py-1.5 rounded-lg text-white transition-all flex items-center justify-center gap-1 shadow-md shadow-violet-900/50"
                            >
                              <PlayCircle className="w-3.5 h-3.5" /> Play
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-5 text-center py-6 text-zinc-500 text-xs">
                      {activeAddTab === 'library' ? 'No recently played tracks yet.' : 'No matching tracks found.'}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {activeAddTab === 'url' || activeAddTab === 'search' ? (
            <>
              {activeAddTab === 'search' ? (
                <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-extrabold uppercase tracking-widest my-1">
                  <div className="flex-1 h-[1px] bg-zinc-900" />
                  <span>or</span>
                  <div className="flex-1 h-[1px] bg-zinc-900" />
                </div>
              ) : null}

          <form onSubmit={handleAddTrackByUrl} className="border border-dashed border-violet-500/10 hover:border-violet-500/20 bg-violet-950/2 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 justify-between transition-all">
            <div className="flex items-center gap-4.5">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-400">
                <Link className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Add Song via YouTube</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Paste any YouTube video link (youtube.com or youtu.be) • No ads!</p>
              </div>
            </div>

            <div className="flex-1 w-full sm:w-auto flex items-center gap-2">
              <input
                type="text"
                value={songLinkInput}
                onChange={(e) => setSongLinkInput(e.target.value)}
                placeholder="Paste song link here..."
                disabled={isLoadingYutubeUrl}
                className="flex-1 bg-[#06060c] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/60 placeholder-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                type="submit" 
                disabled={isLoadingYutubeUrl}
                className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-700 disabled:opacity-50 text-white font-extrabold text-[10px] tracking-wider uppercase px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow shadow-violet-600/20 disabled:cursor-not-allowed"
              >
                {isLoadingYutubeUrl ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Add to Queue <PlayCircle className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 bg-zinc-900/10 border border-zinc-900 px-4 py-3.5 rounded-xl">
            <Info className="w-4 h-4 text-violet-400" />
            <span className="text-[11px] text-zinc-400 font-medium">YouTube videos play without ads. Share any valid YouTube link and it will be instantly processed with full metadata.</span>
          </div>
            </>
          ) : null}
        </section>
      </main>

      <aside className="w-80 flex flex-col gap-4 min-h-0 overflow-y-auto no-scrollbar flex-shrink-0">
        <section className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-3.5">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Now Playing</span>
          <div className="flex items-center gap-3">
            <img src={currentTrack.img} alt="Mini Cover" className="w-10 h-10 rounded-lg object-cover ring-2 ring-violet-500/10" />
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold text-white truncate">{currentTrack.title}</h4>
              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{currentTrack.artist}</p>
            </div>
          </div>
          <div className="h-6 flex items-end gap-[2px] pt-1">
            {waveformBars.slice(0, 26).map((h, i) => (
              <div key={i} className="flex-1 bg-violet-500/60 rounded-full transition-all duration-300" style={{ height: isPlaying ? `${Math.min(20, h)}px` : '3px' }} />
            ))}
          </div>
          <div className="flex justify-between items-center text-[11px] text-zinc-500 font-medium">
            <span className="hud-font">{formatTime(audioElapsedSeconds)}</span>
            <span className="hud-font">{formatTime(currentTrack.duration)}</span>
          </div>
        </section>

        <section className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-3">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Up Next</span>
          <div className="space-y-3">
            {upNextList.map((song, i) => (
              <div key={song.id} className="flex items-center gap-2.5 min-w-0">
                <span className="hud-font text-xs font-bold text-zinc-500 w-3">{i + 2}</span>
                <img src={song.img} alt="Upcoming" className="w-7 h-7 rounded object-cover" />
                <div className="min-w-0">
                  <h5 className="text-[11px] font-bold text-white truncate">{song.title}</h5>
                  <p className="text-[9px] text-zinc-500 truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>


      </aside>
    </>
  );
}
