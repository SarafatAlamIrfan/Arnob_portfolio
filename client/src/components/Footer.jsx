import React from 'react';

export default function Footer({ profile }) {
  const socialLinks = profile?.socialLinks || {};
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-lg py-12 relative z-10 mt-12">
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6 tracking-widest uppercase">
          {profile?.name || 'Arnob'}
        </h2>
        
        {/* Social Links for Footer */}
        <div className="flex justify-center space-x-4 sm:space-x-6 mb-8">
          {socialLinks.github && (
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass-card bg-white/60 dark:bg-transparent border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:border-gray-400 dark:hover:text-white dark:hover:border-white/30 transition-all"
              aria-label="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass-card bg-white/60 dark:bg-transparent border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#0a66c2] hover:border-[#0a66c2] dark:hover:text-[#0a66c2] dark:hover:border-white/30 transition-all"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin"></i>
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass-card bg-white/60 dark:bg-transparent border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:border-gray-400 dark:hover:text-white dark:hover:border-white/30 transition-all"
              aria-label="Twitter/X"
            >
              <i className="fa-brands fa-x-twitter"></i>
            </a>
          )}
          {socialLinks.facebook && (
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass-card bg-white/60 dark:bg-transparent border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#1877f2] hover:border-[#1877f2] dark:hover:text-[#1877f2] dark:hover:border-white/30 transition-all"
              aria-label="Facebook"
            >
              <i className="fab fa-facebook"></i>
            </a>
          )}
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass-card bg-white/60 dark:bg-transparent border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#e1306c] hover:border-[#e1306c] dark:hover:text-[#e1306c] dark:hover:border-white/30 transition-all"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
          )}
        </div>
        
        <p className="text-sm text-gray-500 font-light">&copy; {profile?.name || 'Arnob'} - {currentYear}</p>
      </div>
    </footer>
  );
}
