import React, { useState, useMemo } from 'react';
import { 
  Users, Crown, Search, MoreVertical, Music, 
  ThumbsUp, Activity, Copy, Link, Share, ChevronRight, ChevronDown, Zap, Smile,
  WhatsApp, Instagram
} from './icons.jsx';

export default function PeopleSection({
  currentTrack,
  audioElapsedSeconds,
  formatTime,
  waveformBars,
  sortedAndFilteredQueue,
  setActiveView = () => {},
  copyRoomCode = () => {},
  addToast = () => {},
  isPlaying = false,
  roomCode = '',
  members = [],
  isHost = false,
  onUpdateRole = () => {},
}) {
  // Local state for PeopleSection
  const [activePeopleTab, setActivePeopleTab] = useState('all'); 
  const [peopleSearchText, setPeopleSearchText] = useState('');
  
  // Use real members data from Supabase
  const peopleList = members;

  const filteredPeople = useMemo(() => {
    return peopleList.filter(person => {
      if (activePeopleTab === 'dj-queue' && person.role !== 'Host' && person.role !== 'CO Host') return false;
      if (activePeopleTab === 'requests' && person.role !== 'Member') return false; 
      const matchesSearch = person.name.toLowerCase().includes(peopleSearchText.toLowerCase()) || 
                            (person.username || '').toLowerCase().includes(peopleSearchText.toLowerCase()) ||
                            (person.activity || '').toLowerCase().includes(peopleSearchText.toLowerCase());
      return matchesSearch;
    });
  }, [peopleList, activePeopleTab, peopleSearchText]);

  const upNextList = sortedAndFilteredQueue ? sortedAndFilteredQueue.slice(1, 4) : [];

  return (
    <>
      <main className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
        <section className="bg-zinc-950/40 border border-zinc-900/80 p-5 rounded-2xl flex-1 flex flex-col min-h-0 overflow-hidden gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-violet-600/15 text-violet-400 border border-violet-500/20">
                <Users className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-wider text-white uppercase">PEOPLE IN ROOM</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">See who's in the room and what they're up to.</p>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={peopleSearchText}
                onChange={(e) => setPeopleSearchText(e.target.value)}
                placeholder="Search people..." 
                className="bg-[#08080f] border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/60 placeholder-zinc-600 w-44 transition-all" 
              />
            </div>
          </div>



          <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 space-y-1 pr-1">
            <div className="grid grid-cols-12 text-[10px] font-extrabold text-zinc-500 px-4 py-2.5 uppercase tracking-wider border-b border-zinc-900/60 bg-zinc-900/5 rounded-lg mb-1.5">
              <div className="col-span-4">User</div>
              <div className="col-span-2 text-center">Role</div>
              <div className="col-span-3">Activity</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-1 text-right"></div>
            </div>

            {filteredPeople.map((person) => {
              return (
                <div 
                  key={person.id}
                  className="grid grid-cols-12 items-center p-3 rounded-xl border border-transparent bg-zinc-900/10 hover:border-zinc-850 hover:bg-zinc-900/20 transition-all cursor-default"
                >
                  <div className="col-span-4 flex items-center gap-3.5 min-w-0">
                    <img src={person.avatar} alt={person.name} className="w-9 h-9 rounded-lg object-cover ring-2 ring-violet-500/10 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white flex items-center gap-1 leading-tight">
                        {person.name}
                        {person.role === 'Host' && (
                          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate mt-0.5">{person.username}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    {person.role === 'Host' ? (
                      <span className="bg-violet-500/20 text-violet-400 border border-violet-500/10 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        Host
                      </span>
                    ) : person.role === 'CO Host' ? (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/10 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        CO Host
                      </span>
                    ) : (
                      <span className="bg-zinc-900/60 text-zinc-400 border border-zinc-800/80 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Member
                      </span>
                    )}
                  </div>

                  <div className="col-span-3 flex items-center gap-2">
                    {person.activityType === 'dj' && (
                      <>
                        <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span className="text-[11px] text-emerald-400 font-extrabold tracking-wide">{person.activity}</span>
                      </>
                    )}
                    {person.activityType === 'added_songs' && (
                      <>
                        <Music className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[11px] text-violet-400 font-semibold">{person.activity}</span>
                      </>
                    )}
                    {person.activityType === 'added_song' && (
                      <>
                        <Music className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[11px] text-violet-400 font-semibold">{person.activity}</span>
                      </>
                    )}
                    {person.activityType === 'voted' && (
                      <>
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[11px] text-emerald-500 font-semibold">{person.activity}</span>
                      </>
                    )}
                    {person.activityType === 'reacted_fire' && (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                        <span className="text-[11px] text-amber-500 font-semibold">{person.activity}</span>
                      </>
                    )}
                    {person.activityType === 'reacted_cool' && (
                      <>
                        <Smile className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] text-amber-400 font-semibold">{person.activity}</span>
                      </>
                    )}
                    {person.activityType === 'joined' && (
                      <span className="text-[11px] text-zinc-500 font-medium">{person.activity}</span>
                    )}
                  </div>

                  <div className="col-span-2">
                    <span className="text-xs text-zinc-500 font-semibold">{person.joined}</span>
                  </div>

                  <div className="col-span-1 text-right pr-2 flex justify-end relative">
                    {isHost && person.role !== 'Host' ? (
                      <select
                        value={person.role === 'CO Host' ? 'co_host' : 'member'}
                        onChange={(e) => {
                          onUpdateRole(person.profileId, e.target.value);
                          addToast('Role Updated', `${person.name} role updated.`);
                        }}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[9px] font-bold py-1 px-1.5 rounded focus:outline-none focus:border-violet-500 cursor-pointer"
                      >
                        <option value="member">Member</option>
                        <option value="co_host">CO Host</option>
                      </select>
                    ) : (
                      <button 
                        onClick={() => addToast('User Options', `Opening profile settings for ${person.name}`)}
                        className="text-zinc-600 hover:text-white p-1 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <aside className="w-80 flex flex-col gap-4 min-h-0 overflow-hidden flex-shrink-0">
        <section className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-3">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">INVITE TO ROOM</span>
          <p className="text-[10px] text-zinc-400">Share room code with your friends</p>

          <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 px-3.5 py-2 rounded-xl">
            <span className="hud-font text-white font-bold text-xs tracking-wider">{roomCode || 'ROOTS23'}</span>
            <button onClick={copyRoomCode} className="p-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600 border border-violet-500/20 text-violet-400 hover:text-white transition-all">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1.5">
            <button onClick={copyRoomCode} className="p-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
              <Link className="w-4 h-4" />
            </button>
            <button onClick={() => addToast('WhatsApp Share', 'Invite link dispatched.')} className="p-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
              <WhatsApp className="w-4 h-4" />
            </button>
            <button onClick={() => addToast('Instagram Share', 'Copied text for Instagram bio.')} className="p-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
              <Instagram className="w-4 h-4" />
            </button>
            <button onClick={() => addToast('Share Room', 'External navigator launched.')} className="p-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-3">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">DJ CONTROLS</span>
          <p className="text-[10px] text-zinc-400">Change DJ or manage DJ queue</p>

          <button 
            onClick={() => { setActiveView('queue'); addToast('Switch view', 'Opening live queue controls.'); }} 
            className="w-full bg-violet-600/10 hover:bg-violet-600 border border-violet-500/20 text-violet-400 hover:text-white text-[11px] font-extrabold uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-between px-4 group"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400 group-hover:text-white" /> Manage DJ Queue
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      </aside>
    </>
  );
}
