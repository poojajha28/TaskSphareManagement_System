
import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  'done': 'bg-green-100 text-green-800'
};

function TaskCard({ task, onTaskUpdate }) {
  const { user, refreshUserProfile, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  // Determine overdue locally
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const daysOverdue = isOverdue ? Math.max(1, Math.floor((Date.now() - Date.parse(task.due_date)) / (1000 * 60 * 60 * 24))) : 0;

  // Members can only update their own assigned tasks; admin can update any
  const canUpdate = isAdmin || task.assigned_to === user?.id;
  const canComplete = canUpdate && task.status !== 'done';

  const handleStatusChange = async (newStatus) => {
    if (loading || !canUpdate) return;
    if (newStatus === task.status) return; // No change

    setLoading(true);
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });

      if (newStatus === 'done') {
        toast.success('Task completed! 🎉');
      } else if (task.status === 'done') {
        toast.success('Task reopened');
      } else {
        toast.success('Task status updated!');
      }

      // Refresh user profile if status change involves 'done' (counter changed)
      if (newStatus === 'done' || task.status === 'done') {
        await refreshUserProfile();
      }

      // Trigger full data refetch from parent
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 p-4 hover:shadow-lg transition-shadow ${isOverdue ? 'border-l-red-500' : 'border-l-blue-500'
      }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{task.title}</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
            {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
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
            {isOverdue && (
              <span className="text-red-500 font-medium">
                {`(Overdue · ${daysOverdue}d)`}
              </span>
            )}
          </div>
        )}

        {task.estimated_hours && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{task.estimated_hours}h estimated</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        {canUpdate ? (
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        ) : (
          <span className={`text-sm px-2 py-1 rounded-md ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
            {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
          </span>
        )}

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