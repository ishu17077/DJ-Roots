import React from 'react';
import ParticleAirpods from './ParticleAirpods';

const Activity = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);

const ArrowRight = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

const ChevronDown = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="relative h-screen w-screen bg-[#030108] text-white overflow-hidden selection:bg-pink-500/30" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        @keyframes float3d {
          0%, 100% { transform: translateY(0px) scale(0.9) translateX(5%); }
          50% { transform: translateY(-30px) scale(0.9) translateX(5%); }
        }
        .animate-float3d { animation: float3d 6s ease-in-out infinite; }
        
        @keyframes pulse-eq {
          0%, 100% { transform: scaleY(1); opacity: 0.8; }
          50% { transform: scaleY(0.4); opacity: 0.3; }
        }
        .animate-pulse-eq { animation: pulse-eq 1s ease-in-out infinite alternate; transform-origin: bottom; }
      `}</style>
      
      {/* Global Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-900/5 blur-[150px] pointer-events-none"></div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 lg:p-10 flex items-center gap-4 z-50">
        <div className="flex items-center gap-[3px] text-pink-500 h-8">
          <div className="w-[3px] h-3 bg-current rounded-full"></div>
          <div className="w-[3px] h-5 bg-current rounded-full"></div>
          <div className="w-[3px] h-7 bg-current rounded-full"></div>
          <div className="w-[3px] h-4 bg-current rounded-full"></div>
          <div className="w-[3px] h-2 bg-current rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-[1.1rem] font-bold tracking-widest leading-none mb-1">DJ ROOTS</h1>
          <p className="text-[0.65rem] text-gray-400 tracking-wider">Crowd Vibes. You Control.</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center h-full px-6 lg:px-20 max-w-[1600px] mx-auto">
        
        {/* Left Typography Section */}
        <div className="w-full lg:w-[45%] pt-32 lg:pt-0 z-20 flex flex-col items-start">
          <h2 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.1] tracking-tight mb-2 relative">
            The music <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#b372ff] via-[#d946ef] to-[#ec4899] block pb-1">
              is better
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#b372ff] via-[#d946ef] to-[#ec4899] block pb-2">
              together.
            </span>
          </h2>
          
          {/* Custom SVG Underline */}
          <svg className="w-48 lg:w-64 h-3 lg:h-5 -mt-2 lg:-mt-3 mb-10 text-[#a855f7] opacity-80 ml-1" viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 15 Q 60 2 120 10 T 195 5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          </svg>

          <p className="text-gray-300 text-lg lg:text-xl mb-12 max-w-[420px] font-light leading-relaxed">
            Create a room, add your favorite songs, and let the crowd decide what plays next.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button onClick={onGetStarted} className="w-full sm:w-auto group relative flex items-center justify-center gap-3 bg-gradient-to-r from-[#9333ea] to-[#ec4899] hover:from-[#a855f7] hover:to-[#f472b6] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] cursor-target">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <Activity size={20} className="relative z-10" /> 
              <span className="relative z-10">Get Started</span>
            </button>
            
            <button onClick={onGetStarted} className="w-full sm:w-auto group flex items-center justify-center gap-3 bg-[#0a0514]/80 backdrop-blur-md border border-purple-500/20 hover:bg-[#150a29] hover:border-purple-500/40 text-white px-10 py-4 rounded-xl font-medium transition-all duration-300 cursor-target">
              Login 
              <ArrowRight size={18} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* Right Graphic Section (Solid 3D Sphere) */}
        <div className="absolute right-[-10%] lg:right-[5%] top-[55%] lg:top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] pointer-events-none hidden md:block z-0 perspective-[1200px] flex items-center justify-center">
          
          {/* Ambient Glow Behind AirPods (Dimmed for darker background) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] lg:w-[500px] lg:h-[500px] bg-gradient-to-tr from-[#9333ea]/10 to-[#ec4899]/10 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Interactive Particle Animation & AirPods */}
          <ParticleAirpods />
        </div>

      </main>

    </div>
  );
};

export default LandingPage;
