
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Menu, X, Bell } from 'lucide-react';
import { api } from '../config/api';

function Navbar() {
  const { logout, userProfile } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleDocClick(e) {
      if (!notifRef.current) return;
      if (showNotif && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [showNotif]);

  // Fetch overdue tasks on mount so badge count always shows
  useEffect(() => {
    const fetchOverdueCount = async () => {
      try {
        const res = await api.getOverdueTasks();
        const tasks = Array.isArray(res) ? res : (res && res.data) || [];
        const mapped = (tasks || []).map((t) => ({
          ...t,
          daysOverdue: Math.max(1, Math.floor((Date.now() - Date.parse(t.due_date)) / (1000 * 60 * 60 * 24)))
        }));
        setOverdueTasks(mapped);
      } catch (err) {
        setOverdueTasks([]);
      }
    };
    fetchOverdueCount();
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' }
  ];

  const adminNavItems = userProfile?.role === 'admin' 
    ? [{ path: '/admin/users', label: 'Users', icon: '👥' }]
    : [];

  return (
    <nav className="bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo - Left */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-500/25">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hidden sm:inline">TaskSphere</span>
            </Link>
          </div>

          {/* Nav Items - Center */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center space-x-1 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="transform transition-transform group-hover:scale-110">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
                {location.pathname === item.path && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
            
            {adminNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center space-x-1 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30 scale-105'
                    : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                }`}
              >
                <span className="transform transition-transform group-hover:scale-110">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Info - Right */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* User Stats - Compact */}
            <div className="hidden sm:flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              {userProfile?.role === 'admin' && (
                <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-md shadow-red-500/30">
                  <Shield className="w-3 h-3" />
                  <span className="hidden sm:inline">ADMIN</span>
                </span>
              )}
              <div className="flex items-center space-x-1 group">
                <div className="p-1 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs lg:text-sm font-bold text-gray-300">{userProfile?.displayName}</span>
              </div>
            </div>

            {/* User Profile - Compact */}
            <div className="hidden lg:flex items-center space-x-2 group cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5 transition-all">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-blue-500/25">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium max-w-[100px] truncate text-gray-300">
                {userProfile?.displayName}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={async () => {
                  const opening = !showNotif;
                  setShowNotif(opening);
                  if (opening) {
                    setLoadingNotif(true);
                    try {
                      const res = await api.getOverdueTasks();
                      const tasks = Array.isArray(res) ? res : (res && res.data) || [];
                      const mapped = (tasks || []).map((t) => ({
                        ...t,
                        daysOverdue: Math.max(1, Math.floor((Date.now() - Date.parse(t.due_date)) / (1000 * 60 * 60 * 24)))
                      }));
                      setOverdueTasks(mapped);
                    } catch (err) {
                      setOverdueTasks([]);
                    } finally {
                      setLoadingNotif(false);
                    }
                  }
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
                {overdueTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{overdueTasks.length}</span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-[#12122a] rounded-xl shadow-2xl border border-white/10 z-50">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white">Overdue Tasks</h4>
                      <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {loadingNotif && <div className="text-sm text-gray-400">Loading...</div>}

                    {!loadingNotif && overdueTasks.length === 0 && (
                      <div className="text-sm text-gray-500">No overdue tasks</div>
                    )}

                    <div className="space-y-2 max-h-64 overflow-auto">
                      {overdueTasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-2 rounded-lg bg-white/5 border border-white/5"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-200 truncate">{t.title}</div>
                              <div className="text-xs text-gray-500 truncate">Due: {new Date(t.due_date).toLocaleDateString()}</div>
                            </div>
                            <div className="ml-2 text-xs text-red-400 font-semibold">{t.daysOverdue}d</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="hidden md:flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 transform hover:scale-105"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/5 animate-slideDown">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                      : 'text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;