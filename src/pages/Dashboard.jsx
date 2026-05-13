import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart3, TrendingUp, Users, CheckCircle, Star, Coins, Calendar, Plus } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';

function Dashboard() {
  const { user, userProfile } = useAuth();
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

    // Fetch user's tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentTasks(tasks);
    });

    // Fetch stats
    fetchStats();

    setLoading(false);
    return unsubscribe;
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get all tasks assigned to user
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', user.uid)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const allTasks = tasksSnapshot.docs.map(doc => doc.data());

      // Get all projects where user is a member
      const projectsQuery = query(
        collection(db, 'projects')
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const allProjects = projectsSnapshot.docs.map(doc => doc.data())
        .filter(project => project.teamMembers?.some(member => member.uid === user.uid));

      setStats({
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter(task => task.status === 'done').length,
        inProgressTasks: allTasks.filter(task => task.status === 'in-progress').length,
        totalProjects: allProjects.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.displayName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inProgressTasks}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
              <Button size="sm" className="flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </Button>
            </div>
            <div className="p-6">
              {recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h4>
                  <p className="text-gray-600 mb-4">Create your first task to get started!</p>
                  <Button>Create Task</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile & Quick Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">
                  {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900">{userProfile?.displayName}</h4>
              <p className="text-sm text-gray-600 mb-4">{userProfile?.email}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-lg">{userProfile?.rewardPoints || 0}</span>
                  </div>
                  <p className="text-xs text-gray-600">Points</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-lg">{userProfile?.rating || 0}/5</span>
                  </div>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create New Task
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Join Project
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Star className="w-4 h-4 mr-2" />
                View Rewards
              </Button>
            </div>
          </div>

          {/* Achievement */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">🎉 Achievement</h3>
            <p className="text-sm opacity-90 mb-3">
              You've completed {userProfile?.tasksCompleted || 0} tasks! 
              Keep up the great work!
            </p>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-xs">Next milestone: {Math.ceil((userProfile?.tasksCompleted || 0) / 10) * 10} tasks</p>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
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
  );
}

export default Dashboard;