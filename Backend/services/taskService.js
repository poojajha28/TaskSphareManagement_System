const pool = require('../config/database');

class TaskService {
  async getAllTasks() {
    const [tasks] = await pool.execute(
      `SELECT t.*, u.name as assigned_to_name, p.id as project_id, p.name as project_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       ORDER BY t.created_at DESC`
    );
    return tasks;
  }

  async getOverdueTasksForUser(userId) {
    // Return tasks assigned to userId where due_date is before now and status is not 'done'
    const [tasks] = await pool.execute(
      `SELECT t.*, u.name as assigned_to_name, p.id as project_id, p.name as project_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.assigned_to = ? AND t.status <> 'done' AND t.due_date IS NOT NULL AND t.due_date < NOW()
       ORDER BY t.due_date ASC`,
      [userId]
    );
    return tasks;
  }

  async createTask(taskData, createdBy) {
    const { title, description, priority, estimated_hours, due_date, assigned_to, project_id } = taskData;

    const [result] = await pool.execute(
      `INSERT INTO tasks (title, description, priority, status, estimated_hours, due_date, assigned_to, project_id, created_by) 
       VALUES (?, ?, ?, 'todo', ?, ?, ?, ?, ?)`,
      [title, description, priority, estimated_hours, due_date, assigned_to, project_id || null, createdBy]
    );

    // If task is linked to a project, increment that project's total_tasks counter
    if (project_id) {
      try {
        await pool.execute(
          'UPDATE projects SET total_tasks = COALESCE(total_tasks,0) + 1, updated_at = NOW() WHERE id = ?',
          [project_id]
        );
      } catch (err) {
        // don't fail task creation if project update fails; log in server logs
        console.error('Failed to update project total_tasks:', err.message || err);
      }
    }

    return { id: result.insertId };
  }

  async updateTaskStatus(taskId, status) {
    const [tasks] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );
    
    if (tasks.length === 0) {
      throw new Error('Task not found');
    }
    
    const task = tasks[0];
    let points = 0;
    
    // Calculate points if task is being marked as done
    if (status === 'done' && task.status !== 'done') {
      points = await this.calculateTaskPoints(task);
      
      // Update user stats
      if (task.assigned_to) {
        await this.updateUserStats(task.assigned_to, points);
      }
      
      await pool.execute(
        'UPDATE tasks SET status = ?, completed_at = NOW(), updated_at = NOW() WHERE id = ?',
        [status, taskId]
      );
      // If task belongs to a project, increment that project's completed_tasks counter
      if (task.project_id) {
        try {
          await pool.execute(
            'UPDATE projects SET completed_tasks = COALESCE(completed_tasks,0) + 1, updated_at = NOW() WHERE id = ?',
            [task.project_id]
          );
        } catch (err) {
          console.error('Failed to update project completed_tasks:', err.message || err);
        }
      }
    } else {
      await pool.execute(
        'UPDATE tasks SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, taskId]
      );
    }
    
    return { points };
  }

  async calculateTaskPoints(task) {
    let basePoints = 10;
    const priorityMultiplier = { low: 1, medium: 1.5, high: 2 };
    const hoursBonus = task.estimated_hours ? Math.floor(task.estimated_hours / 2) * 5 : 0;
    
    let timeBonus = 0;
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      if (now <= dueDate) {
        timeBonus = 15;
      }
    }
    
    const points = Math.floor((basePoints + hoursBonus) * priorityMultiplier[task.priority] + timeBonus);
    return Math.max(points, 5);
  }

  async updateUserStats(userId, points) {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length > 0) {
      const newTasksCompleted = users[0].tasks_completed + 1;
      const newRating = Math.min(5, Math.floor(newTasksCompleted / 10) + 1);
      
      await pool.execute(
        'UPDATE users SET reward_points = reward_points + ?, tasks_completed = tasks_completed + 1, rating = ? WHERE id = ?',
        [points, newRating, userId]
      );
    }
  }
}

module.exports = new TaskService();

