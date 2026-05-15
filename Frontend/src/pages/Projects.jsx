
import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Users, UserPlus, UserMinus, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { api } from '../config/api';

function Projects() {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(null); // project object or null
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsData = await api.get('/projects');
      // Convert MySQL dates to format expected by UI
      const formattedProjects = projectsData.map(p => ({
        ...p,
        dueDate: p.due_date ? { toDate: () => new Date(p.due_date) } : null,
        estimatedHours: p.estimated_hours,
        totalTasks: p.total_tasks || 0,
        completedTasks: p.completed_tasks || 0,
        createdBy: p.created_by
      }));
      setProjects(formattedProjects);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await api.post('/projects', {
        name: projectData.name,
        description: projectData.description,
        priority: projectData.priority,
        due_date: projectData.dueDate,
        estimated_hours: projectData.estimatedHours
      });
      
      setShowCreateModal(false);
      toast.success('Project created successfully!');
      fetchProjects(); // Refresh list
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || 
      (filter === 'created-by-me' && project.createdBy === user?.id);
    
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Manage your team projects and collaborations' : 'View your assigned projects'}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
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
            <option value="all">All Projects</option>
            <option value="created-by-me">Created by Me</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => {
              // Open members modal
              setShowMembersModal(project);
            }}
            isCreator={project.createdBy === user?.id}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Create your first project to get started!'}
          </p>
          {!searchTerm && filter === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>
              Create Project
            </Button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {/* Members Management Modal */}
      {showMembersModal && (
        <MembersModal
          project={showMembersModal}
          onClose={() => setShowMembersModal(null)}
          isCreator={showMembersModal.createdBy === user?.id}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

function MembersModal({ project, onClose, isCreator, isAdmin }) {
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);

  const canManageMembers = isCreator || isAdmin;

  useEffect(() => {
    fetchMembers();
    if (canManageMembers) {
      fetchAllUsers();
    }
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await api.getProjectMembers(project.id);
      setMembers(data);
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const users = await api.get('/users');
      setAllUsers(users);
    } catch (err) {
      // silent
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await api.addProjectMember(project.id, userId);
      toast.success('Member added!');
      fetchMembers();
      setShowAddUser(false);
    } catch (error) {
      toast.error(error.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.removeProjectMember(project.id, userId);
      toast.success('Member removed!');
      fetchMembers();
    } catch (error) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const memberIds = members.map(m => m.id);
  const nonMembers = allUsers.filter(u => !memberIds.includes(u.id));

  return (
    <Modal onClose={onClose} title={`${project.name} — Members`} size="lg">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add Member button */}
          {canManageMembers && (
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center space-x-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Member</span>
              </Button>
            </div>
          )}

          {/* Add User Selector */}
          {showAddUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 animate-fadeIn">
              <h4 className="font-semibold text-gray-800 text-sm">Select user to add:</h4>
              {nonMembers.length === 0 ? (
                <p className="text-sm text-gray-500">All users are already members of this project.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {nonMembers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{u.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAddMember(u.id)}>Add</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Current Members */}
          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No members yet.</p>
            ) : (
              members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      member.project_role === 'admin' 
                        ? 'bg-gradient-to-br from-red-400 to-pink-500' 
                        : 'bg-gradient-to-br from-blue-400 to-purple-500'
                    }`}>
                      <span className="text-white font-bold text-sm">{member.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-800">{member.name}</p>
                        {member.project_role === 'admin' && (
                          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1">
                            <Shield className="w-3 h-3" />
                            <span>Creator</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  {canManageMembers && member.project_role !== 'admin' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function CreateProjectModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    estimatedHours: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        dueDate: formData.dueDate || null
      };

      await onSubmit(projectData);
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project name"
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
            placeholder="Enter project description"
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

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default Projects;