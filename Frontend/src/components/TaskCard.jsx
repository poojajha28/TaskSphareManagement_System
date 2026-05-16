
import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { api } from '../config/api';

const priorityColors = {
  low: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  high: 'bg-red-500/20 text-red-400 border border-red-500/30'
};

const statusColors = {
  'todo': 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  'in-progress': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'done': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
    <div className={`bg-white/[0.03] rounded-xl border-l-4 p-4 hover:bg-white/[0.06] transition-all duration-300 border border-white/[0.06] ${isOverdue ? 'border-l-red-500' : 'border-l-blue-500'
      }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-white line-clamp-2">{task.title}</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[task.status] || 'bg-gray-500/20 text-gray-400'}`}>
            {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
          </span>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{task.description}</p>

      <div className="space-y-2 mb-4">
        {task.assigned_to_name && (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <User className="w-4 h-4" />
            <span>{task.assigned_to_name}</span>
          </div>
        )}

        {task.due_date && (
          <div className={`flex items-center space-x-2 text-sm ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
            <Calendar className="w-4 h-4" />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
            {isOverdue && (
              <span className="text-red-400 font-medium">
                {`(Overdue · ${daysOverdue}d)`}
              </span>
            )}
          </div>
        )}

        {task.estimated_hours && (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
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
            className="text-sm bg-white/5 border border-white/10 text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todo" className="bg-[#12122a]">To Do</option>
            <option value="in-progress" className="bg-[#12122a]">In Progress</option>
            <option value="done" className="bg-[#12122a]">Done</option>
          </select>
        ) : (
          <span className={`text-sm px-2 py-1 rounded-lg ${statusColors[task.status] || 'bg-gray-500/20 text-gray-400'}`}>
            {task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}
          </span>
        )}

        {canComplete && task.status !== 'done' && (
          <button
            onClick={() => handleStatusChange('done')}
            disabled={loading}
            className="flex items-center space-x-1 bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/25"
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