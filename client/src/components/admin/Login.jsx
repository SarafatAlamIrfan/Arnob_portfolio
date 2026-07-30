import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Is backend server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6 bg-slate-900 text-white">
      {/* Animated blobs in background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md z-10 glass-card bg-white/5 border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 mb-4 shadow-lg shadow-purple-500/20">
            <i className="fa-solid fa-user-shield text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-2">Manage Arnob's Portfolio</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center font-medium">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <i className="fa-solid fa-user"></i>
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Logging in...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
