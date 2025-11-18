import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { api } from '../config/api';
import toast from 'react-hot-toast';

const statusColumns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-purple-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' }
];

function Tasks() {
  const { user, userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksData = await api.get('/tasks');
      setTasks(tasksData);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await api.post('/tasks', {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        estimated_hours: taskData.estimatedHours,
        due_date: taskData.dueDate,
        assigned_to: taskData.assignedTo,
        project_id: taskData.projectId || null
      });
      
      setShowCreateModal(false);
      toast.success('Task created successfully!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsData = await api.get('/projects');
      setProjects(projectsData);
    } catch (error) {
     toast.error("Failed to load projects")
    }
  };

  const filteredTasks = tasks.filter(task => {
    // Admin sees all, users see only their assigned tasks
    const matchesFilter = filter === 'all' 
      ? (userProfile?.role === 'admin' || task.assigned_to === user?.id)
      : filter === 'my-tasks' 
      ? task.assigned_to === user?.id
      : filter === 'created-by-me' 
      ? task.created_by === user?.id
      : false;
    
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status);
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {userProfile?.role === 'admin' ? 'Manage all tasks' : 'Manage and track your tasks'}
          </p>
        </div>
        <Button
          onClick={() => {
            if (!projects || projects.length === 0) {
              message.error('Please create a project first');
              return;
            }
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Task</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{userProfile?.role === 'admin' ? 'All Tasks' : 'My Tasks'}</option>
            <option value="my-tasks">Assigned to Me</option>
            {userProfile?.role === 'admin' && <option value="created-by-me">Created by Me</option>}
          </select>
        </div>
        
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map(column => (
          <div key={column.id} className="bg-gray-50 rounded-lg p-4">
            <div className={`${column.color} rounded-lg p-3 mb-4`}>
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="text-sm text-gray-600">
                {getTasksByStatus(column.id).length} tasks
              </span>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {getTasksByStatus(column.id).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdate={(updatedTask) => {
                    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
                  }}
                />
              ))}
              
              {getTasksByStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks in this status</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
          projects={projects}
          tasks={tasks}
        />
      )}
    </div>
  );
}

function CreateTaskModal({ onClose, onSubmit, projects = [], tasks: pageTasks = [] }) {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimatedHours: '',
    dueDate: '',
    assignedTo: user?.id || '',
    assignedToName: userProfile?.displayName || ''
  });
  const [users, setUsers] = useState([]);
  const [localProjects, setLocalProjects] = useState(projects || []);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
    // do not auto-select a project; require explicit user selection
    setLocalProjects(projects || []);
  }, []);

  const fetchLocalProjects = async () => {
    try {
      const projectsData = await api.get('/projects');
      setLocalProjects(projectsData || []);
      if (projectsData && projectsData.length > 0 && !formData.projectId) {
        setFormData(prev => ({ ...prev, projectId: projectsData[0].id, projectName: projectsData[0].name }));
      }
    } catch (err) {
      toast.error('Failed to refresh projects');
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await api.get('/users');
      const formattedUsers = usersData.map(u => ({
        id: u.id,
        uid: u.id,
        displayName: u.name,
        email: u.email,
        role: u.role,
        rewardPoints: u.reward_points,
        rating: u.rating,
        tasksCompleted: u.tasks_completed
      }));
      setUsers(formattedUsers);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };


  const handleUserSelect = (selectedUser) => {
    setFormData({
      ...formData,
      assignedTo: selectedUser.id,
      assignedToName: selectedUser.displayName || selectedUser.email
    });
    setShowUserSelector(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    if (!formData.assignedTo) {
      toast.error('Please assign the task to a user');
      return;
    }

    if (!formData.projectId) {
      toast.error('Please select a project');
      return;
    }

    const taskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
      dueDate: formData.dueDate || null,
      assignedTo: formData.assignedTo,
      projectId: formData.projectId || null
    };

    onSubmit(taskData);
  };

  return (
    <Modal onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              min="1"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hours"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Assign To Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To *
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {formData.assignedToName || 'Select a user'}
                </span>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setShowUserSelector(true)}
              variant="outline"
              size="sm"
            >
              Choose
            </Button>
          </div>
        </div>

        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project *
          </label>
          <div className="flex items-center space-x-2">
            <select
              value={formData.projectId || ''}
              onChange={(e) => {
                const selected = (localProjects || []).find(p => String(p.id) === e.target.value);
                setFormData({ 
                  ...formData, 
                  projectId: e.target.value || null,
                  projectName: selected ? selected.name : ''
                });
              }}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Select Project --</option>
              {(localProjects || []).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Button type="button" onClick={() => fetchLocalProjects()} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
          {/* Show project task counts when a project is selected */}
          {formData.projectId && (
            (() => {
              const projId = String(formData.projectId);
              const total = (pageTasks || []).filter(t => String(t.project_id) === projId).length;
              const completed = (pageTasks || []).filter(t => String(t.project_id) === projId && t.status === 'done').length;
              return (
                <div className="text-sm text-gray-600 mt-2">
                  This project has <strong className="text-gray-800">{total}</strong> task{total !== 1 ? 's' : ''} — <span className="text-green-600">{completed}</span> completed
                </div>
              );
            })()
          )}
        </div>

          <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit">
            Create Task
          </Button>
        </div>
      </form>

      {/* User Selection Modal */}
      {showUserSelector && (
        <Modal 
          onClose={() => setShowUserSelector(false)} 
          title="Select User to Assign"
        >
          <div className="space-y-4">
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading users...</p>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {users.map(userData => (
                    <div
                      key={userData.id}
                      onClick={() => handleUserSelect(userData)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {userData.displayName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {userData.displayName || 'Unknown User'}
                            </h4>
                            {userData.role === 'admin' && (
                              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{userData.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {userData.rewardPoints || 0} points
                            </span>
                            <span className="text-xs text-gray-500">
                              {userData.tasksCompleted || 0} tasks completed
                            </span>
                            <span className="text-xs text-gray-500">
                              ⭐ {userData.rating || 0}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No users found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </Modal>
  );
}

export default Tasks;