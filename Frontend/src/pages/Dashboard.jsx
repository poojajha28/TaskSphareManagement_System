
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, CheckCircle, Calendar, Plus, AlertTriangle, ListTodo, UserCheck } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';
import { api } from '../config/api';

function Dashboard() {
  const { user, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
    overdueTasks: 0,
    tasksPerUser: []
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userProfile) return;
    fetchDashboardData();
  }, [user, userProfile]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardStats, allTasks, overdueData] = await Promise.all([
        api.getDashboardStats(),
        api.get('/tasks'),
        api.getOverdueTasks()
      ]);

      setStats(dashboardStats);

      // Get recent 5 tasks
      const recentUserTasks = allTasks.slice(0, 5);
      const formattedTasks = recentUserTasks.map(task => ({
        ...task,
        due_date: task.due_date,
        estimated_hours: task.estimated_hours,
        assigned_to_name: task.assigned_to_name
      }));
      setRecentTasks(formattedTasks);

      // Set overdue tasks
      const overdueArr = Array.isArray(overdueData) ? overdueData : [];
      setOverdueTasks(overdueArr.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 transform transition-all duration-500 animate-fadeIn">
        <div className="flex items-center space-x-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur-lg opacity-30 animate-pulse"></div>
            <h1 className="relative text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Welcome back, {userProfile?.displayName}! 👋
            </h1>
          </div>
        </div>
        <p className="text-gray-400 mt-2 text-lg">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Tasks */}
        <div className="group bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.06] hover:border-blue-500/30 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Total Tasks</p>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transform transition-transform group-hover:rotate-6 group-hover:scale-110">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">{stats.totalTasks}</p>
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full w-full"></div>
          </div>
        </div>

        {/* To Do */}
        <div className="group bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.06] hover:border-gray-500/30 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">To Do</p>
            <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/25 transform transition-transform group-hover:rotate-6 group-hover:scale-110">
              <ListTodo className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent">{stats.todoTasks}</p>
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-slate-400 to-slate-500 rounded-full" style={{ width: `${stats.totalTasks > 0 ? (stats.todoTasks / stats.totalTasks) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* In Progress */}
        <div className="group bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.06] hover:border-amber-500/30 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">In Progress</p>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 transform transition-transform group-hover:rotate-6 group-hover:scale-110">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">{stats.inProgressTasks}</p>
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Completed */}
        <div className="group bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.06] hover:border-emerald-500/30 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Done</p>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 transform transition-transform group-hover:rotate-6 group-hover:scale-110">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">{stats.doneTasks}</p>
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${stats.totalTasks > 0 ? (stats.doneTasks / stats.totalTasks) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Overdue */}
        <div className="group bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.06] hover:border-red-500/30 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Overdue</p>
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25 transform transition-transform group-hover:rotate-6 group-hover:scale-110">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-extrabold bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">{stats.overdueTasks}</p>
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: `${stats.totalTasks > 0 ? (stats.overdueTasks / stats.totalTasks) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all duration-300 mb-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/[0.06] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>📋</span>
                <span>Recent Tasks</span>
              </h3>
              {isAdmin && (
                <Button 
                  size="sm" 
                  className="flex items-center space-x-1"
                  onClick={() => navigate('/tasks')}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </Button>
              )}
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
                    <Calendar className="w-24 h-24 text-blue-400/50 relative" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">No tasks yet</h4>
                  <p className="text-gray-400 mb-6">
                    {isAdmin ? 'Create your first task to get started!' : 'No tasks assigned to you yet.'}
                  </p>
                  {isAdmin && (
                    <Button onClick={() => navigate('/tasks')}>
                      Create Task
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Overdue Tasks Section */}
          {overdueTasks.length > 0 && (
            <div className="bg-white/[0.03] rounded-2xl border border-red-500/20 overflow-hidden hover:border-red-500/30 transition-all duration-300">
              <div className="px-6 py-4 bg-red-500/10 border-b border-red-500/20 flex justify-between items-center">
                <h3 className="text-lg font-bold text-red-400 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Overdue Tasks</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {overdueTasks.map((task, index) => (
                    <div key={task.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-fadeIn">
                      <TaskCard task={task} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all duration-300 group">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-20"></div>
            <div className="px-6 pb-6 -mt-10">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-[#0a0a1a] transform transition-transform group-hover:scale-110">
                    <span className="text-white font-bold text-2xl">
                      {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-white text-lg">{userProfile?.displayName}</h4>
                <p className="text-sm text-gray-400 mb-2">{userProfile?.email}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                  isAdmin ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                }`}>
                  {isAdmin ? '🛡️ Admin' : '👤 Member'}
                </span>
                
                <div className="text-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 group">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                      <span className="font-extrabold text-xl text-white">{userProfile?.tasksCompleted || 0}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tasks Done</p>
                  </div>
              </div>
            </div>
          </div>

          {/* Tasks Per User (Admin Only) */}
          {isAdmin && stats.tasksPerUser && stats.tasksPerUser.length > 0 && (
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all duration-300">
              <div className="px-6 py-4 bg-indigo-500/10 border-b border-white/[0.06]">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  <span>Tasks Per User</span>
                </h3>
              </div>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {stats.tasksPerUser.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-indigo-500/10 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{u.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-300 truncate max-w-[120px]">{u.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg font-bold border border-blue-500/30">{u.task_count} total</span>
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg font-bold border border-emerald-500/30">{u.completed_count} done</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all duration-300">
            <div className="px-6 py-4 bg-white/5 border-b border-white/[0.06]">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>⚡</span>
                <span>Quick Actions</span>
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start group hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-all duration-300 transform hover:scale-[1.02]"
                  onClick={() => navigate('/tasks')}
                >
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                  Create New Task
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full justify-start group hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => navigate('/projects')}
              >
                <Users className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                View Projects
              </Button>
            </div>
          </div>

          {/* Achievement */}
          <div className="relative bg-gradient-to-br from-purple-600/30 via-blue-600/30 to-indigo-700/30 rounded-2xl p-6 text-white overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-purple-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-3xl animate-bounce">🎉</span>
                <h3 className="text-xl font-bold">Achievement</h3>
              </div>
              <p className="text-sm opacity-95 mb-4 leading-relaxed text-gray-300">
                You've completed <span className="font-bold text-lg text-white">{userProfile?.tasksCompleted || 0}</span> tasks! 
                Keep up the great work! 🚀
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-xs font-semibold mb-3 text-gray-300">Next milestone: {Math.ceil((userProfile?.tasksCompleted || 0) / 10) * 10} tasks</p>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
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