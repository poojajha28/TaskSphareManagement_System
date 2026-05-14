
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
    
    // If task is being marked as done
    if (status === 'done' && task.status !== 'done') {
      // Update tasks_completed count for the assigned user
      if (task.assigned_to) {
        await pool.execute(
          'UPDATE users SET tasks_completed = tasks_completed + 1 WHERE id = ?',
          [task.assigned_to]
        );
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
    
    return { message: 'Task status updated' };
  }
}

module.exports = new TaskService();
