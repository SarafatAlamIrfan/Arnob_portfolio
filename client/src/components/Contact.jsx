import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function Contact({ profile }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' }); // type can be 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus({
          type: 'success',
          text: 'Thank you! Message sent successfully.'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('Problem submitting form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus({
        type: 'error',
        text: 'Oops! Something went wrong.'
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatus({ type: '', text: '' });
      }, 5000);
    }
  };

  return (
    <section id="contact" className="py-24 relative z-10 text-left">
      <div className="container mx-auto px-6">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white reveal">
          Let's <span className="text-gradient">Connect</span>
        </h2>
        
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-12">
          {/* Info */}
          <div className="lg:col-span-2 reveal">
            <h3 className="font-display text-3xl font-bold mb-6 text-gray-900 dark:text-white">Reach Out</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-10 leading-relaxed font-light">
              I'm currently looking for new opportunities and collaborations. Whether you have a question, a project idea, or just want to say hi, my inbox is always open!
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center group">
                <div className="w-12 h-12 rounded-full glass-card border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-transparent flex items-center justify-center text-brand-600 dark:text-brand-light group-hover:bg-brand-600 group-hover:text-white dark:group-hover:bg-brand-light dark:group-hover:text-white transition-all mr-5 shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.email || 'arnob@example.com'}</p>
                </div>
              </div>
              
              <div className="flex items-center group">
                <div className="w-12 h-12 rounded-full glass-card border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-transparent flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:bg-pink-600 group-hover:text-white dark:group-hover:bg-pink-400 dark:group-hover:text-white transition-all mr-5 shadow-sm dark:shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Location</p>
                  <p className="text-gray-900 dark:text-white font-medium">{profile?.location || 'Dhaka, Bangladesh'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 reveal glass-card bg-white/60 dark:bg-black/40 p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-white/10 relative overflow-hidden shadow-lg dark:shadow-none">
            {/* Glow effect behind form */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-light opacity-20 dark:opacity-10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="w-full px-5 py-4 bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-sm dark:shadow-none"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full px-5 py-4 bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-sm dark:shadow-none"
                    required
                  />
                </div>
              </div>
              
              <div>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="w-full px-5 py-4 bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-sm dark:shadow-none"
                  required
                />
              </div>
              
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  rows="5"
                  className="w-full px-5 py-4 bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all resize-none shadow-sm dark:shadow-none"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white dark:bg-white dark:text-black font-bold py-4 rounded-xl hover:bg-brand-600 dark:hover:bg-gray-200 transition-all transform hover:scale-[1.02] shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            {status.text && (
              <div
                className={`mt-4 text-sm font-medium text-center rounded-xl py-3 border ${
                  status.type === 'success'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/50'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/50'
                }`}
              >
                {status.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
