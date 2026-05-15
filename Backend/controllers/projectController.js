
const projectService = require('../services/projectService');
const { validateProject } = require('../middleware/validate');

class ProjectController {
  async getAllProjects(req, res) {
    try {
      const isAdmin = req.user.role === 'admin';
      let projects;
      
      if (isAdmin) {
        projects = await projectService.getAllProjects();
      } else {
        // Members only see projects they belong to
        projects = await projectService.getProjectsByUser(req.user.id);
      }
      
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createProject(req, res) {
    try {
      // Validate input
      const errors = validateProject(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
      }
      
      const result = await projectService.createProject(req.body, req.user.id);
      res.status(201).json({ ...result, message: 'Project created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProjectMembers(req, res) {
    try {
      const projectId = req.params.id;

      if (!projectId || isNaN(projectId)) {
        return res.status(400).json({ error: 'Valid project ID is required' });
      }

      const members = await projectService.getProjectMembers(projectId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addMember(req, res) {
    try {
      const projectId = req.params.id;
      const { userId } = req.body;

      if (!projectId || isNaN(projectId)) {
        return res.status(400).json({ error: 'Valid project ID is required' });
      }

      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      // Only project creator (admin) or system admin can add members
      const isProjectAdmin = await projectService.isProjectAdmin(projectId, req.user.id);
      if (!isProjectAdmin && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only project admin can add members' });
      }

      const result = await projectService.addMember(projectId, userId);
      res.json(result);
    } catch (error) {
      if (error.message === 'User is already a member of this project') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      const projectId = req.params.id;
      const userId = req.params.userId;

      if (!projectId || isNaN(projectId)) {
        return res.status(400).json({ error: 'Valid project ID is required' });
      }

      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Valid userId is required' });
      }

      // Only project creator (admin) or system admin can remove members
      const isProjectAdmin = await projectService.isProjectAdmin(projectId, req.user.id);
      if (!isProjectAdmin && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only project admin can remove members' });
      }

      const result = await projectService.removeMember(projectId, userId);
      res.json(result);
    } catch (error) {
      if (error.message === 'Cannot remove the project creator') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Member not found in this project') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ProjectController();
