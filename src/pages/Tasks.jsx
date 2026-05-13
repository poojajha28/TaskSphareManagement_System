import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Users } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const statusColumns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-purple-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' }
];

function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'todo'
      });
      
      setShowCreateModal(false);
      toast.success('Task created successfully!');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || 
      (filter === 'my-tasks' && task.assignedTo === user.uid) ||
      (filter === 'created-by-me' && task.createdBy === user.uid);
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
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
          <p className="text-gray-600 mt-1">Manage and track your tasks</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
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
            <option value="all">All Tasks</option>
            <option value="my-tasks">My Tasks</option>
            <option value="created-by-me">Created by Me</option>
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
        />
      )}
    </div>
  );
}

function CreateTaskModal({ onClose, onSubmit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimatedHours: '',
    dueDate: '',
    assignedTo: user?.uid || '', // Default assign to self
    assignedToName: user?.displayName || ''
  });
  const [users, setUsers] = useState([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch all users for assignment
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSelect = (selectedUser) => {
    setFormData({
      ...formData,
      assignedTo: selectedUser.uid,
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

    const taskData = {
      ...formData,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
      dueDate: formData.dueDate ? Timestamp.fromDate(new Date(formData.dueDate)) : null
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
                          <h4 className="font-medium text-gray-900">
                            {userData.displayName || 'Unknown User'}
                          </h4>
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