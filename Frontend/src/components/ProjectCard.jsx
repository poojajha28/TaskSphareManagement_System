
import React from 'react';
import { Calendar, Users, CheckCircle, Clock, Shield } from 'lucide-react';

const statusColors = {
  'planning': 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  'active': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'on-hold': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  'completed': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
};

function ProjectCard({ project, onClick, isCreator, isAdmin }) {
  const completionPercentage = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100) 
    : 0;

  return (
    <div 
      className="bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:scale-[1.02]"
      onClick={() => onClick && onClick(project)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg line-clamp-2">{project.name}</h3>
            {isCreator && (
              <span className="inline-flex items-center space-x-1 mt-1 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs font-bold border border-red-500/30">
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </span>
            )}
          </div>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[project.status]}`}>
            {project.status.replace('-', ' ')}
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{project.description}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Progress</span>
            <span className="text-sm text-gray-400">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <CheckCircle className="w-4 h-4" />
            <span>{project.completedTasks || 0}/{project.totalTasks} tasks</span>
          </div>

          {project.dueDate && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Due: {project.dueDate.toDate().toLocaleDateString()}</span>
            </div>
          )}

          {project.estimatedHours && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{project.estimatedHours}h estimated</span>
            </div>
          )}
        </div>

        {/* Click hint */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>Click to manage members</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;