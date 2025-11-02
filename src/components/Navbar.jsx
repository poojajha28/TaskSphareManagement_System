import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Star, Coins, User, Shield } from 'lucide-react';

function Navbar() {
  const { logout, userProfile } = useAuth();
  const location = useLocation();

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
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo - Left */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">TaskSphere</span>
            </Link>
          </div>

          {/* Nav Items - Center */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-2 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
            
            {adminNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-2 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-red-100 text-red-700'
                    : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Info - Right */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* User Stats - Compact */}
            <div className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-lg">
              {userProfile?.role === 'admin' && (
                <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-bold flex items-center space-x-0.5">
                  <Shield className="w-3 h-3" />
                  <span className="hidden sm:inline">ADMIN</span>
                </span>
              )}
              <div className="flex items-center space-x-1">
                <Coins className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" />
                <span className="text-xs lg:text-sm font-medium">{userProfile?.rewardPoints || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 lg:w-4 lg:h-4 text-orange-500" />
                <span className="text-xs lg:text-sm font-medium">{userProfile?.rating || 0}/5</span>
              </div>
            </div>

            {/* User Profile - Compact */}
            <div className="flex items-center space-x-1 lg:space-x-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="text-xs lg:text-sm font-medium hidden lg:inline max-w-[100px] truncate">
                {userProfile?.displayName}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-2 py-2 rounded-md text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;