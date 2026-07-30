import React, { useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function About({ profile }) {
  const tiltRef = useRef(null);

  useEffect(() => {
    if (tiltRef.current && window.VanillaTilt) {
      window.VanillaTilt.init(tiltRef.current, {
        max: 5,
        speed: 400,
        glare: true,
        'max-glare': 0.2
      });
    }
    return () => {
      if (tiltRef.current && tiltRef.current.vanillaTilt) {
        tiltRef.current.vanillaTilt.destroy();
      }
    };
  }, []);

  const getFullImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('/uploads')) return img;
    return `${API_BASE}/${img}`;
  };

  return (
    <section id="about" className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white reveal">
          <span className="text-gradient">About</span> Me
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div 
            ref={tiltRef} 
            className="reveal relative group rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 border border-white/20 rounded-2xl z-20 pointer-events-none"></div>
            {profile?.coverImage && (
              <img 
                src={getFullImageUrl(profile.coverImage)} 
                alt={`${profile.name} working on creative designs`} 
                className="w-full rounded-2xl filter brightness-100 dark:brightness-90 group-hover:brightness-100 transition-all duration-500 transform group-hover:scale-105"
              />
            )}
          </div>
          
          <div className="reveal glass-card bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-lg dark:shadow-none text-left">
            <h3 className="font-display text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {profile?.aboutHeading || 'A Passionate Tech Prototyper'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-lg font-light">
              {profile?.aboutText1}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed text-lg font-light">
              {profile?.aboutText2}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none">
                <i className="fas fa-palette text-brand-light text-3xl mb-3"></i>
                <p className="font-bold text-sm text-gray-900 dark:text-white tracking-wide">Creative Design</p>
              </div>
              <div className="glass-card bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none">
                <i className="fas fa-microchip text-pink-500 dark:text-pink-400 text-3xl mb-3"></i>
                <p className="font-bold text-sm text-gray-900 dark:text-white tracking-wide">Hardware Dev</p>
              </div>
              <div className="glass-card bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none">
                <i className="fas fa-users-viewfinder text-blue-500 dark:text-blue-400 text-3xl mb-3"></i>
                <p className="font-bold text-sm text-gray-900 dark:text-white tracking-wide">Coordination</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
