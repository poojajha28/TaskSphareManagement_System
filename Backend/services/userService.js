
const pool = require('../config/database');

class UserService {
  async getAllUsers() {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, tasks_completed, created_at FROM users ORDER BY name'
    );
    return users;
  }

  async getLeaderboard(orderBy = 'tasks_completed') {
    // Only allow ordering by tasks_completed now
    const [users] = await pool.execute(
      `SELECT id, name, email, tasks_completed, created_at 
       FROM users 
       ORDER BY tasks_completed DESC 
       LIMIT 10`
    );
    return users;
  }
}

module.exports = new UserService();
