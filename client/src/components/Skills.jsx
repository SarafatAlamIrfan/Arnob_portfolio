import React from 'react';

export default function Skills({ skills }) {
  // Fallbacks in case skills data is not yet loaded
  const technicalStack = skills && skills.filter((s) => s.category === 'technical').length > 0
    ? skills.filter((s) => s.category === 'technical')
    : [
        { name: 'UI/UX Design', icon: 'fas fa-pen-nib', color: 'text-pink-500' },
        { name: 'HTML/CSS', icon: 'fa-brands fa-html5', color: 'text-orange-500' },
        { name: 'JavaScript', icon: 'fa-brands fa-js', color: 'text-yellow-400' }
      ];

  const toolsEngineering = skills && skills.filter((s) => s.category === 'tools').length > 0
    ? skills.filter((s) => s.category === 'tools')
    : [
        { name: 'Git & GitHub', icon: 'fa-brands fa-github', color: 'text-gray-800 dark:text-white' },
        { name: 'Arduino Prototyping', icon: 'fa-solid fa-microchip', color: 'text-teal-500' }
      ];

  return (
    <section id="skills" className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white reveal">
          My <span className="text-gradient">Skills</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 text-left">
          {/* Technical Stack */}
          <div className="reveal glass-card bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-lg dark:shadow-none">
            <h3 className="font-display text-2xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
              <i className="fa-solid fa-laptop-code mr-3 text-brand-light"></i> Technical Stack
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {technicalStack.map((skill, index) => (
                <div
                  key={skill.id || skill.name || index}
                  className="bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-white/5 p-4 rounded-xl text-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none group cursor-pointer"
                >
                  <i className={`${skill.icon} text-3xl ${skill.color} transition-colors mb-2 block`}></i>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{skill.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tools & Engineering */}
          <div className="reveal glass-card bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-lg dark:shadow-none">
            <h3 className="font-display text-2xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
              <i className="fa-solid fa-toolbox mr-3 text-pink-500 dark:text-pink-400"></i> Tools & Engineering
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {toolsEngineering.map((tool, index) => (
                <div
                  key={tool.id || tool.name || index}
                  className="bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-white/5 p-4 rounded-xl text-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none group cursor-pointer"
                >
                  <i className={`${tool.icon} text-3xl ${tool.color} transition-colors mb-2 block`}></i>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{tool.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
