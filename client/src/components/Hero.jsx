import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function Hero({ profile }) {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const words = profile?.typewriterTexts && profile.typewriterTexts.length > 0 
    ? profile.typewriterTexts 
    : ["Creative Builder", "Hardware Enthusiast", "Problem Solver"];

  useEffect(() => {
    let timer;
    const currentWord = words[wordIndex % words.length];

    const handleType = () => {
      if (!isDeleting) {
        setDisplayText((prev) => currentWord.substring(0, prev.length + 1));
        setTypingSpeed(100);

        if (displayText === currentWord) {
          // Pause at full word before deleting
          timer = setTimeout(() => setIsDeleting(true), 1500);
          return;
        }
      } else {
        setDisplayText((prev) => currentWord.substring(0, prev.length - 1));
        setTypingSpeed(50);

        if (displayText === '') {
          setIsDeleting(false);
          setWordIndex((prev) => prev + 1);
          setTypingSpeed(300); // pause before typing next word
        }
      }

      timer = setTimeout(handleType, typingSpeed);
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex, words, typingSpeed]);

  const getFullImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('/uploads')) return img;
    return `${API_BASE}/${img}`;
  };

  const socialLinks = profile?.socialLinks || {};

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left z-10 reveal active">
            <div className="inline-block px-4 py-1.5 rounded-full border border-gray-300 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md text-xs font-semibold tracking-widest uppercase mb-6 text-gray-700 dark:text-gray-300 shadow-sm text-left">
              <i className="fa-solid fa-bolt text-yellow-500 mr-2"></i> Available for opportunities
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-4 text-gray-900 dark:text-white">
              Hi, I'm <br/>
              <span className="text-gradient">{profile?.name || 'Arnob'}</span>
            </h1>
            
            <h2 className="text-2xl sm:text-3xl font-medium text-gray-600 dark:text-gray-400 mb-6 h-10">
              <span id="typewriter" className="typing-container text-gray-900 dark:text-white">
                {displayText}
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light text-center lg:text-left">
              {profile?.bio || profile?.tagline}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <a href="#contact" className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white dark:bg-white dark:text-black font-semibold rounded-lg hover:bg-brand-light dark:hover:bg-gray-200 transition-all transform hover:scale-105 shadow-md text-center">
                Get In Touch
              </a>
              <a href="#portfolio" className="w-full sm:w-auto px-8 py-3.5 glass-card bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all border border-gray-300 dark:border-white/20 shadow-sm text-center">
                View My Work
              </a>
            </div>
            
            <div className="flex items-center gap-6 mt-12 justify-center lg:justify-start">
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transform hover:-translate-y-1 transition-all text-2xl">
                  <i className="fab fa-github"></i>
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0a66c2] dark:text-gray-400 dark:hover:text-[#0a66c2] transform hover:-translate-y-1 transition-all text-2xl">
                  <i className="fab fa-linkedin"></i>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transform hover:-translate-y-1 transition-all text-2xl">
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1877f2] dark:text-gray-400 dark:hover:text-[#1877f2] transform hover:-translate-y-1 transition-all text-2xl">
                  <i className="fab fa-facebook"></i>
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#e1306c] dark:text-gray-400 dark:hover:text-[#e1306c] transform hover:-translate-y-1 transition-all text-2xl">
                  <i className="fab fa-instagram"></i>
                </a>
              )}
            </div>
          </div>
          
          {/* Profile Image */}
          <div className="lg:w-1/2 flex justify-center z-10 reveal active mt-10 lg:mt-0">
            <div className="relative profile-glow">
              <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-2 border-white/50 dark:border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm relative z-10 p-2 shadow-xl">
                {profile?.avatar && (
                  <img 
                    src={getFullImageUrl(profile.avatar)} 
                    alt={`${profile.name} Profile`} 
                    className="w-full h-full object-cover rounded-full filter contrast-110" 
                  />
                )}
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 right-0 glass-card bg-white/80 dark:bg-black/60 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl z-20 flex items-center gap-3 animate-bounce shadow-lg" style={{ animationDuration: '3s' }}>
                <i className="fa-solid fa-wand-magic-sparkles text-brand-light text-xl"></i>
                <div className="text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Passionate</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{profile?.title || 'Creator'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
