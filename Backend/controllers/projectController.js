const projectService = require('../services/projectService');

class ProjectController {
  async getAllProjects(req, res) {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createProject(req, res) {
    try {
      const { name, description, priority, due_date, estimated_hours } = req.body;
      
      if (!name || !priority) {
        return res.status(400).json({ error: 'Name and priority are required' });
      }
      
      const result = await projectService.createProject(req.body, req.user.id);
      res.status(201).json({ ...result, message: 'Project created successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ProjectController();

