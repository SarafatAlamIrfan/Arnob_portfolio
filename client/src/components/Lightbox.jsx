import React, { useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function Lightbox({ isOpen, achievement, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !achievement) return null;

  const handleModalClick = (e) => {
    // Close modal if user clicks on the background backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleModalClick}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 opacity-100 pointer-events-auto"
    >
      <button
        onClick={onClose}
        id="lightbox-close"
        className="absolute top-6 right-6 text-white hover:text-brand-light text-3xl transition-colors p-2 focus:outline-none"
        aria-label="Close Lightbox"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
      
      <div className="relative max-w-[90%] max-h-[80vh] flex items-center justify-center">
        <img
          id="lightbox-img"
          src={achievement.image.startsWith('http') ? achievement.image : `${API_BASE}/${achievement.image}`}
          alt={achievement.title}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl scale-100 transition-all duration-300"
        />
      </div>
      
      <p id="lightbox-caption" className="text-white/80 text-center text-sm md:text-base font-light mt-6 max-w-2xl px-6">
        {achievement.description ? `${achievement.title} — ${achievement.description}` : achievement.title}
      </p>
      
      {achievement.link && (
        <a
          id="lightbox-link"
          href={achievement.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-6 py-2.5 text-sm font-bold text-gray-900 bg-white hover:bg-brand-light hover:text-white dark:text-white dark:bg-white/10 dark:hover:bg-brand-light dark:hover:text-white glass-card border border-white/20 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-up-right-from-square"></i> Verify Online
        </a>
      )}
    </div>
  );
}
