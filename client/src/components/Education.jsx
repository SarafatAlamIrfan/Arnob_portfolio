import React from 'react';

export default function Education({ education }) {
  const defaultEducation = [
    {
      degree: 'B.Sc. in Creative Design & Production',
      institution: 'Dhaka University',
      timeline: '2023 - Present',
      details: 'Focusing on product design, media coordination, and creative applications.',
      color: 'border-brand-light dark:group-hover:border-brand-light shadow-[0_0_10px_#a855f7]'
    },
    {
      degree: 'Higher Secondary Certificate (HSC)',
      institution: 'Dhaka College',
      timeline: 'Passing Year: 2022',
      details: 'Completed with major in science.',
      color: 'border-gray-200 dark:border-black group-hover:border-gray-500 dark:group-hover:border-gray-400'
    }
  ];

  const educationList = education && education.length > 0
    ? education.map((edu, idx) => ({
        ...edu,
        color: idx === 0 
          ? 'border-brand-light dark:group-hover:border-brand-light shadow-[0_0_10px_#a855f7]' 
          : 'border-gray-200 dark:border-black group-hover:border-gray-500 dark:group-hover:border-gray-400'
      }))
    : defaultEducation;

  return (
    <section id="education" className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white reveal">
          <span className="text-gradient">Education</span> Timeline
        </h2>
        
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical Timeline Bar */}
          <div className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-brand-light via-purple-500 to-transparent"></div>
          
          <div className="space-y-12">
            {educationList.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={item.id || item.degree + index}
                  className={`relative flex items-center md:justify-between group reveal active`}
                >
                  {/* Timeline Node */}
                  <div className={`absolute left-6 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-4 ${item.color} transition-colors z-10`} />
                  
                  {isEven ? (
                    <>
                      {/* Left Side Content */}
                      <div className="ml-16 md:ml-0 md:w-5/12 md:text-right pr-0 md:pr-10 text-left md:text-right">
                        <div className="glass-card bg-white/80 dark:bg-black/40 p-6 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-brand-light/50 transition-colors shadow-sm dark:shadow-none text-left md:text-right">
                          <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1">{item.degree}</h3>
                          <p className="text-brand-600 dark:text-brand-light font-medium text-sm mb-3">{item.institution}</p>
                          <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-xs text-gray-600 dark:text-gray-400 mb-3 border border-gray-200 dark:border-white/5">
                            {item.timeline}
                          </span>
                          {item.details && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-light">
                              {item.details}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="hidden md:block md:w-2/12"></div>
                      <div className="hidden md:block md:w-5/12"></div>
                    </>
                  ) : (
                    <>
                      {/* Right Side Content */}
                      <div className="hidden md:block md:w-5/12"></div>
                      <div className="hidden md:block md:w-2/12"></div>
                      <div className="ml-16 md:ml-0 md:w-5/12 pl-0 md:pl-10 text-left">
                        <div className="glass-card bg-white/80 dark:bg-black/40 p-6 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-gray-400/50 transition-colors shadow-sm dark:shadow-none">
                          <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1">{item.degree}</h3>
                          <p className="text-gray-600 dark:text-gray-400 font-medium text-sm mb-3">{item.institution}</p>
                          <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-xs text-gray-600 dark:text-gray-400 mb-3 border border-gray-200 dark:border-white/5">
                            {item.timeline}
                          </span>
                          {item.details && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-light">
                              {item.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
