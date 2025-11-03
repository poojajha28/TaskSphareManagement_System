import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, CheckCircle, Star, Coins, Calendar, Plus } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';
import { api } from '../config/api';

function Dashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalProjects: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all tasks
      const allTasks = await api.get('/tasks');
      
      // Filter user's tasks
      const userTasks = allTasks.filter(task => task.assigned_to === user.id);
      
      // Get recent 5 tasks
      const recentUserTasks = userTasks.slice(0, 5);
      
      // Convert MySQL fields to match UI expectations
      const formattedTasks = recentUserTasks.map(task => ({
        ...task,
        due_date: task.due_date,
        estimated_hours: task.estimated_hours,
        assigned_to_name: task.assigned_to_name
      }));
      
      setRecentTasks(formattedTasks);
      
      // Calculate stats
      setStats({
        totalTasks: userTasks.length,
        completedTasks: userTasks.filter(t => t.status === 'done').length,
        inProgressTasks: userTasks.filter(t => t.status === 'in-progress').length,
        totalProjects: 0 // Can fetch from /projects if needed
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 transform transition-all duration-500 animate-fadeIn">
        <div className="flex items-center space-x-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur-lg opacity-50 animate-pulse"></div>
            <h1 className="relative text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome back, {userProfile?.displayName}! 👋
            </h1>
          </div>
        </div>
        <p className="text-gray-600 mt-2 text-lg">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg shadow-blue-500/10 p-6 border border-blue-100 hover:shadow-xl hover:shadow-blue-500/20 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Tasks</p>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform transition-transform group-hover:rotate-6 group-hover:scale-110">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{stats.totalTasks}</p>
          <div className="mt-3 h-1 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full w-full"></div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg shadow-green-500/10 p-6 border border-green-100 hover:shadow-xl hover:shadow-green-500/20 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 transform transition-transform group-hover:rotate-6 group-hover:scale-110">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">{stats.completedTasks}</p>
          <div className="mt-3 h-1 bg-green-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-lg shadow-yellow-500/10 p-6 border border-yellow-100 hover:shadow-xl hover:shadow-yellow-500/20 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">In Progress</p>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 transform transition-transform group-hover:rotate-6 group-hover:scale-110">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">{stats.inProgressTasks}</p>
          <div className="mt-3 h-1 bg-yellow-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full" style={{ width: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg shadow-purple-500/10 p-6 border border-purple-100 hover:shadow-xl hover:shadow-purple-500/20 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Projects</p>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 transform transition-transform group-hover:rotate-6 group-hover:scale-110">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{stats.totalProjects}</p>
          <div className="mt-3 h-1 bg-purple-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full w-full"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <span>📋</span>
                <span>Recent Tasks</span>
              </h3>
              <Button 
                size="sm" 
                className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                onClick={() => navigate('/tasks')}
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </Button>
            </div>
            <div className="p-6">
              {recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map((task, index) => (
                    <div key={task.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-fadeIn">
                      <TaskCard task={task} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                    <Calendar className="w-24 h-24 text-blue-400 relative" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">No tasks yet</h4>
                  <p className="text-gray-600 mb-6">Create your first task to get started on your journey!</p>
                  <Button onClick={() => navigate('/tasks')} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
                    Create Task
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile & Quick Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-20"></div>
            <div className="px-6 pb-6 -mt-10">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-white transform transition-transform group-hover:scale-110">
                    <span className="text-white font-bold text-2xl">
                      {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">{userProfile?.displayName}</h4>
                <p className="text-sm text-gray-500 mb-4">{userProfile?.email}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 group">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Coins className="w-5 h-5 text-yellow-600" />
                      <span className="font-extrabold text-xl text-gray-900">{userProfile?.rewardPoints || 0}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Points</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 group">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Star className="w-5 h-5 text-orange-600" />
                      <span className="font-extrabold text-xl text-gray-900">{userProfile?.rating || 0}/5</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <span>⚡</span>
                <span>Quick Actions</span>
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start group hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => navigate('/tasks')}
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                Create New Task
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start group hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => navigate('/projects')}
              >
                <Users className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                View Projects
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start group hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => navigate('/rewards')}
              >
                <Star className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                View Rewards
              </Button>
            </div>
          </div>

          {/* Achievement */}
          <div className="relative bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-3xl animate-bounce">🎉</span>
                <h3 className="text-xl font-bold">Achievement</h3>
              </div>
              <p className="text-sm opacity-95 mb-4 leading-relaxed">
                You've completed <span className="font-bold text-lg">{userProfile?.tasksCompleted || 0}</span> tasks! 
                Keep up the great work! 🚀
              </p>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-30">
                <p className="text-xs font-semibold mb-3">Next milestone: {Math.ceil((userProfile?.tasksCompleted || 0) / 10) * 10} tasks</p>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-300 to-orange-400 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ 
                      width: `${((userProfile?.tasksCompleted || 0) % 10) * 10}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;