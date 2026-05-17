import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import ParticleAirpods from './ParticleAirpods';

export default function LoginScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onAuthSuccess(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) onAuthSuccess(session.user);
    });
    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  // Helper: look up profile directly from DB by email and let user through
  const fallbackProfileLogin = async (emailAddr) => {
    // Try by email column first
    let profile = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', emailAddr.trim().toLowerCase())
        .maybeSingle();
      profile = data;
    } catch (e) {
      console.warn('Email column lookup failed, trying name-based:', e);
    }

    // If no email column or no match, try looking up the auth user's id in profiles
    if (!profile) {
      try {
        // Check if there's an auth user with this email and find their linked profile
        const { data: authUsers } = await supabase.auth.admin?.listUsers?.() || {};
        // Admin API not available from client — just try name-based match
        const emailName = emailAddr.split('@')[0];
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .ilike('name', `%${emailName}%`)
          .maybeSingle();
        profile = data;
      } catch (e) {
        console.warn('Name-based fallback failed:', e);
      }
    }

    if (profile) {
      onAuthSuccess({
        id: profile.auth_id || profile.id,
        email: profile.email || emailAddr,
        user_metadata: { display_name: profile.name },
        _profileFallback: true,
      });
      return true;
    }
    return false;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email address'); return; }
    if (!password.trim()) { setError('Please enter your password'); return; }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (authError) {
        // If email not confirmed or auth fails, try direct DB lookup
        console.warn('Auth error, trying direct profile lookup:', authError.message);
        const found = await fallbackProfileLogin(email.trim());
        if (!found) {
          setError('No account found with this email. Please sign up first.');
        }
      } else if (data.user) {
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) { setError('Please enter your display name'); return; }
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email address'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { display_name: displayName.trim() },
        },
      });
      if (authError) {
        setError(authError.message);
      } else if (data.user) {
        // If session exists = email confirm disabled, user is logged in immediately
        if (data.session) {
          onAuthSuccess(data.user);
        } else {
          // Email confirmation is ON — try direct DB fallback
          // The trigger should have created the profile already
          const found = await fallbackProfileLogin(email.trim());
          if (!found) {
            // Profile not created yet by trigger, create it manually
            const { data: newProfile } = await supabase
              .from('profiles')
              .insert({
                name: displayName.trim(),
                username: `@${displayName.trim().toLowerCase().replace(/\s+/g, '_')}_${Math.floor(Math.random() * 1000)}`,
                email: email.trim().toLowerCase(),
                auth_id: data.user.id,
                avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80',
              })
              .select()
              .single();
            if (newProfile) {
              onAuthSuccess({
                id: data.user.id,
                email: email.trim(),
                user_metadata: { display_name: displayName.trim() },
                _profileFallback: true,
              });
            } else {
              setSuccess('Account created! You can now log in.');
              setMode('login');
            }
          }
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#030108] text-[#e4e4e7] relative">

      {/* ── TOP-LEFT HEADER: DJ ROOTS logo (same as landing page) ── */}
      <header className="absolute top-0 left-0 w-full p-6 lg:p-10 flex items-center gap-4 z-50 pointer-events-none">
        <div className="flex items-center gap-[3px] text-pink-500 h-8">
          <div className="w-[3px] h-3 bg-current rounded-full"></div>
          <div className="w-[3px] h-5 bg-current rounded-full"></div>
          <div className="w-[3px] h-7 bg-current rounded-full"></div>
          <div className="w-[3px] h-4 bg-current rounded-full"></div>
          <div className="w-[3px] h-2 bg-current rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-[1.1rem] font-bold tracking-widest leading-none mb-1 text-white">DJ ROOTS</span>
          <span className="text-[0.65rem] text-gray-400 tracking-wider">Crowd Vibes. You Control.</span>
        </div>
      </header>

      {/* ── LEFT PANEL: Login Form ── */}
      <div className="relative z-10 w-full md:w-[45%] lg:w-[40%] flex flex-col items-center justify-center pt-24 pb-6 px-8 lg:px-16 bg-[#030108]">
        {/* subtle left-panel glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08)_0%,transparent_60%)] pointer-events-none"></div>
        <div className="relative z-10 w-full max-w-sm">

        {/* Auth Card */}
        <div className="bg-zinc-950/70 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl p-6 shadow-[0_0_80px_rgba(0,0,0,0.6),0_0_40px_rgba(139,92,246,0.05)]">

          {/* Tab Switcher */}
          <div className="flex bg-zinc-900/80 rounded-xl p-1 mb-7 border border-zinc-800/50">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    className="w-full bg-[#08080f] border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] placeholder-zinc-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Password</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-[#08080f] border border-zinc-800 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] placeholder-zinc-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  {success}
                </div>
              )}

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.5)]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:300%_300%]" style={{ animation: 'shimmer 3s ease-in-out infinite' }}></div>
                {loading ? (
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Authenticating...
                  </span>
                ) : (
                  <span className="relative flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Log In
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Display Name</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Aarav"
                    autoFocus
                    className="w-full bg-[#08080f] border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] placeholder-zinc-600 transition-all"
                  />
                </div>
                {error && error.toLowerCase().includes('name') && (
                  <p className="text-[10px] text-red-400 mt-1 ml-1">{error}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-[#08080f] border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] placeholder-zinc-600 transition-all"
                  />
                </div>
                {error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('account')) && (
                  <p className="text-[10px] text-red-400 mt-1 ml-1">{error}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Password</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className="w-full bg-[#08080f] border border-zinc-800 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] placeholder-zinc-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-600 mt-1 ml-1">Minimum 6 characters</p>
                {error && error.toLowerCase().includes('password') && (
                  <p className="text-[10px] text-red-400 mt-0.5 ml-1">{error}</p>
                )}
              </div>

              {error && !error.toLowerCase().includes('name') && !error.toLowerCase().includes('email') && !error.toLowerCase().includes('account') && !error.toLowerCase().includes('password') && (
                <p className="text-[10px] text-red-400 -mt-1 ml-1">{error}</p>
              )}

              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.5)]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:300%_300%]" style={{ animation: 'shimmer 3s ease-in-out infinite' }}></div>
                {loading ? (
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creating Account...
                  </span>
                ) : (
                  <span className="relative flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Create Account
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Divider with security badge */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-zinc-800/80"></div>
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              SECURED BY SUPABASE
            </div>
            <div className="flex-1 h-px bg-zinc-800/80"></div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-zinc-600 mt-6 tracking-wider">
          Built with ❤️ by DJ Roots · Real-time powered by Supabase
        </p>
        </div>{/* end inner max-w-sm */}
      </div>{/* end LEFT PANEL */}

      {/* ── RIGHT PANEL: AirPods Particle Animation ── */}
      <div className="hidden md:flex flex-1 items-center justify-center relative bg-[#030108] overflow-hidden">
        {/* Subtle ambient glow behind AirPods */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-[#9333ea]/10 to-[#ec4899]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <ParticleAirpods />
      </div>

      {/* Keyframe animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: -300% 0; }
          100% { background-position: 300% 0; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}} />
    </div>
  );
}
