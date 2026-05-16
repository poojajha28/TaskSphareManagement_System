
const taskService = require('../services/taskService');
const { validateTask, validateTaskStatus } = require('../middleware/validate');

class TaskController {
  async getAllTasks(req, res) {
    try {
      const isAdmin = req.user.role === 'admin';
      let tasks;

      if (isAdmin) {
        tasks = await taskService.getAllTasks();
      } else {
        // Members only see their own assigned tasks
        tasks = await taskService.getTasksByUser(req.user.id);
      }

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOverdueTasks(req, res) {
    try {
      const isAdmin = req.user.role === 'admin';
      let tasks;

      if (isAdmin) {
        tasks = await taskService.getAllOverdueTasks();
      } else {
        tasks = await taskService.getOverdueTasksForUser(req.user.id);
      }

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await taskService.getDashboardStats(req.user.id, req.user.role);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTask(req, res) {
    try {
      // Only admin can create tasks
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can create tasks' });
      }

      // Validate input
      const errors = validateTask(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
      }
      
      const result = await taskService.createTask(req.body, req.user.id);
      res.status(201).json({ ...result, message: 'Task created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTask(req, res) {
    try {
      const taskId = req.params.id;

      if (!taskId || isNaN(taskId)) {
        return res.status(400).json({ error: 'Valid task ID is required' });
      }

      // Validate status value
      const errors = validateTaskStatus(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
      }

      const { status } = req.body;
      const result = await taskService.updateTaskStatus(taskId, status, req.user.id, req.user.role);
      res.json({ message: 'Task updated successfully' });
    } catch (error) {
      if (error.message === 'Task not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'You can only update tasks assigned to you') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
  async getProjectWiseStats(req, res) {
    try {
      const stats = await taskService.getProjectWiseStats(req.user.id, req.user.role);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TaskController();
