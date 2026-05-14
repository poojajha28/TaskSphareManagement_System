
import React from 'react';
import { Target, Mail, User } from 'lucide-react';

function UserCard({ user, showStats = true, onClick }) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow p-6 cursor-pointer"
      onClick={() => onClick && onClick(user)}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{user.displayName || 'Unknown User'}</h3>
          <p className="text-sm text-gray-600 flex items-center space-x-1">
            <Mail className="w-3 h-3" />
            <span>{user.email}</span>
          </p>
        </div>
      </div>

      {showStats && (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-lg">{user.tasksCompleted || 0}</span>
          </div>
          <p className="text-xs text-gray-600">Tasks Completed</p>
        </div>
      )}

      {user.createdAt && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500">
            Member since {user.createdAt.toDate?.().toLocaleDateString() || user.createdAt}
          </p>
        </div>
      )}
    </div>
  );
}

export default UserCard;