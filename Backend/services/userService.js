const pool = require('../config/database');

class UserService {
  async getAllUsers() {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, reward_points, rating, tasks_completed, created_at FROM users ORDER BY name'
    );
    return users;
  }

  async getLeaderboard(orderBy = 'reward_points') {
    // Validate orderBy to prevent SQL injection
    const validColumns = ['reward_points', 'rating', 'tasks_completed'];
    const column = validColumns.includes(orderBy) ? orderBy : 'reward_points';
    
    const [users] = await pool.execute(
      `SELECT id, name, email, reward_points, rating, tasks_completed, created_at 
       FROM users 
       ORDER BY ${column} DESC 
       LIMIT 10`
    );
    return users;
  }
}

module.exports = new UserService();

