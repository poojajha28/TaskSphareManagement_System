import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Users } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import toast from 'react-hot-toast';

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'planning',
        totalTasks: 0,
        completedTasks: 0,
        teamMembers: [{ uid: user.uid, role: 'owner' }]
      });
      
      // Close modal first, then show success message
      setShowCreateModal(false);
      toast.success('Project created successfully!');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || 
      (filter === 'my-projects' && project.teamMembers?.some(member => member.uid === user.uid)) ||
      (filter === 'created-by-me' && project.createdBy === user.uid);
    
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
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
          <p className="text-gray-600 mt-1">Manage your team projects and collaborations</p>
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
            <option value="my-projects">My Projects</option>
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
            onClick={(project) => {
              // Handle project click - could navigate to project details
              // Project details navigation would go here
            }}
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
    </div>
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
        ...formData,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        dueDate: formData.dueDate ? Timestamp.fromDate(new Date(formData.dueDate)) : null
      };

      await onSubmit(projectData);
      // Modal will be closed by the parent component after successful submission
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