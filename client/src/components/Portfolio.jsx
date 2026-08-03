import React, { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function Portfolio({ projects, profile, projectCategories = ['Software', 'Hardware'] }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const cardRefs = useRef([]);

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'all') return true;
    return project.category?.toLowerCase() === activeFilter.toLowerCase();
  });

  // Re-initialize VanillaTilt when the filtered list changes
  useEffect(() => {
    if (window.VanillaTilt) {
      cardRefs.current.forEach((el) => {
        if (el) {
          window.VanillaTilt.init(el, {
            max: 3,
            speed: 400,
            perspective: 1000
          });
        }
      });
    }
    // Cleanup
    return () => {
      cardRefs.current.forEach((el) => {
        if (el && el.vanillaTilt) {
          el.vanillaTilt.destroy();
        }
      });
    };
  }, [filteredProjects]);

  const filterButtons = [
    { label: 'All', filter: 'all' },
    ...projectCategories.map(cat => ({ label: cat, filter: cat }))
  ];

  const getFullImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    const normalizedImg = img.startsWith('/') ? img : `/${img}`;
    if (!API_BASE) return normalizedImg;
    return `${API_BASE}${normalizedImg}`;
  };

  const githubUrl = profile?.socialLinks?.github || 'https://github.com';

  return (
    <section id="portfolio" className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
            Explore some of my work across creative layouts, application designs, and hardware assemblies.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex justify-center mb-12 flex-wrap gap-3 reveal">
          {filterButtons.map((btn) => (
            <button
              key={btn.filter}
              onClick={() => setActiveFilter(btn.filter)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                activeFilter === btn.filter
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'glass-card bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 font-light">No projects added yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" id="portfolio-grid">
            {filteredProjects.map((project, index) => {
              const isGithub = project.link && project.link.includes('github.com');
              const CardWrapper = project.link ? 'a' : 'div';
              const wrapperProps = project.link
                ? { href: project.link, target: '_blank', rel: 'noopener noreferrer' }
                : {};
              return (
                <div
                  key={project.id}
                  ref={(el) => (cardRefs.current[index] = el)}
                  className="project-card reveal active transition-all duration-300 transform scale-100 opacity-100"
                  data-category={project.category}
                >
                  <CardWrapper
                    {...wrapperProps}
                    className="block h-full glass-card bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden group flex flex-col shadow-lg dark:shadow-none"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <div className="absolute inset-0 bg-black/10 dark:bg-black/40 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                      <img
                        src={getFullImageUrl(project.image)}
                        loading="lazy"
                        alt={project.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className={`absolute top-4 right-4 z-20 bg-white/90 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        project.category === 'web'
                          ? 'text-brand-600 dark:text-brand-light'
                          : project.category === 'hardware'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-pink-600 dark:text-pink-400'
                      }`}>
                        {project.category === 'web' ? 'Web App' : project.category === 'hardware' ? 'Hardware' : 'Application'}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-transparent to-white/90 dark:to-black/40 text-left">
                      <h3 className="text-xl font-display font-bold mb-3 text-gray-900 dark:text-white transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-light">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow font-light">
                        {project.description}
                      </p>
                      {project.link && (
                        <div className="flex justify-between items-center text-sm font-semibold text-gray-900 dark:text-white">
                          <span>{project.linkLabel}</span>
                          {isGithub ? (
                            <i className="fa-brands fa-github text-gray-500 group-hover:text-brand-600 dark:group-hover:text-white text-lg transition-colors"></i>
                          ) : (
                            <i className="fa-solid fa-arrow-up-right-from-square text-gray-500 group-hover:text-brand-600 dark:group-hover:text-white transition-colors"></i>
                          )}
                        </div>
                      )}
                    </div>
                  </CardWrapper>
                </div>
              );
            })}
          </div>
        )}

        {/* View More on GitHub CTA */}
        <div className="mt-16 text-center reveal">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 glass-card bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-full text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] group transform hover:-translate-y-1"
          >
            <span>Explore More on GitHub</span>
            <i className="fa-brands fa-github text-xl group-hover:rotate-12 transition-transform"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
