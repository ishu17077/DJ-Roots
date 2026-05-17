import { Settings, Volume2, Shield } from './icons.jsx';

export default function SettingsSection() {
  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-zinc-950/40 border border-zinc-900/80 p-5 rounded-2xl relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-zinc-700 to-zinc-900 flex items-center justify-center shadow-md">
          <Settings className="w-4 h-4 text-white animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Room Settings</h2>
          <p className="text-[10px] text-zinc-500">Configure your DJ Roots experience</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 space-y-8">
        
        {/* Playback Settings */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-800/60 pb-2">Playback Options</h3>
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Crossfade Tracks</h4>
                <p className="text-[10px] text-zinc-500">Smoothly blend between songs</p>
              </div>
              <div className="w-10 h-5 bg-violet-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Auto-Normalize Volume</h4>
                <p className="text-[10px] text-zinc-500">Keep all tracks at consistent loudness</p>
              </div>
              <div className="w-10 h-5 bg-zinc-800 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-zinc-500 rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Room Settings */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-800/60 pb-2 flex items-center gap-2">
            <Shield className="w-3 h-3" /> Permissions
          </h3>
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Allow Guest Additions</h4>
                <p className="text-[10px] text-zinc-500">Anyone in room can add songs</p>
              </div>
              <div className="w-10 h-5 bg-violet-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Require Vote Threshold to Skip</h4>
                <p className="text-[10px] text-zinc-500">Currently set to 15 downvotes</p>
              </div>
              <div className="w-10 h-5 bg-violet-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
