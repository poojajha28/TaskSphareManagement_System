
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, CheckCircle, Calendar, Plus, AlertTriangle, ListTodo, UserCheck, FolderKanban } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';
import PieChart from '../components/PieChart';
import { api } from '../config/api';

function Dashboard() {
  const { user, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalTasks: 0, todoTasks: 0, inProgressTasks: 0, doneTasks: 0, overdueTasks: 0, tasksPerUser: [] });
  const [recentTasks, setRecentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [projectStats, setProjectStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userProfile) return;
    fetchDashboardData();
  }, [user, userProfile]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardStats, allTasks, overdueData, projStats] = await Promise.all([
        api.getDashboardStats(),
        api.get('/tasks'),
        api.getOverdueTasks(),
        api.getProjectWiseStats()
      ]);
      setStats(dashboardStats);
      setRecentTasks(allTasks.slice(0, 5).map(task => ({ ...task })));
      const overdueArr = Array.isArray(overdueData) ? overdueData : [];
      setOverdueTasks(overdueArr.slice(0, 5));
      setProjectStats(Array.isArray(projStats) ? projStats : []);
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

  const PIE_COLORS = { todo: '#94a3b8', inProgress: '#f59e0b', done: '#10b981', overdue: '#ef4444' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center space-x-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur-lg opacity-30 animate-pulse"></div>
            <h1 className="relative text-3xl font-bold text-white">Welcome back, {userProfile?.displayName}!</h1>
          </div>
        </div>
        <p className="text-gray-400 mt-2 text-lg">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Tasks', value: stats.totalTasks, icon: BarChart3, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25', textGrad: 'from-blue-400 to-blue-300' },
          { label: 'To Do', value: stats.todoTasks, icon: ListTodo, gradient: 'from-slate-400 to-slate-600', shadow: 'shadow-slate-500/25', textGrad: 'from-slate-300 to-slate-400' },
          { label: 'In Progress', value: stats.inProgressTasks, icon: TrendingUp, gradient: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-500/25', textGrad: 'from-amber-300 to-amber-400' },
          { label: 'Done', value: stats.doneTasks, icon: CheckCircle, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/25', textGrad: 'from-emerald-300 to-emerald-400' },
          { label: 'Overdue', value: stats.overdueTasks, icon: AlertTriangle, gradient: 'from-red-400 to-red-600', shadow: 'shadow-red-500/25', textGrad: 'from-red-300 to-red-400' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="group bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] hover:bg-white/[0.06] transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{card.label}</p>
                <div className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg ${card.shadow} transform transition-transform group-hover:rotate-6 group-hover:scale-110`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className={`text-3xl font-extrabold bg-gradient-to-r ${card.textGrad} bg-clip-text text-transparent`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Project-wise Pie Charts */}
      {projectStats.length > 0 && (
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-purple-500/20 transition-all duration-300 mb-8">
          <div className="px-6 py-4 bg-purple-500/10 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <FolderKanban className="w-5 h-5 text-purple-400" />
              <span>Project-wise Task Distribution</span>
            </h3>
            <span className="text-xs font-semibold text-purple-400/80 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              {projectStats.length} projects
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projectStats.map((proj) => {
                const todo = Number(proj.todo_count) || 0;
                const inProg = Number(proj.in_progress_count) || 0;
                const done = Number(proj.done_count) || 0;
                const overdue = Number(proj.overdue_count) || 0;
                const total = Number(proj.total_tasks) || 0;
                const pieData = [
                  { label: 'To Do', value: todo, color: PIE_COLORS.todo },
                  { label: 'In Progress', value: inProg, color: PIE_COLORS.inProgress },
                  { label: 'Done', value: done, color: PIE_COLORS.done },
                  { label: 'Overdue', value: overdue, color: PIE_COLORS.overdue },
                ];
                return (
                  <div key={proj.project_id} className="bg-white/[0.04] rounded-xl p-5 border border-white/[0.06] hover:border-purple-500/20 hover:bg-purple-500/[0.04] transition-all duration-300 group">
                    <h4 className="text-sm font-bold text-white mb-1 truncate group-hover:text-purple-300 transition-colors">{proj.project_name}</h4>
                    <p className="text-xs text-gray-500 mb-4">{total} total tasks</p>
                    <div className="flex justify-center mb-4">
                      <PieChart data={pieData} size={130} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'To Do', value: todo, dotColor: 'bg-slate-400', textColor: 'text-gray-400' },
                        { label: 'In Progress', value: inProg, dotColor: 'bg-amber-400', textColor: 'text-amber-400' },
                        { label: 'Done', value: done, dotColor: 'bg-emerald-400', textColor: 'text-emerald-400' },
                        { label: 'Overdue', value: overdue, dotColor: overdue > 0 ? 'bg-red-400 animate-pulse' : 'bg-red-400/30', textColor: overdue > 0 ? 'text-red-400' : 'text-red-400/40' },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-white/[0.03]">
                          <div className={`w-2 h-2 rounded-full ${s.dotColor} flex-shrink-0`}></div>
                          <span className={`text-[10px] ${s.textColor}`}>{s.label}</span>
                          <span className={`text-[10px] font-bold ${s.textColor} ml-auto`}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tasks Per User (Admin Only) */}
      {isAdmin && stats.tasksPerUser && stats.tasksPerUser.length > 0 && (
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-amber-500/20 transition-all duration-300 mb-8">
          <div className="px-6 py-4 bg-amber-500/10 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span>Tasks Per User</span>
            </h3>
            <span className="text-xs font-semibold text-amber-400/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">{stats.tasksPerUser.length} members</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stats.tasksPerUser.map((u) => {
                const total = Number(u.task_count) || 0;
                const todo = Number(u.todo_count) || 0;
                const inProgress = Number(u.in_progress_count) || 0;
                const done = Number(u.completed_count) || 0;
                const overdue = Number(u.overdue_count) || 0;
                const donePercent = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={u.id} className="p-4 bg-white/5 rounded-xl hover:bg-amber-500/[0.06] transition-all duration-300 border border-white/[0.04] hover:border-amber-500/20 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                          <span className="text-white font-bold text-sm">{u.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white">{u.name}</span>
                          <p className="text-xs text-gray-500">{total} tasks</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-amber-400">{donePercent}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
                      <div className="h-full flex">
                        {done > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${(done / total) * 100}%` }}></div>}
                        {inProgress > 0 && <div className="bg-amber-500 h-full" style={{ width: `${(inProgress / total) * 100}%` }}></div>}
                        {todo > 0 && <div className="bg-gray-500 h-full" style={{ width: `${(todo / total) * 100}%` }}></div>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2 px-2 py-1.5 bg-gray-500/10 rounded-lg border border-gray-500/20">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <span className="text-xs text-gray-400">To Do</span>
                        <span className="text-xs font-bold text-gray-300 ml-auto">{todo}</span>
                      </div>
                      <div className="flex items-center space-x-2 px-2 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <span className="text-xs text-amber-400">In Prog</span>
                        <span className="text-xs font-bold text-amber-300 ml-auto">{inProgress}</span>
                      </div>
                      <div className="flex items-center space-x-2 px-2 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span className="text-xs text-emerald-400">Done</span>
                        <span className="text-xs font-bold text-emerald-300 ml-auto">{done}</span>
                      </div>
                      {overdue > 0 ? (
                        <div className="flex items-center space-x-2 px-2 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                          <span className="text-xs text-red-400">Overdue</span>
                          <span className="text-xs font-bold text-red-300 ml-auto">{overdue}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 px-2 py-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-xs text-emerald-500">OK</span>
                          <span className="text-xs font-bold text-emerald-400 ml-auto">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
                <Button size="sm" className="flex items-center space-x-1" onClick={() => navigate('/tasks')}>
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
                  <Calendar className="w-24 h-24 text-blue-400/50 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">No tasks yet</h4>
                  <p className="text-gray-400 mb-6">{isAdmin ? 'Create your first task to get started!' : 'No tasks assigned to you yet.'}</p>
                  {isAdmin && <Button onClick={() => navigate('/tasks')}>Create Task</Button>}
                </div>
              )}
            </div>
          </div>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="bg-white/[0.03] rounded-2xl border border-red-500/20 overflow-hidden hover:border-red-500/30 transition-all duration-300">
              <div className="px-6 py-4 bg-red-500/10 border-b border-red-500/20 flex justify-between items-center">
                <h3 className="text-lg font-bold text-red-400 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Overdue Tasks</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {overdueTasks.map((task, index) => (
                  <div key={task.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-fadeIn">
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all duration-300 group">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-20"></div>
            <div className="px-6 pb-6 -mt-10 text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-[#0a0a1a] transform transition-transform group-hover:scale-110">
                  <span className="text-white font-bold text-2xl">{userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
              </div>
              <h4 className="font-bold text-white text-lg">{userProfile?.displayName}</h4>
              <p className="text-sm text-gray-400 mb-2">{userProfile?.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${isAdmin ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'}`}>
                {isAdmin ? '🛡️ Admin' : '👤 Member'}
              </span>
              <div className="text-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <span className="font-extrabold text-xl text-white">{userProfile?.tasksCompleted || 0}</span>
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tasks Done</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all duration-300">
            <div className="px-6 py-4 bg-white/5 border-b border-white/[0.06]">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>⚡</span><span>Quick Actions</span>
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {isAdmin && (
                <Button variant="outline" className="w-full justify-start text-white hover:bg-blue-500/10 hover:border-blue-500/30" onClick={() => navigate('/tasks')}>
                  <Plus className="w-4 h-4 mr-2" />Create New Task
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start text-white hover:bg-purple-500/10 hover:border-purple-500/30" onClick={() => navigate('/projects')}>
                <Users className="w-4 h-4 mr-2" />View Projects
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;