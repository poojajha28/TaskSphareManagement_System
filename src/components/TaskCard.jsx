import React, { useState } from 'react';
import { Clock, User, Star, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateRewardPoints } from '../utils/reward';
import toast from 'react-hot-toast';

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
      const taskRef = doc(db, 'tasks', task.id);
      const updateData = {
        status: newStatus,
        updatedAt: Timestamp.now()
      };

      // If task is being completed
      if (newStatus === 'done' && task.status !== 'done' && task.assignedTo === user.uid) {
        updateData.completedAt = Timestamp.now();
        
        // Calculate reward points
        const points = calculateRewardPoints(task);
        
        // Update task and user rewards
        await updateDoc(taskRef, updateData);
        await updateUserRewards(points, true);
        
        toast.success(`Task completed! Earned ${points} points!`);
      } else {
        await updateDoc(taskRef, updateData);
        toast.success('Task status updated!');
      }

      if (onTaskUpdate) {
        onTaskUpdate({ ...task, ...updateData });
      }
        } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate.toDate()) < new Date() && task.status !== 'done';
  const canComplete = task.assignedTo === user.uid && task.status !== 'done';

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
        {task.assignedToName && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{task.assignedToName}</span>
          </div>
        )}

        {task.dueDate && (
          <div className={`flex items-center space-x-2 text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar className="w-4 h-4" />
            <span>{task.dueDate.toDate().toLocaleDateString()}</span>
            {isOverdue && <span className="text-red-500 font-medium">(Overdue)</span>}
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Star className="w-4 h-4" />
          <span>{calculateRewardPoints(task)} points</span>
        </div>

        {task.estimatedHours && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{task.estimatedHours}h estimated</span>
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