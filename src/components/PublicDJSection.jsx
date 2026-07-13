import React from 'react';

const RadioIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
  </svg>
);

const UsersIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PlayIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export default function PublicDJSection({
  publicRooms,
  onJoinRoom
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-6 custom-scrollbar backdrop-blur-md">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <RadioIcon className="w-5 h-5 text-violet-400 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Live Public Rooms</h2>
          <p className="text-xs text-zinc-400 mt-1">Discover and join live DJ sessions from around the globe.</p>
        </div>
      </div>

      {publicRooms && publicRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {publicRooms.map(room => (
            <div key={room.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden hover:border-violet-500/40 hover:bg-zinc-900/80 transition-all group flex flex-col">
              {/* Cover Art / Header Area */}
              <div className="relative h-32 bg-zinc-800/50 flex items-center justify-center overflow-hidden">
                {room.currentTrack?.img_url ? (
                  <>
                    <img src={room.currentTrack?.img_url} alt="Track Art" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-indigo-900/20 group-hover:scale-105 transition-transform duration-700" />
                )}
                
                {/* Host Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-lg p-1.5 flex items-center gap-2 border border-white/5">
                  <img src={room.host?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&q=80'} alt="DJ Avatar" className="w-6 h-6 rounded-md object-cover" />
                  <span className="text-[10px] font-bold text-white mr-1">{room.host?.name || 'DJ'}</span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE
                </div>

                {/* Play Button Overlay (Visible on Hover) */}
                <button 
                  onClick={() => onJoinRoom(room.code)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)] transform scale-90 group-hover:scale-100 transition-all">
                    <PlayIcon className="w-5 h-5 text-white ml-1" />
                  </div>
                </button>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-white truncate mb-1">{room.name}</h3>
                
                {/* Current Track Info */}
                <div className="flex-1 flex flex-col justify-center min-h-[3rem]">
                  {room.currentTrack?.title ? (
                    <div className="text-[11px] text-zinc-300 line-clamp-2 leading-tight">
                      <span className="text-violet-400 mr-1">▶</span>
                      {room.currentTrack?.title}
                      {room.currentTrack?.artist && <span className="text-zinc-500 ml-1">• {room.currentTrack?.artist}</span>}
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-600 italic">No track playing</div>
                  )}
                </div>

                {/* Footer Stats */}
                <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <UsersIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold">{room.memberCount} members</span>
                  </div>
                  <button 
                    onClick={() => onJoinRoom(room.code)}
                    className="text-[10px] text-violet-400 font-bold uppercase tracking-wider hover:text-violet-300 transition-colors"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl border-dashed">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <RadioIcon className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-zinc-400 font-bold mb-1">No Public Rooms</h3>
          <p className="text-zinc-600 text-[11px]">There are currently no live public sessions. Be the first to start one!</p>
        </div>
      )}
    </div>
  );
}
