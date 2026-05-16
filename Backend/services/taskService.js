
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

  async getTasksByUser(userId) {
    const [tasks] = await pool.execute(
      `SELECT t.*, u.name as assigned_to_name, p.id as project_id, p.name as project_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.assigned_to = ?
       ORDER BY t.created_at DESC`,
      [userId]
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

  async getAllOverdueTasks() {
    const [tasks] = await pool.execute(
      `SELECT t.*, u.name as assigned_to_name, p.id as project_id, p.name as project_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.status <> 'done' AND t.due_date IS NOT NULL AND t.due_date < NOW()
       ORDER BY t.due_date ASC`
    );
    return tasks;
  }

  async getDashboardStats(userId, role) {
    const isAdmin = role === 'admin';

    // Total tasks
    let totalQuery, statusQuery, perUserQuery, overdueQuery;

    if (isAdmin) {
      [totalQuery] = await pool.execute('SELECT COUNT(*) as total FROM tasks');
      [statusQuery] = await pool.execute(
        `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`
      );
      [perUserQuery] = await pool.execute(
        `SELECT u.id, u.name, COUNT(t.id) as task_count,
                SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) as todo_count,
                SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN t.status <> 'done' AND t.due_date IS NOT NULL AND t.due_date < NOW() THEN 1 ELSE 0 END) as overdue_count
         FROM users u
         LEFT JOIN tasks t ON t.assigned_to = u.id
         GROUP BY u.id, u.name
         ORDER BY task_count DESC`
      );
      [overdueQuery] = await pool.execute(
        `SELECT COUNT(*) as overdue FROM tasks 
         WHERE status <> 'done' AND due_date IS NOT NULL AND due_date < NOW()`
      );
    } else {
      [totalQuery] = await pool.execute(
        'SELECT COUNT(*) as total FROM tasks WHERE assigned_to = ?', [userId]
      );
      [statusQuery] = await pool.execute(
        `SELECT status, COUNT(*) as count FROM tasks WHERE assigned_to = ? GROUP BY status`, [userId]
      );
      perUserQuery = [];
      [overdueQuery] = await pool.execute(
        `SELECT COUNT(*) as overdue FROM tasks 
         WHERE assigned_to = ? AND status <> 'done' AND due_date IS NOT NULL AND due_date < NOW()`, [userId]
      );
    }

    const statusMap = {};
    (statusQuery || []).forEach(row => {
      statusMap[row.status] = row.count;
    });

    return {
      totalTasks: totalQuery[0]?.total || 0,
      todoTasks: statusMap['todo'] || 0,
      inProgressTasks: statusMap['in-progress'] || 0,
      doneTasks: statusMap['done'] || 0,
      overdueTasks: overdueQuery[0]?.overdue || 0,
      tasksPerUser: perUserQuery || []
    };
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

  async updateTaskStatus(taskId, status, userId, userRole) {
    const [tasks] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );
    
    if (tasks.length === 0) {
      throw new Error('Task not found');
    }
    
    const task = tasks[0];

    // No change — skip
    if (task.status === status) {
      return { message: 'No status change' };
    }

    // Role-based check: members can only update their own assigned tasks
    if (userRole !== 'admin' && task.assigned_to !== userId) {
      throw new Error('You can only update tasks assigned to you');
    }
    
    // CASE 1: Moving TO "done" from another status → INCREMENT counters
    if (status === 'done' && task.status !== 'done') {
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

      if (task.project_id) {
        await pool.execute(
          'UPDATE projects SET completed_tasks = COALESCE(completed_tasks,0) + 1, updated_at = NOW() WHERE id = ?',
          [task.project_id]
        );
      }
    }
    // CASE 2: Moving FROM "done" back to another status → DECREMENT counters
    else if (task.status === 'done' && status !== 'done') {
      if (task.assigned_to) {
        await pool.execute(
          'UPDATE users SET tasks_completed = GREATEST(tasks_completed - 1, 0) WHERE id = ?',
          [task.assigned_to]
        );
      }
      
      await pool.execute(
        'UPDATE tasks SET status = ?, completed_at = NULL, updated_at = NOW() WHERE id = ?',
        [status, taskId]
      );

      if (task.project_id) {
        await pool.execute(
          'UPDATE projects SET completed_tasks = GREATEST(COALESCE(completed_tasks,0) - 1, 0), updated_at = NOW() WHERE id = ?',
          [task.project_id]
        );
      }
    }
    // CASE 3: Moving between non-done statuses (todo ↔ in-progress) → just update status
    else {
      await pool.execute(
        'UPDATE tasks SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, taskId]
      );
    }
    
    return { message: 'Task status updated' };
  }

  async getProjectWiseStats(userId, role) {
    const isAdmin = role === 'admin';
    let query;

    if (isAdmin) {
      [query] = await pool.execute(
        `SELECT p.id as project_id, p.name as project_name,
                COUNT(t.id) as total_tasks,
                SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) as todo_count,
                SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as done_count,
                SUM(CASE WHEN t.status <> 'done' AND t.due_date IS NOT NULL AND t.due_date < NOW() THEN 1 ELSE 0 END) as overdue_count
         FROM projects p
         LEFT JOIN tasks t ON t.project_id = p.id
         GROUP BY p.id, p.name
         ORDER BY total_tasks DESC`
      );
    } else {
      [query] = await pool.execute(
        `SELECT p.id as project_id, p.name as project_name,
                COUNT(t.id) as total_tasks,
                SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END) as todo_count,
                SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as done_count,
                SUM(CASE WHEN t.status <> 'done' AND t.due_date IS NOT NULL AND t.due_date < NOW() THEN 1 ELSE 0 END) as overdue_count
         FROM projects p
         INNER JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
         LEFT JOIN tasks t ON t.project_id = p.id AND t.assigned_to = ?
         GROUP BY p.id, p.name
         ORDER BY total_tasks DESC`,
        [userId, userId]
      );
    }

    return query || [];
  }
}

module.exports = new TaskService();
