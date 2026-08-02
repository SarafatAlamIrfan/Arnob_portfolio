import React, { useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function Achievements({ achievements, onOpenLightbox }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? achievements.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === achievements.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > minSwipeDistance) {
        handleNext();
      } else if (diffX < -minSwipeDistance) {
        handlePrev();
      }
    }
  };

  const getFullImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const normalizedImg = img.startsWith('/') ? img : `/${img}`;
    if (!API_BASE) return normalizedImg;
    return `${API_BASE}${normalizedImg}`;
  };

  if (!achievements || achievements.length === 0) {
    return (
      <section id="achievements" className="py-24 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            <span className="text-gradient">Achievements</span> & Activities
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-light">No achievements registered yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="achievements" className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white reveal">
          <span className="text-gradient">Achievements</span> & Activities
        </h2>
        
        <div className="max-w-4xl mx-auto relative group reveal active text-left">
          {/* Carousel Container */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="overflow-hidden rounded-3xl glass-card bg-white/40 dark:bg-black/20 border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] relative"
          >
            
            {/* Carousel Track */}
            <div
              id="carousel-track"
              className="flex transition-transform duration-700 ease-in-out h-[400px] md:h-[500px]"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {achievements.map((item) => (
                <div
                  key={item.id}
                  className="w-full min-w-full max-w-full flex-shrink-0 relative h-full overflow-hidden"
                >
                  <img
                    src={getFullImageUrl(item.image)}
                    alt={item.title}
                    className={`w-full h-full ${
                      item.image && item.image.includes('Letter') ? 'object-cover' : 'object-contain'
                    } bg-gray-100 dark:bg-gray-900`}
                  />
                  <div
                    onClick={() => onOpenLightbox(item)}
                    className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 glass-card bg-white/90 dark:bg-black/70 border border-white/20 dark:border-white/10 p-4 md:p-5 rounded-2xl cursor-pointer hover:border-brand-light/50 transition-all select-none hover:scale-[1.01]"
                  >
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-light">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-3 md:left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-card bg-white/80 dark:bg-black/80 border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white flex items-center justify-center hover:bg-brand-light hover:text-white dark:hover:bg-brand-light transition-all shadow-lg z-20 opacity-0 group-hover:opacity-100 focus:outline-none"
              aria-label="Previous Slide"
            >
              <i className="fas fa-chevron-left md:text-lg"></i>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 md:right-6 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-card bg-white/80 dark:bg-black/80 border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white flex items-center justify-center hover:bg-brand-light hover:text-white dark:hover:bg-brand-light transition-all shadow-lg z-20 opacity-0 group-hover:opacity-100 focus:outline-none"
              aria-label="Next Slide"
            >
              <i className="fas fa-chevron-right md:text-lg"></i>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-8" id="carousel-dots">
            {achievements.map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={() => setCurrentIndex(dotIndex)}
                className={`h-3 rounded-full transition-all duration-300 focus:outline-none ${
                  dotIndex === currentIndex
                    ? 'bg-brand-light w-6'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 w-3'
                }`}
                aria-label={`Go to slide ${dotIndex + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
