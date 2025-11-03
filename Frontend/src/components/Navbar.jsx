import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Star, Coins, User, Shield, Menu, X } from 'lucide-react';

function Navbar() {
  const { logout, userProfile } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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