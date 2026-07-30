import React, { useState } from 'react';

export default function Navbar({ isDark, onToggleTheme, profile }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Experience', href: '#experience' },
    { label: 'Achievements', href: '#achievements' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 w-full glass-card bg-white/70 dark:bg-[#050505]/70 border-b border-gray-200 dark:border-white/10 z-50 transition-all duration-300" id="navbar">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <a href="#home" className="font-display text-2xl font-bold tracking-wider text-gray-900 dark:text-white">
            {profile?.name || 'Arnob'}<span className="text-brand-light">.</span>
          </a>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-light dark:hover:text-brand-light transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-light transition-all group-hover:w-full"></span>
              </a>
            ))}
            
            {/* CV Button (Desktop) */}
            <a
              href="/Sarafat_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-bold text-gray-900 dark:text-white glass-card bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center gap-2 shadow-sm transform hover:scale-105"
            >
              <i className="fa-solid fa-file-pdf text-brand-light"></i> View CV
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 ml-4 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle Theme"
            >
              <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>
          </div>
          
          <div className="flex items-center md:hidden">
            {/* Theme Toggle Button Mobile */}
            <button
              onClick={onToggleTheme}
              className="p-2 mr-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle Theme Mobile"
            >
              <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-900 dark:text-white focus:outline-none p-2"
              aria-label="Toggle Menu"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 dark:border-white/10 pt-4`}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-gray-700 dark:text-gray-300 hover:text-brand-light transition-colors"
            >
              {link.label}
            </a>
          ))}
          
          {/* CV Button (Mobile) */}
          <div className="pt-2">
            <a
              href="/Sarafat_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-900 dark:text-white glass-card bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg shadow-sm active:scale-95 transition-transform"
            >
              <i className="fa-solid fa-file-pdf text-brand-light"></i> View CV
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
