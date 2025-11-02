import React, { useState } from 'react';
import { Clock, User, Star, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateRewardPoints } from '../utils/reward';
import toast from 'react-hot-toast';
import { api } from '../config/api';

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const statusColors = {
  'todo': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'review': 'bg-purple-100 text-purple-800',
  'done': 'bg-green-100 text-green-800'
};

function TaskCard({ task, onTaskUpdate }) {
  const { user, updateUserRewards } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (loading) return;
    
    setLoading(true);
    try {
      // API call to update task
      const response = await api.patch(`/tasks/${task.id}`, { status: newStatus });
      
      // Server already handles reward calculation
      if (newStatus === 'done' && task.status !== 'done' && response.points) {
        toast.success(`Task completed! Earned ${response.points} points!`);
        // Refresh user profile to get updated points
        await updateUserRewards(0); // This will call fetchUserProfile
      } else {
        toast.success('Task status updated!');
      }

      if (onTaskUpdate) {
        onTaskUpdate({ ...task, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // Convert MySQL date field for checking
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const canComplete = task.assigned_to === user?.id && task.status !== 'done';

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 p-4 hover:shadow-lg transition-shadow ${
      isOverdue ? 'border-l-red-500' : 'border-l-blue-500'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{task.title}</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
            {task.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>

      <div className="space-y-2 mb-4">
        {task.assigned_to_name && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{task.assigned_to_name}</span>
          </div>
        )}

        {task.due_date && (
          <div className={`flex items-center space-x-2 text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar className="w-4 h-4" />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
            {isOverdue && <span className="text-red-500 font-medium">(Overdue)</span>}
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Star className="w-4 h-4" />
          <span>{calculateRewardPoints(task)} points</span>
        </div>

        {task.estimated_hours && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{task.estimated_hours}h estimated</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={loading}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>

        {canComplete && task.status !== 'done' && (
          <button
            onClick={() => handleStatusChange('done')}
            disabled={loading}
            className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;