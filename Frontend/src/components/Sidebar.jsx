
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Menu, X, Bell, LayoutDashboard, FolderKanban, ListChecks, Trophy, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../config/api';

function Sidebar() {
  const { logout, userProfile, isAdmin } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/tasks', label: 'Tasks', icon: ListChecks },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy }
  ];

  const adminNavItems = isAdmin
    ? [{ path: '/admin/users', label: 'Users', icon: Users }]
    : [];

  const handleNotifClick = async () => {
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
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-500/25 flex-shrink-0">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap sidebar-text-transition">
              TaskSphere
            </span>
          )}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className={`text-[10px] font-bold uppercase tracking-widest text-gray-500 px-3 mb-3 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•••' : 'Menu'}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center ${collapsed ? 'justify-center' : ''} space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {!collapsed && <span className="sidebar-text-transition">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}

        {/* Admin Section */}
        {adminNavItems.length > 0 && (
          <>
            <div className="my-3 border-t border-white/[0.06]"></div>
            <p className={`text-[10px] font-bold uppercase tracking-widest text-red-500/70 px-3 mb-3 ${collapsed ? 'text-center' : ''}`}>
              {collapsed ? '⚡' : 'Admin'}
            </p>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center ${collapsed ? 'justify-center' : ''} space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white border border-red-500/30 shadow-lg shadow-red-500/10'
                      : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/[0.08]'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isActive ? 'text-red-400' : 'text-red-500/50 group-hover:text-red-400'}`} />
                  {!collapsed && <span className="sidebar-text-transition">{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/[0.06] p-3 space-y-2">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifClick}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all duration-300`}
            title="Notifications"
          >
            <div className="relative flex-shrink-0">
              <Bell className="w-5 h-5" />
              {overdueTasks.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {overdueTasks.length}
                </span>
              )}
            </div>
            {!collapsed && <span className="sidebar-text-transition">Notifications</span>}
          </button>

          {showNotif && (
            <div className={`absolute ${collapsed ? 'left-full ml-2' : 'left-0'} bottom-full mb-2 w-80 bg-[#12122a] rounded-xl shadow-2xl border border-white/10 z-[60]`}>
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
                    <div key={t.id} className="p-2 rounded-lg bg-white/5 border border-white/5">
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

        {/* User Profile */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : ''} space-x-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]`}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 sidebar-text-transition">
              <p className="text-sm font-semibold text-white truncate">{userProfile?.displayName}</p>
              <div className="flex items-center space-x-1">
                {isAdmin ? (
                  <span className="text-[10px] font-bold text-red-400 flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>ADMIN</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-blue-400">MEMBER</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Logout"
          className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-300`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="sidebar-text-transition">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[70] p-2.5 bg-[#0f0f23]/90 backdrop-blur-xl rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-lg"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen bg-[#0a0a1a]/95 backdrop-blur-xl border-r border-white/[0.06] sticky top-0 z-50 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1a1a2e] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-500/20 transition-all z-50"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-[260px] bg-[#0a0a1a]/98 backdrop-blur-xl border-r border-white/[0.06] z-[60] flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default Sidebar;
