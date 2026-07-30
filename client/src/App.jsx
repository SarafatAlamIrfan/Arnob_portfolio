import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Portfolio from './components/Portfolio';
import Education from './components/Education';
import Experience from './components/Experience';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Lightbox from './components/Lightbox';

// Admin Components
import Login from './components/admin/Login';
import Dashboard from './components/admin/Dashboard';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Dynamic portfolio states
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lightbox Modal state
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Admin Auth state
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);

  // --- 1. Load Portfolio Data ---
  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const [profileRes, skillsRes, projectsRes, achievementsRes, eduRes, expRes] = await Promise.all([
          fetch(`${API_BASE}/api/profile`),
          fetch(`${API_BASE}/api/skills`),
          fetch(`${API_BASE}/api/projects`),
          fetch(`${API_BASE}/api/achievements`),
          fetch(`${API_BASE}/api/education`),
          fetch(`${API_BASE}/api/experience`),
        ]);

        if (profileRes.ok) setProfile(await profileRes.json());
        if (skillsRes.ok) setSkills(await skillsRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
        if (achievementsRes.ok) setAchievements(await achievementsRes.json());
        if (eduRes.ok) setEducation(await eduRes.json());
        if (expRes.ok) setExperience(await expRes.json());
      } catch (err) {
        console.error('Error fetching dynamic portfolio data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  // --- 2. Theme Configuration ---
  useEffect(() => {
    const root = window.document.documentElement;
    const initialDark = localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(initialDark);
    if (initialDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  // --- 3. Scroll Progress & Scroll Reveals ---
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for .reveal elements
  useEffect(() => {
    if (loading) return;
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [loading]);

  // --- 4. Animated Favicon (ARNOB) ---
  useEffect(() => {
    const nameToSpell = profile?.name?.toUpperCase() || "ARNOB";
    let currentFrame = 0;
    let timerId = null;

    const animateFavicon = () => {
      const favicon = document.getElementById('favicon');
      if (!favicon) return;

      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw brand circle background
      ctx.fillStyle = '#7c3aed'; 
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw current letter in white
      ctx.fillStyle = '#ffffff'; 
      ctx.font = 'bold 20px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const currentLetter = nameToSpell[currentFrame % nameToSpell.length];
      ctx.fillText(currentLetter, 16, 17);
      
      // Update the favicon link href
      favicon.href = canvas.toDataURL('image/png');
      
      currentFrame = (currentFrame + 1) % nameToSpell.length;
      timerId = setTimeout(animateFavicon, 600);
    };

    animateFavicon();
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [profile]);

  const openLightbox = (achievement) => {
    setSelectedAchievement(achievement);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setTimeout(() => {
      setSelectedAchievement(null);
    }, 300);
  };

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-semibold text-sm">Loading dynamic portfolio content...</p>
        </div>
      </div>
    );
  }

  // Fallback defaults in case backend is empty
  const activeProfile = profile || {
    name: 'Arnob',
    title: 'Creative Designer & Hardware Innovator',
    tagline: 'Enthusiastic Tinkerer',
    bio: 'I am Arnob...',
    aboutHeading: 'About Me',
    aboutText1: 'Biography details here...',
    avatar: '/image/LinkedIn_HeadShot.jpg',
    coverImage: '/image/Portfolio_cover.jpg',
    email: 'arnob@example.com',
    location: 'Dhaka, Bangladesh',
    socialLinks: {},
    typewriterTexts: ['Creative Designer', 'Innovator', 'Developer']
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Route */}
        <Route
          path="/"
          element={
            <div className="min-h-screen text-gray-900 bg-slate-50 dark:bg-[#050505] dark:text-gray-200 transition-colors duration-300">
              {/* Scroll Progress Bar */}
              <div 
                className="scroll-progress" 
                style={{ width: `${scrollProgress}%` }}
              ></div>

              {/* Animated Mesh Background */}
              <div className="mesh-bg bg-slate-50 dark:bg-[#050505]">
                <div className="mesh-blob blob-1"></div>
                <div className="mesh-blob blob-2"></div>
                <div className="mesh-blob blob-3"></div>
              </div>

              <Navbar isDark={isDark} onToggleTheme={toggleTheme} profile={activeProfile} />
              
              <main>
                <Hero profile={activeProfile} />
                <About profile={activeProfile} />
                <Skills skills={skills} />
                <Portfolio projects={projects} profile={activeProfile} />
                <Education education={education} />
                <Experience experiences={experience} />
                <Achievements achievements={achievements} onOpenLightbox={openLightbox} />
                <Contact profile={activeProfile} />
              </main>

              <Footer profile={activeProfile} />

              <Lightbox
                isOpen={lightboxOpen}
                achievement={selectedAchievement}
                onClose={closeLightbox}
              />
            </div>
          }
        />

        {/* Admin Section Route */}
        <Route
          path="/admin"
          element={
            token ? (
              <Dashboard token={token} onLogout={handleLogout} />
            ) : (
              <Login onLoginSuccess={handleLogin} />
            )
          }
        />

        {/* Fallback Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
