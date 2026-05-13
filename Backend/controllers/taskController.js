const taskService = require('../services/taskService');

class TaskController {
  async getAllTasks(req, res) {
    try {
      const tasks = await taskService.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getOverdueTasks(req, res) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const tasks = await taskService.getOverdueTasksForUser(userId);
      res.json(tasks);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createTask(req, res) {
    try {
      const { title, description, priority, estimated_hours, due_date, assigned_to } = req.body;
      
      if (!title || !priority) {
        return res.status(400).json({ error: 'Title and priority are required' });
      }
      
      const result = await taskService.createTask(req.body, req.user.id);
      res.status(201).json({ ...result, message: 'Task created successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateTask(req, res) {
    try {
      const { status } = req.body;
      const taskId = req.params.id;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const result = await taskService.updateTaskStatus(taskId, status);
      res.json({ message: 'Task updated successfully', points: result.points });
    } catch (error) {
      if (error.message === 'Task not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new TaskController();

