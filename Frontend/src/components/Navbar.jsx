import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Star, Coins, User, Shield, Menu, X, Bell } from 'lucide-react';
import { api } from '../config/api';

function Navbar() {
  const { logout, userProfile } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
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

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/rewards', label: 'Rewards', icon: '🎁' }
  ];

  const adminNavItems = userProfile?.role === 'admin' 
    ? [{ path: '/admin/users', label: 'Users', icon: '👥' }]
    : [];

  return (
    <nav className="bg-gradient-to-r from-white to-blue-50 shadow-lg border-b border-blue-100 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo - Left */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-lg">T</span>
              </div>
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
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
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
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50 scale-105'
                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
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
            <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm">
              {userProfile?.role === 'admin' && (
                <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-md shadow-red-500/30">
                  <Shield className="w-3 h-3" />
                  <span className="hidden sm:inline">ADMIN</span>
                </span>
              )}
              <div className="flex items-center space-x-1 group">
                <div className="p-1 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                  <Coins className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-xs lg:text-sm font-bold text-gray-700">{userProfile?.rewardPoints || 0}</span>
              </div>
              <div className="flex items-center space-x-1 group">
                <div className="p-1 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <Star className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-xs lg:text-sm font-bold text-gray-700">{userProfile?.rating || 0}/5</span>
              </div>
            </div>

            {/* User Profile - Compact */}
            <div className="hidden lg:flex items-center space-x-2 group cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50 transition-all">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium max-w-[100px] truncate text-gray-700">
                {userProfile?.displayName}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
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
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {overdueTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{overdueTasks.length}</span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">Overdue Tasks</h4>
                      <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {loadingNotif && <div className="text-sm text-gray-500">Loading...</div>}

                    {!loadingNotif && overdueTasks.length === 0 && (
                      <div className="text-sm text-gray-500">No overdue tasks</div>
                    )}

                    <div className="space-y-2 max-h-64 overflow-auto">
                      {overdueTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setShowNotif(false);
                            navigate(`/tasks/${t.id}`);
                          }}
                          className="cursor-pointer p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-100"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{t.title}</div>
                              <div className="text-xs text-gray-500 truncate">Due: {new Date(t.due_date).toLocaleDateString()}</div>
                            </div>
                            <div className="ml-2 text-xs text-red-600 font-semibold">{t.daysOverdue}d</div>
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
              className="hidden md:flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 transform hover:scale-105"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slideDown">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'text-gray-600 hover:bg-blue-50'
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
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
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