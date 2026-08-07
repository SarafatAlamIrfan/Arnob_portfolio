import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

const convertToWebP = (file) => {
  return new Promise((resolve, reject) => {
    // Only convert raster static images, skip vectors (svg) and animations (gif)
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
      resolve(file);
      return;
    }
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(file);
          return;
        }
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newFile = new File([blob], `${nameWithoutExt}.webp`, {
          type: 'image/webp',
          lastModified: Date.now()
        });
        resolve(newFile);
      }, 'image/webp', 0.85);
    };
    img.onerror = (err) => {
      console.error('Image load error during WebP conversion:', err);
      resolve(file);
    };
  });
};

export default function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State for dynamic items
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [messages, setMessages] = useState([]);

  // Form edit states
  const [editingProject, setEditingProject] = useState(null);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editingEdu, setEditingEdu] = useState(null);
  const [editingExp, setEditingExp] = useState(null);

  // Drag and Drop States for Education & Experience Reordering
  const [draggedEduIndex, setDraggedEduIndex] = useState(null);
  const [draggedExpIndex, setDraggedExpIndex] = useState(null);

  // New item modal/form states
  const [newProject, setNewProject] = useState({ title: '', description: '', category: 'Software', link: '', linkLabel: 'View Project', image: '' });
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '', image: '' });
  const [newSkill, setNewSkill] = useState({ name: '', icon: 'fa-solid fa-code', color: 'text-brand-light', category: 'technical' });
  const [newEdu, setNewEdu] = useState({ degree: '', institution: '', timeline: '', details: '' });
  const [newExp, setNewExp] = useState({ role: '', company: '', timeline: '', details: '' });

  // Upload progress states
  const [uploadingField, setUploadingField] = useState(null); // 'avatar', 'coverImage', etc.

  const defaultProfile = {
    name: 'Raiyan Rongon Arnob',
    firstName: 'Raiyan Rongon',
    lastName: 'Arnob',
    navbarName: 'Arnob',
    title: 'Creative Designer & Hardware Innovator',
    tagline: 'Enthusiastic Tinkerer',
    bio: 'I am Arnob...',
    aboutHeading: 'About Me',
    aboutText1: 'Biography details here...',
    aboutText2: '',
    aboutHighlights: [
      { icon: 'fa-palette', title: 'Creative Design', color: 'text-brand-light' },
      { icon: 'fa-microchip', title: 'Hardware Dev', color: 'text-pink-500 dark:text-pink-400' },
      { icon: 'fa-users-viewfinder', title: 'Coordination', color: 'text-blue-500 dark:text-blue-400' }
    ],
    aboutHeading: 'About Me',
    aboutText1: 'Biography details here...',
    aboutText2: '',
    avatar: '/image/LinkedIn_HeadShot.jpg',
    coverImage: '/image/Portfolio_cover.jpg',
    cvUrl: '/Sarafat_CV.pdf',
    email: 'arnob@example.com',
    location: 'Dhaka, Bangladesh',
    socialLinks: {
      github: '',
      linkedin: '',
      facebook: '',
      instagram: '',
      twitter: ''
    },
    typewriterTexts: [],
    showSections: {
      about: true,
      skills: true,
      projects: true,
      education: true,
      experience: true,
      achievements: true,
      contact: true,
      cv: true
    }
  };

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch public portfolio data in a single request
      const portfolioRes = await fetch(`${API_BASE}/api/portfolio-data`);
      if (portfolioRes.ok) {
        const data = await portfolioRes.json();
        setProfile(data.profile || defaultProfile);
        setSkills(data.skills || []);
        setProjects(data.projects || []);
        setAchievements(data.achievements || []);
        setEducation(data.education || []);
        setExperience(data.experience || []);
      } else {
        // Fallback to defaults to prevent hanging loader screen
        setProfile(defaultProfile);
        showStatus('error', 'Database offline. Loaded local defaults.');
      }

      // 2. Fetch admin messages in a separate request
      const msgRes = await fetch(`${API_BASE}/api/messages`, { headers });
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        if (Array.isArray(msgData)) {
          setMessages(msgData);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setProfile(defaultProfile);
      showStatus('error', 'Failed to connect to backend server. Loaded local defaults.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showStatus = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Image Upload Helper
  const handleImageUpload = async (e, onUploadSuccess) => {
    let file = e.target.files[0];
    if (!file) return;

    setUploadingField(e.target.name || 'file');

    try {
      file = await convertToWebP(file);

      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onUploadSuccess(data.url);
        showStatus('success', 'Image uploaded successfully!');
      } else {
        showStatus('error', data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Network error during image upload.');
    } finally {
      setUploadingField(null);
    }
  };

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const profileToSave = {
        ...profile,
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
      };
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileToSave),
      });

      if (res.ok) {
        setProfile(profileToSave);
        showStatus('success', 'Profile saved successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        showStatus('error', errorData.error || 'Failed to save profile changes.');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Network error while saving profile.');
    }
  };

  // Projects CRUD
  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        const added = await res.json();
        setProjects([...projects, added]);
        setNewProject({ title: '', description: '', category: 'Software', link: '', linkLabel: 'View Project', image: '' });
        showStatus('success', 'Project added successfully!');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to add project');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to add project');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProject),
      });

      if (res.ok) {
        const updated = await res.json();
        setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
        setEditingProject(null);
        showStatus('success', 'Project updated successfully!');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to update project');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to update project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
        showStatus('success', 'Project deleted');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to delete project');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to delete project');
    }
  };

  // Achievements CRUD
  const handleAddAchievement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAchievement),
      });

      if (res.ok) {
        const added = await res.json();
        setAchievements([...achievements, added]);
        setNewAchievement({ title: '', description: '', image: '' });
        showStatus('success', 'Achievement added successfully!');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to add achievement');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to add achievement');
    }
  };

  const handleUpdateAchievement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/achievements/${editingAchievement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingAchievement),
      });

      if (res.ok) {
        const updated = await res.json();
        setAchievements(achievements.map((a) => (a.id === updated.id ? updated : a)));
        setEditingAchievement(null);
        showStatus('success', 'Achievement updated successfully!');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to update achievement');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to update achievement');
    }
  };

  const handleDeleteAchievement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/achievements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setAchievements(achievements.filter((a) => a.id !== id));
        showStatus('success', 'Achievement deleted');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to delete achievement');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to delete achievement');
    }
  };

  // Skills CRUD
  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSkill),
      });

      if (res.ok) {
        const added = await res.json();
        setSkills([...skills, added]);
        setNewSkill({ name: '', icon: 'fa-solid fa-code', color: 'text-brand-light', category: 'technical' });
        showStatus('success', 'Skill added!');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to add skill');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to add skill');
    }
  };

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/skills/${editingSkill.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingSkill),
      });

      if (res.ok) {
        const updated = await res.json();
        setSkills(skills.map((s) => (s.id === updated.id ? updated : s)));
        setEditingSkill(null);
        showStatus('success', 'Skill updated!');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to update skill');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to update skill');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete skill?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/skills/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setSkills(skills.filter((s) => s.id !== id));
        showStatus('success', 'Skill deleted');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to delete skill');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to delete skill');
    }
  };

  // Timeline (Education & Experience) CRUD
  const handleAddEdu = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/education`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEdu),
      });

      if (res.ok) {
        const added = await res.json();
        setEducation([added, ...education]);
        setNewEdu({ degree: '', institution: '', timeline: '', details: '' });
        showStatus('success', 'Education entry added!');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to add education entry');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to add education');
    }
  };

  const handleUpdateEdu = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/education/${editingEdu.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingEdu),
      });

      if (res.ok) {
        const updated = await res.json();
        setEducation(education.map((e) => (e.id === updated.id ? updated : e)));
        setEditingEdu(null);
        showStatus('success', 'Education entry updated!');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to update education entry');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to update education');
    }
  };

  const handleDeleteEdu = async (id) => {
    if (!window.confirm('Delete education item?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/education/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setEducation(education.filter((e) => e.id !== id));
        showStatus('success', 'Education item deleted');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to delete education item');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to delete education');
    }
  };

  const handleAddExp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newExp),
      });

      if (res.ok) {
        const added = await res.json();
        setExperience([added, ...experience]);
        setNewExp({ role: '', company: '', timeline: '', details: '' });
        showStatus('success', 'Experience entry added!');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to add experience entry');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to add experience');
    }
  };

  const handleUpdateExp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/experience/${editingExp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingExp),
      });

      if (res.ok) {
        const updated = await res.json();
        setExperience(experience.map((ex) => (ex.id === updated.id ? updated : ex)));
        setEditingExp(null);
        showStatus('success', 'Experience entry updated!');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to update experience entry');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to update experience');
    }
  };

  const handleDeleteExp = async (id) => {
    if (!window.confirm('Delete experience item?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/experience/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setExperience(experience.filter((ex) => ex.id !== id));
        showStatus('success', 'Experience item deleted');
      } else {
        const data = await res.json();
        showStatus('error', data.error || 'Failed to delete experience item');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to delete experience');
    }
  };

  // Drag and Drop reordering handlers
  const handleEduDragStart = (index) => {
    setDraggedEduIndex(index);
  };

  const handleEduDragOver = (e, index) => {
    e.preventDefault();
    if (draggedEduIndex === null || draggedEduIndex === index) return;
    const updated = [...education];
    const draggedItem = updated[draggedEduIndex];
    updated.splice(draggedEduIndex, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedEduIndex(index);
    setEducation(updated);
  };

  const handleEduDragEnd = async () => {
    setDraggedEduIndex(null);
    try {
      const ids = education.map(e => e.id);
      const res = await fetch(`${API_BASE}/api/education/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const sorted = await res.json();
        setEducation(sorted);
      } else {
        showStatus('error', 'Failed to save education order to database');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to reorder education items');
    }
  };

  const handleExpDragStart = (index) => {
    setDraggedExpIndex(index);
  };

  const handleExpDragOver = (e, index) => {
    e.preventDefault();
    if (draggedExpIndex === null || draggedExpIndex === index) return;
    const updated = [...experience];
    const draggedItem = updated[draggedExpIndex];
    updated.splice(draggedExpIndex, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedExpIndex(index);
    setExperience(updated);
  };

  const handleExpDragEnd = async () => {
    setDraggedExpIndex(null);
    try {
      const ids = experience.map(e => e.id);
      const res = await fetch(`${API_BASE}/api/experience/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const sorted = await res.json();
        setExperience(sorted);
      } else {
        showStatus('error', 'Failed to save experience order to database');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to reorder experience items');
    }
  };

  // Messages CRUD
  const handleToggleReadMessage = async (id, currentRead) => {
    try {
      const res = await fetch(`${API_BASE}/api/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ read: !currentRead }),
      });

      if (res.ok) {
        const updated = await res.json();
        setMessages(messages.map((m) => {
          const targetId = m.id || m._id;
          const updatedId = updated.id || updated._id;
          return targetId === updatedId ? updated : m;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setMessages(messages.filter((m) => (m.id || m._id) !== id));
        showStatus('success', 'Message deleted from inbox');
      }
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to delete message');
    }
  };

  const getFullImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    const normalizedImg = img.startsWith('/') ? img : `/${img}`;
    if (!API_BASE) return normalizedImg;
    return `${API_BASE}${normalizedImg}`;
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading database dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row md:overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0 md:overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-md">
              <i className="fa-solid fa-gauge-high text-white"></i>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg leading-tight">Dashboard</h2>
              <span className="text-xs text-purple-400 font-semibold tracking-wider uppercase">Portfolio Panel</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'profile', label: 'Profile Info', icon: 'fa-user' },
              { id: 'projects', label: 'Projects', icon: 'fa-laptop-code' },
              { id: 'achievements', label: 'Achievements', icon: 'fa-award' },
              { id: 'skills', label: 'Skills Stack', icon: 'fa-list-check' },
              { id: 'timeline', label: 'Timeline (Edu/Exp)', icon: 'fa-route' },
              { id: 'messages', label: 'Inbox Messages', icon: 'fa-envelope', badge: messages.filter(m => !m.read).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`fa-solid ${tab.icon} w-5`}></i>
                  {tab.label}
                </div>
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
              <img src={getFullImageUrl(profile.avatar)} className="w-full h-full object-cover" alt="Avatar" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-bold text-slate-200">{profile.name}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full px-4 py-3 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-red-500/20"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full overflow-y-auto">
        
        {/* Status Toast Notification */}
        {message.text && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slide-in ${
            message.type === 'success'
              ? 'bg-green-950/90 text-green-400 border-green-500/30'
              : 'bg-red-950/90 text-red-400 border-red-500/30'
          }`}>
            <i className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
            <span className="text-sm font-semibold">{message.text}</span>
          </div>
        )}

        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-white capitalize">{activeTab.replace('_', ' ')} Manager</h1>
            <p className="text-slate-400 text-sm mt-1">Configure and manage your live portfolio details.</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              Saving database...
            </div>
          )}
        </header>

        {/* --- TAB 1: PROFILE INFO --- */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Warning Banner */}
            <div className="p-4 bg-purple-950/40 border border-purple-800/80 rounded-2xl flex items-start gap-3">
              <i className="fa-solid fa-circle-info text-purple-400 text-lg mt-0.5 shrink-0"></i>
              <div>
                <h4 className="font-bold text-white text-sm">Image & Document Size Guide</h4>
                <p className="text-purple-300 text-xs mt-1 leading-relaxed">
                  To ensure successful profile updates and maintain fast page loads under Vercel's 4.5MB payload limit, please compress/resize images and PDFs to under <strong>1.5MB (ideally under 500KB)</strong> before uploading.
                </p>
              </div>
            </div>

            <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-3 flex items-center gap-3">
                <i className="fa-solid fa-id-card text-purple-500"></i> Hero Section Settings
              </h3>

              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName || ''}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName || ''}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Navbar Name</label>
                  <input
                    type="text"
                    value={profile.navbarName || ''}
                    onChange={(e) => setProfile({ ...profile, navbarName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Professional Title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tagline Description</label>
                <textarea
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Biography Description (Hero Section)</label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  placeholder="Hero introduction biography text..."
                ></textarea>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                {/* Profile Photo Upload */}
                <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-2xl flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-800 shrink-0 bg-slate-900">
                    <img src={getFullImageUrl(profile.avatar)} className="w-full h-full object-cover" alt="Profile avatar" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Profile Avatar</span>
                    <input
                      type="file"
                      name="avatar"
                      onChange={(e) => handleImageUpload(e, (url) => setProfile({ ...profile, avatar: url }))}
                      disabled={uploadingField === 'avatar'}
                      className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-400 hover:file:bg-purple-600/30 file:cursor-pointer"
                    />
                    {uploadingField === 'avatar' && <p className="text-[10px] text-purple-400 animate-pulse mt-1">Uploading...</p>}
                  </div>
                </div>

                {/* About Cover Photo Upload */}
                <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-2xl flex items-center gap-4">
                  <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-900">
                    <img src={getFullImageUrl(profile.coverImage)} className="w-full h-full object-cover" alt="Cover" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Cover Image</span>
                    <input
                      type="file"
                      name="coverImage"
                      onChange={(e) => handleImageUpload(e, (url) => setProfile({ ...profile, coverImage: url }))}
                      disabled={uploadingField === 'coverImage'}
                      className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-400 hover:file:bg-purple-600/30 file:cursor-pointer"
                    />
                    {uploadingField === 'coverImage' && <p className="text-[10px] text-purple-400 animate-pulse mt-1">Uploading...</p>}
                  </div>
                </div>

                {/* CV PDF Upload */}
                <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-2xl flex items-center gap-4">
                  <div className="w-14 h-16 rounded-xl border border-slate-800 shrink-0 bg-slate-900 flex items-center justify-center">
                    <i className="fa-solid fa-file-pdf text-brand-light text-3xl leading-none"></i>
                  </div>
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">CV PDF Document</span>
                    <input
                      type="file"
                      name="cv"
                      accept=".pdf"
                      onChange={(e) => handleImageUpload(e, (url) => setProfile({ ...profile, cvUrl: url }))}
                      disabled={uploadingField === 'cv'}
                      className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-400 hover:file:bg-purple-600/30 file:cursor-pointer"
                    />
                    {uploadingField === 'cv' && <p className="text-[10px] text-purple-400 animate-pulse mt-1">Uploading...</p>}
                    {profile.cvUrl && (
                      <a href={getFullImageUrl(profile.cvUrl)} target="_blank" rel="noopener noreferrer" className="block text-[9px] text-purple-400 hover:underline mt-1 truncate max-w-[120px]">
                        View Uploaded CV
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Typewriter Text Swapper (Comma-separated)</label>
                <input
                  type="text"
                  value={profile.typewriterTexts ? profile.typewriterTexts.join(', ') : ''}
                  onChange={(e) => setProfile({ ...profile, typewriterTexts: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  placeholder="Software Innovator, Creative Designer, Hardware Enthusiast"
                />
              </div>
            </div>

            {/* About Page Biography Details Card */}
            <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-3 flex items-center gap-3">
                <i className="fa-solid fa-address-card text-purple-500"></i> About Page Biography Details
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Biography Heading</label>
                <input
                  type="text"
                  value={profile.aboutHeading || ''}
                  onChange={(e) => setProfile({ ...profile, aboutHeading: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g. A Passionate Tech Prototyper"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Biography Paragraph 1</label>
                  <textarea
                    value={profile.aboutText1 || ''}
                    onChange={(e) => setProfile({ ...profile, aboutText1: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="First biography paragraph..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Biography Paragraph 2</label>
                  <textarea
                    value={profile.aboutText2 || ''}
                    onChange={(e) => setProfile({ ...profile, aboutText2: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="Second biography paragraph..."
                  ></textarea>
                </div>
              </div>

              {/* Highlights cards editor */}
              <div className="border-t border-slate-800 pt-6">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Highlights Cards (3 Columns)</h4>
                <div className="grid sm:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const highlight = (profile.aboutHighlights || [])[idx] || { icon: '', title: '', color: '' };
                    return (
                      <div key={idx} className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl space-y-4">
                        <span className="block text-xs font-bold text-purple-400 uppercase tracking-wider">Card {idx + 1}</span>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={highlight.title || ''}
                            onChange={(e) => {
                              const newHighlights = [...(profile.aboutHighlights || [])];
                              newHighlights[idx] = { ...highlight, title: e.target.value };
                              setProfile({ ...profile, aboutHighlights: newHighlights });
                            }}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                            placeholder="e.g. Creative Design"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">FontAwesome Icon Class</label>
                          <input
                            type="text"
                            value={highlight.icon || ''}
                            onChange={(e) => {
                              const newHighlights = [...(profile.aboutHighlights || [])];
                              newHighlights[idx] = { ...highlight, icon: e.target.value };
                              setProfile({ ...profile, aboutHighlights: newHighlights });
                            }}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                            placeholder="e.g. fa-palette"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Theme Color</label>
                          <select
                            value={highlight.color || 'text-brand-light'}
                            onChange={(e) => {
                              const newHighlights = [...(profile.aboutHighlights || [])];
                              newHighlights[idx] = { ...highlight, color: e.target.value };
                              setProfile({ ...profile, aboutHighlights: newHighlights });
                            }}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="text-brand-light">Purple Accent</option>
                            <option value="text-pink-500 dark:text-pink-400">Pink Accent</option>
                            <option value="text-blue-500 dark:text-blue-400">Blue Accent</option>
                            <option value="text-purple-500">Solid Purple</option>
                            <option value="text-pink-500">Solid Pink</option>
                            <option value="text-blue-500">Solid Blue</option>
                            <option value="text-teal-500">Solid Teal</option>
                            <option value="text-yellow-500">Solid Yellow</option>
                            <option value="text-green-500">Solid Green</option>
                            <option value="text-orange-500">Solid Orange</option>
                            <option value="text-red-500">Solid Red</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-3 flex items-center gap-3">
                <i className="fa-solid fa-address-book text-pink-500"></i> Contact & Social Channels
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Location City/Country</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">GitHub URL</label>
                  <input
                    type="url"
                    value={profile.socialLinks?.github || ''}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, github: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profile.socialLinks?.linkedin || ''}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, linkedin: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Facebook URL</label>
                  <input
                    type="url"
                    value={profile.socialLinks?.facebook || ''}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, facebook: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={profile.socialLinks?.instagram || ''}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, instagram: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Twitter / X URL</label>
                  <input
                    type="url"
                    value={profile.socialLinks?.twitter || ''}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, twitter: e.target.value } })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-3 flex items-center gap-3">
                <i className="fa-solid fa-circle-info text-blue-500"></i> About Page Biography Details
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About Page Heading Text</label>
                <input
                  type="text"
                  value={profile.aboutHeading}
                  onChange={(e) => setProfile({ ...profile, aboutHeading: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Biography Paragraph</label>
                <textarea
                  value={profile.aboutText1}
                  onChange={(e) => setProfile({ ...profile, aboutText1: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Secondary Biography Paragraph</label>
                <textarea
                  value={profile.aboutText2}
                  onChange={(e) => setProfile({ ...profile, aboutText2: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>
            </div>

            <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-3 flex items-center gap-3">
                <i className="fa-solid fa-toggle-on text-purple-500"></i> Section Visibility Controls
              </h3>
              <p className="text-xs text-slate-400 -mt-2">Turn individual landing page sections on or off dynamically.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'about', label: 'About Me Section' },
                  { id: 'skills', label: 'Skills Section' },
                  { id: 'projects', label: 'Projects Section' },
                  { id: 'education', label: 'Education Section' },
                  { id: 'experience', label: 'Experience Section' },
                  { id: 'achievements', label: 'Achievements Section' },
                  { id: 'contact', label: 'Contact Form Section' },
                  { id: 'cv', label: 'Download CV button' }
                ].map((sec) => {
                  const isShown = (profile.showSections && profile.showSections[sec.id]) !== false;
                  return (
                    <div key={sec.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-xl hover:border-slate-800 transition-colors">
                      <span className="text-sm font-semibold text-slate-300">{sec.label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newShowSections = {
                            about: true,
                            skills: true,
                            projects: true,
                            education: true,
                            experience: true,
                            achievements: true,
                            contact: true,
                            cv: true,
                            ...profile.showSections
                          };
                          newShowSections[sec.id] = !isShown;
                          setProfile({ ...profile, showSections: newShowSections });
                        }}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                          isShown ? 'bg-purple-600 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300"></div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-600/20 flex items-center gap-2"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                Save Profile Parameters
              </button>
            </div>
          </form>
        )}

        {/* --- TAB 2: PROJECTS --- */}
        {activeTab === 'projects' && (
          <div className="space-y-10">
            {/* Manage Project Categories */}
            <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-3">
                <i className="fa-solid fa-tags text-purple-500"></i> Manage Project Categories
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {(profile.projectCategories || ['Software', 'Hardware']).map((cat) => (
                  <div key={cat} className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg">
                    <span className="text-sm font-semibold text-slate-300">{cat}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Delete category "${cat}"? This will not delete the projects under it.`)) {
                          const newCats = (profile.projectCategories || ['Software', 'Hardware']).filter(c => c !== cat);
                          const updatedProfile = { ...profile, projectCategories: newCats };
                          setProfile(updatedProfile);
                          
                          try {
                            const res = await fetch(`${API_BASE}/api/profile`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify(updatedProfile),
                            });
                            if (res.ok) {
                              showStatus('success', `Category "${cat}" deleted`);
                            } else {
                              showStatus('error', 'Failed to save profile changes.');
                            }
                          } catch (err) {
                            showStatus('error', 'Network error while saving changes.');
                          }
                        }
                      }}
                      className="text-red-450 hover:text-red-300 transition-colors"
                      title="Delete Category"
                    >
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const input = e.target.elements.newCategoryName;
                  const catName = input.value.trim();
                  if (!catName) return;
                  
                  const currentCats = profile.projectCategories || ['Software', 'Hardware'];
                  if (currentCats.map(c => c.toLowerCase()).includes(catName.toLowerCase())) {
                    showStatus('error', 'Category already exists!');
                    return;
                  }
                  
                  const newCats = [...currentCats, catName];
                  const updatedProfile = { ...profile, projectCategories: newCats };
                  setProfile(updatedProfile);
                  input.value = '';
                  
                  try {
                    const res = await fetch(`${API_BASE}/api/profile`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(updatedProfile),
                    });
                    if (res.ok) {
                      showStatus('success', `Category "${catName}" added`);
                    } else {
                      showStatus('error', 'Failed to save profile changes.');
                    }
                  } catch (err) {
                    showStatus('error', 'Network error while saving changes.');
                  }
                }} 
                className="flex gap-3"
              >
                <input
                  type="text"
                  name="newCategoryName"
                  required
                  placeholder="e.g. Research, Web App, Aerospace"
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 text-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Add Category
                </button>
              </form>
            </div>

            {/* Add Project Form */}
            <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-3">
                <i className="fa-solid fa-plus text-purple-500"></i> {editingProject ? 'Edit Project' : 'Insert New Portfolio Project'}
              </h3>
              
              <form onSubmit={editingProject ? handleUpdateProject : handleAddProject} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Project Title</label>
                    <input
                      type="text"
                      value={editingProject ? editingProject.title : newProject.title}
                      onChange={(e) => editingProject 
                        ? setEditingProject({ ...editingProject, title: e.target.value })
                        : setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      required
                      placeholder="e.g. Smart Gardening Robot"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Project Category</label>
                    <select
                      value={editingProject ? editingProject.category : (newProject.category || (profile.projectCategories?.[0] || 'Software'))}
                      onChange={(e) => editingProject 
                        ? setEditingProject({ ...editingProject, category: e.target.value })
                        : setNewProject({ ...newProject, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      {(profile.projectCategories || ['Software', 'Hardware']).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                  <textarea
                    value={editingProject ? editingProject.description : newProject.description}
                    onChange={(e) => editingProject 
                      ? setEditingProject({ ...editingProject, description: e.target.value })
                      : setNewProject({ ...newProject, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                    placeholder="Short summary of technologies used and purpose..."
                  ></textarea>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hyperlink URL</label>
                    <input
                      type="url"
                      value={editingProject ? editingProject.link : newProject.link}
                      onChange={(e) => editingProject 
                        ? setEditingProject({ ...editingProject, link: e.target.value })
                        : setNewProject({ ...newProject, link: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hyperlink Label Text</label>
                    <input
                      type="text"
                      value={editingProject ? editingProject.linkLabel : newProject.linkLabel}
                      onChange={(e) => editingProject 
                        ? setEditingProject({ ...editingProject, linkLabel: e.target.value })
                        : setNewProject({ ...newProject, linkLabel: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. View Source on GitHub"
                    />
                  </div>
                </div>

                {/* Cover Image Upload widget */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                    {(editingProject ? editingProject.image : newProject.image) && (
                      <img src={getFullImageUrl(editingProject ? editingProject.image : newProject.image)} className="w-full h-full object-cover" alt="Preview" />
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Image Cover</label>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                      <input
                        type="text"
                        value={editingProject ? editingProject.image : newProject.image}
                        onChange={(e) => editingProject
                          ? setEditingProject({ ...editingProject, image: e.target.value })
                          : setNewProject({ ...newProject, image: e.target.value })}
                        placeholder="Image URL or upload a file"
                        className="flex-grow px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          name="projImage"
                          onChange={(e) => handleImageUpload(e, (url) => {
                            if (editingProject) setEditingProject({ ...editingProject, image: url });
                            else setNewProject({ ...newProject, image: url });
                          })}
                          disabled={uploadingField === 'projImage'}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold w-full transition-all"
                        >
                          {uploadingField === 'projImage' ? 'Uploading...' : 'Upload Image'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  {editingProject && (
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="px-5 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-700"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-500 shadow-md shadow-purple-600/10 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-circle-check"></i>
                    {editingProject ? 'Apply Changes' : 'Insert Project'}
                  </button>
                </div>
              </form>
            </div>

            {/* List of current projects */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-list text-pink-500"></i> Existing Projects ({projects.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.map((project) => (
                  <div key={project.id} className="glass-card bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="h-40 rounded-xl overflow-hidden mb-4 bg-slate-950 border border-slate-850">
                        {project.image && <img src={getFullImageUrl(project.image)} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full">{project.category}</span>
                      <h4 className="font-bold text-lg text-white mt-2 leading-tight">{project.title}</h4>
                      <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed font-light">{project.description}</p>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/80">
                      <a href={project.link} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline text-xs font-semibold flex items-center gap-1">
                        <i className="fa-solid fa-arrow-up-right-from-square"></i> Link
                      </a>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProject(project);
                            document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all text-xs"
                          title="Edit Project"
                        >
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all text-xs"
                          title="Delete Project"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: ACHIEVEMENTS --- */}
        {activeTab === 'achievements' && (
          <div className="space-y-10">
            {/* Add Achievement Form */}
            <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-3">
                <i className="fa-solid fa-plus text-purple-500"></i> {editingAchievement ? 'Edit Achievement' : 'Insert New Achievement'}
              </h3>

              <form onSubmit={editingAchievement ? handleUpdateAchievement : handleAddAchievement} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Achievement Title</label>
                  <input
                    type="text"
                    value={editingAchievement ? editingAchievement.title : newAchievement.title}
                    onChange={(e) => editingAchievement 
                      ? setEditingAchievement({ ...editingAchievement, title: e.target.value })
                      : setNewAchievement({ ...newAchievement, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                    placeholder="e.g. 1st Place - Robotics Competition 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description / Context</label>
                  <textarea
                    value={editingAchievement ? editingAchievement.description : newAchievement.description}
                    onChange={(e) => editingAchievement 
                      ? setEditingAchievement({ ...editingAchievement, description: e.target.value })
                      : setNewAchievement({ ...newAchievement, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    required
                    placeholder="Provide details about the award, date, or event..."
                  ></textarea>
                </div>

                {/* Achievement Image Upload widget */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                    {(editingAchievement ? editingAchievement.image : newAchievement.image) && (
                      <img src={getFullImageUrl(editingAchievement ? editingAchievement.image : newAchievement.image)} className="w-full h-full object-cover" alt="Preview" />
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Achievement Image/Certificate</label>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                      <input
                        type="text"
                        value={editingAchievement ? editingAchievement.image : newAchievement.image}
                        onChange={(e) => editingAchievement
                          ? setEditingAchievement({ ...editingAchievement, image: e.target.value })
                          : setNewAchievement({ ...newAchievement, image: e.target.value })}
                        placeholder="Image URL or upload a file"
                        className="flex-grow px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          name="achImage"
                          onChange={(e) => handleImageUpload(e, (url) => {
                            if (editingAchievement) setEditingAchievement({ ...editingAchievement, image: url });
                            else setNewAchievement({ ...newAchievement, image: url });
                          })}
                          disabled={uploadingField === 'achImage'}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold w-full transition-all"
                        >
                          {uploadingField === 'achImage' ? 'Uploading...' : 'Upload Image'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  {editingAchievement && (
                    <button
                      type="button"
                      onClick={() => setEditingAchievement(null)}
                      className="px-5 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-700"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-500 shadow-md shadow-purple-600/10 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-circle-check"></i>
                    {editingAchievement ? 'Apply Changes' : 'Insert Achievement'}
                  </button>
                </div>
              </form>
            </div>

            {/* List of current achievements */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-award text-pink-500"></i> Registered Achievements ({achievements.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {achievements.map((ach) => (
                  <div key={ach.id} className="glass-card bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="h-44 rounded-xl overflow-hidden mb-4 bg-slate-950 border border-slate-800 flex items-center justify-center">
                        {ach.image && (
                          <img src={getFullImageUrl(ach.image)} className="w-full h-full object-contain" alt="" />
                        )}
                      </div>
                      <h4 className="font-bold text-base text-white leading-tight">{ach.title}</h4>
                      <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed font-light">{ach.description}</p>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setEditingAchievement(ach);
                          document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all text-xs"
                      >
                        <i className="fa-solid fa-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all text-xs"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: SKILLS --- */}
        {activeTab === 'skills' && (
          <div className="space-y-10">
            {/* Add Skill Form */}
            <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-3">
                <i className="fa-solid fa-plus text-purple-500"></i> {editingSkill ? 'Edit Skill Details' : 'Register New Skill'}
              </h3>

              <form onSubmit={editingSkill ? handleUpdateSkill : handleAddSkill} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Skill Name</label>
                    <input
                      type="text"
                      value={editingSkill ? editingSkill.name : newSkill.name}
                      onChange={(e) => editingSkill
                        ? setEditingSkill({ ...editingSkill, name: e.target.value })
                        : setNewSkill({ ...newSkill, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      required
                      placeholder="e.g. React.js, Photoshop"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category Group</label>
                    <select
                      value={editingSkill ? editingSkill.category : newSkill.category}
                      onChange={(e) => editingSkill
                        ? setEditingSkill({ ...editingSkill, category: e.target.value })
                        : setNewSkill({ ...newSkill, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="technical">Technical Stack</option>
                      <option value="tools">Tools & Engineering</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">FontAwesome Icon Class</label>
                    <input
                      type="text"
                      value={editingSkill ? editingSkill.icon : newSkill.icon}
                      onChange={(e) => editingSkill
                        ? setEditingSkill({ ...editingSkill, icon: e.target.value })
                        : setNewSkill({ ...newSkill, icon: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      required
                      placeholder="e.g. fa-brands fa-js, fa-solid fa-microchip"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tailwind Style Color Class (hover effects)</label>
                    <input
                      type="text"
                      value={editingSkill ? editingSkill.color : newSkill.color}
                      onChange={(e) => editingSkill
                        ? setEditingSkill({ ...editingSkill, color: e.target.value })
                        : setNewSkill({ ...newSkill, color: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      required
                      placeholder="e.g. text-yellow-500, text-blue-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  {editingSkill && (
                    <button
                      type="button"
                      onClick={() => setEditingSkill(null)}
                      className="px-5 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-500"
                  >
                    {editingSkill ? 'Apply Changes' : 'Register Skill'}
                  </button>
                </div>
              </form>
            </div>

            {/* List of skills grouped by category */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Technical Group */}
              <div className="glass-card bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h4 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-laptop-code text-purple-500"></i> Technical Stack ({skills.filter(s => ['technical', 'Embedded Systems', 'Electronics', 'Programming'].includes(s.category)).length})
                </h4>
                <div className="space-y-2">
                  {skills.filter(s => ['technical', 'Embedded Systems', 'Electronics', 'Programming'].includes(s.category)).map(skill => (
                    <div key={skill.id} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
                      <div className="flex items-center gap-3">
                        <i className={`${skill.icon} text-lg text-purple-400`}></i>
                        <span className="text-sm font-semibold">{skill.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => {
                          setEditingSkill(skill);
                          document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                        }} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-all"><i className="fa-solid fa-pencil text-xs"></i></button>
                        <button onClick={() => handleDeleteSkill(skill.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-all"><i className="fa-solid fa-trash text-xs"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools & Engineering Group */}
              <div className="glass-card bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h4 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-toolbox text-pink-500"></i> Tools & Engineering ({skills.filter(s => ['tools', 'Engineering Tools'].includes(s.category)).length})
                </h4>
                <div className="space-y-2">
                  {skills.filter(s => ['tools', 'Engineering Tools'].includes(s.category)).map(skill => (
                    <div key={skill.id} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
                      <div className="flex items-center gap-3">
                        <i className={`${skill.icon} text-lg text-pink-400`}></i>
                        <span className="text-sm font-semibold">{skill.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => {
                          setEditingSkill(skill);
                          document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                        }} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-all"><i className="fa-solid fa-pencil text-xs"></i></button>
                        <button onClick={() => handleDeleteSkill(skill.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-all"><i className="fa-solid fa-trash text-xs"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: TIMELINE (EDUCATION & EXPERIENCE) --- */}
        {activeTab === 'timeline' && (
          <div className="space-y-12">
            
            {/* 5a. Education Section */}
            <div className="space-y-6">
              <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-3">
                  <i className="fa-solid fa-graduation-cap text-purple-500"></i> {editingEdu ? 'Edit Education Node' : 'Add Education Node'}
                </h3>

                <form onSubmit={editingEdu ? handleUpdateEdu : handleAddEdu} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Degree / Qualification</label>
                      <input
                        type="text"
                        value={editingEdu ? editingEdu.degree : newEdu.degree}
                        onChange={(e) => editingEdu
                          ? setEditingEdu({ ...editingEdu, degree: e.target.value })
                          : setNewEdu({ ...newEdu, degree: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        required
                        placeholder="B.Sc. in Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Institution</label>
                      <input
                        type="text"
                        value={editingEdu ? editingEdu.institution : newEdu.institution}
                        onChange={(e) => editingEdu
                          ? setEditingEdu({ ...editingEdu, institution: e.target.value })
                          : setNewEdu({ ...newEdu, institution: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        required
                        placeholder="East West University"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Timeline Frame</label>
                      <input
                        type="text"
                        value={editingEdu ? editingEdu.timeline : newEdu.timeline}
                        onChange={(e) => editingEdu
                          ? setEditingEdu({ ...editingEdu, timeline: e.target.value })
                          : setNewEdu({ ...newEdu, timeline: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        required
                        placeholder="2022 - Expected 2027"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Bullet Details / Focus</label>
                      <input
                        type="text"
                        value={editingEdu ? editingEdu.details : newEdu.details}
                        onChange={(e) => editingEdu
                          ? setEditingEdu({ ...editingEdu, details: e.target.value })
                          : setNewEdu({ ...newEdu, details: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        placeholder="Focusing on design patterns, graphics layouts..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    {editingEdu && (
                      <button
                        type="button"
                        onClick={() => setEditingEdu(null)}
                        className="px-5 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-500"
                    >
                      {editingEdu ? 'Apply Changes' : 'Add Education'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Education list */}
              <div className="space-y-3">
                <h4 className="font-bold text-lg text-white">Education History</h4>
                {education.map((edu, index) => (
                  <div
                    key={edu.id}
                    draggable
                    onDragStart={() => handleEduDragStart(index)}
                    onDragOver={(e) => handleEduDragOver(e, index)}
                    onDragEnd={handleEduDragEnd}
                    className={`flex justify-between items-start p-4 bg-slate-900 border rounded-2xl transition-all cursor-move ${
                      draggedEduIndex === index ? 'border-purple-500 opacity-50' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 cursor-grab text-slate-500 hover:text-purple-400 shrink-0">
                        <i className="fa-solid fa-grip-vertical"></i>
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-base leading-snug">{edu.degree}</h5>
                        <p className="text-purple-400 text-xs font-medium mt-1">{edu.institution} • {edu.timeline}</p>
                        {edu.details && <p className="text-slate-400 text-xs mt-2 font-light leading-relaxed">{edu.details}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => {
                         setEditingEdu(edu);
                         document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                       }} className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all text-xs flex items-center justify-center w-8 h-8"><i className="fa-solid fa-pencil"></i></button>
                      <button onClick={() => handleDeleteEdu(edu.id)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all text-xs flex items-center justify-center w-8 h-8"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5b. Experience Section */}
            <div className="space-y-6 pt-6 border-t border-slate-800">
              <div className="glass-card bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-3">
                  <i className="fa-solid fa-briefcase text-purple-500"></i> {editingExp ? 'Edit Experience Item' : 'Add Experience Item'}
                </h3>

                <form onSubmit={editingExp ? handleUpdateExp : handleAddExp} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Role / Position</label>
                      <input
                        type="text"
                        value={editingExp ? editingExp.role : newExp.role}
                        onChange={(e) => editingExp
                          ? setEditingExp({ ...editingExp, role: e.target.value })
                          : setNewExp({ ...newExp, role: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        required
                        placeholder="Creative Lead"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Company / Organization</label>
                      <input
                        type="text"
                        value={editingExp ? editingExp.company : newExp.company}
                        onChange={(e) => editingExp
                          ? setEditingExp({ ...editingExp, company: e.target.value })
                          : setNewExp({ ...newExp, company: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        required
                        placeholder="Design Studio Inc"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Timeline Frame</label>
                      <input
                        type="text"
                        value={editingExp ? editingExp.timeline : newExp.timeline}
                        onChange={(e) => editingExp
                          ? setEditingExp({ ...editingExp, timeline: e.target.value })
                          : setNewExp({ ...newExp, timeline: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        required
                        placeholder="Oct 2025 - Present"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Responsibilities / Details</label>
                      <input
                        type="text"
                        value={editingExp ? editingExp.details : newExp.details}
                        onChange={(e) => editingExp
                          ? setEditingExp({ ...editingExp, details: e.target.value })
                          : setNewExp({ ...newExp, details: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                        required
                        placeholder="Overseeing visual designs and editing local assets..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    {editingExp && (
                      <button
                        type="button"
                        onClick={() => setEditingExp(null)}
                        className="px-5 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-500"
                    >
                      {editingExp ? 'Apply Changes' : 'Add Experience'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Experience list */}
              <div className="space-y-3">
                <h4 className="font-bold text-lg text-white">Experience Timeline</h4>
                {experience.map((exp, index) => (
                  <div
                    key={exp.id}
                    draggable
                    onDragStart={() => handleExpDragStart(index)}
                    onDragOver={(e) => handleExpDragOver(e, index)}
                    onDragEnd={handleExpDragEnd}
                    className={`flex justify-between items-start p-4 bg-slate-900 border rounded-2xl transition-all cursor-move ${
                      draggedExpIndex === index ? 'border-purple-500 opacity-50' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 cursor-grab text-slate-500 hover:text-purple-400 shrink-0">
                        <i className="fa-solid fa-grip-vertical"></i>
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-base leading-snug">{exp.role}</h5>
                        <p className="text-pink-400 text-xs font-medium mt-1">{exp.company} • {exp.timeline}</p>
                        {exp.details && <p className="text-slate-400 text-xs mt-2 font-light leading-relaxed">{exp.details}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => {
                         setEditingExp(exp);
                         document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
                       }} className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all text-xs flex items-center justify-center w-8 h-8"><i className="fa-solid fa-pencil"></i></button>
                      <button onClick={() => handleDeleteExp(exp.id)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all text-xs flex items-center justify-center w-8 h-8"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 6: MESSAGES INBOX --- */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-inbox text-purple-500"></i> Inbox Messages ({messages.length})
              </h3>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold rounded-lg border border-slate-800 text-slate-300"
              >
                <i className="fa-solid fa-rotate mr-2"></i> Refresh Inbox
              </button>
            </div>

            {messages.length === 0 ? (
              <div className="glass-card bg-slate-900 border border-slate-800 p-12 text-center rounded-3xl text-slate-400">
                <i className="fa-regular fa-envelope-open text-4xl mb-4 text-slate-600 block"></i>
                <p className="font-semibold text-base">Your contact inbox is currently empty.</p>
                <p className="text-xs text-slate-500 mt-2">When visitors submit messages via the home page, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id || msg._id}
                    className={`glass-card p-6 border rounded-2xl flex flex-col justify-between transition-all ${
                      msg.read
                        ? 'bg-slate-900/50 border-slate-800 text-slate-300'
                        : 'bg-slate-900 border-purple-500/30 text-white shadow-md shadow-purple-500/5'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800/60 pb-3">
                      <div>
                        <span className="font-bold text-slate-200 text-base">{msg.name}</span>
                        <span className="text-slate-400 text-xs font-medium ml-2">({msg.email})</span>
                      </div>
                      <span className="text-slate-500 text-xs">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Subject</p>
                      <p className="font-semibold text-sm text-slate-100">{msg.subject}</p>
                      <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mt-4 mb-1">Message Content</p>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-850/80 font-light text-left">
                        {msg.message}
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/60">
                      <button
                        onClick={() => handleToggleReadMessage(msg.id || msg._id, msg.read)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          msg.read
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white'
                        }`}
                      >
                        <i className={`fa-solid ${msg.read ? 'fa-envelope' : 'fa-envelope-open'} mr-1.5`}></i>
                        Mark {msg.read ? 'Unread' : 'Read'}
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id || msg._id)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-semibold rounded-lg transition-all"
                      >
                        <i className="fa-solid fa-trash mr-1.5"></i>
                        Delete Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
