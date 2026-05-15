
import React from 'react';
import { Calendar, Users, CheckCircle, Clock, Shield } from 'lucide-react';

const statusColors = {
  'planning': 'bg-gray-100 text-gray-800',
  'active': 'bg-blue-100 text-blue-800',
  'on-hold': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800'
};

function ProjectCard({ project, onClick, isCreator, isAdmin }) {
  const completionPercentage = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100) 
    : 0;

  return (
    <div 
      className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onClick && onClick(project)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{project.name}</h3>
            {isCreator && (
              <span className="inline-flex items-center space-x-1 mt-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </span>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
            {project.status.replace('-', ' ')}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4" />
            <span>{project.completedTasks || 0}/{project.totalTasks} tasks</span>
          </div>

          {project.dueDate && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Due: {project.dueDate.toDate().toLocaleDateString()}</span>
            </div>
          )}

          {project.estimatedHours && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{project.estimatedHours}h estimated</span>
            </div>
          )}
        </div>

        {/* Click hint */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>Click to manage members</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;