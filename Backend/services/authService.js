
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

class AuthService {
  async signup(name, email, password, role = 'user') {
    // Validate role - only allow 'user' or 'admin'
    const validRole = (role === 'admin') ? 'admin' : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, role, password, tasks_completed, projects_completed) VALUES (?, ?, ?, ?, 0, 0)',
      [name, email, validRole, hashedPassword]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, email, role: validRole },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: userId,
        name,
        email,
        role: validRole,
        tasksCompleted: 0
      }
    };
  }

  async login(email, password) {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tasksCompleted: user.tasks_completed
      }
    };
  }

  async getUserById(userId) {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tasksCompleted: user.tasks_completed,
      projectsCompleted: user.projects_completed,
      createdAt: user.created_at
    };
  }
}

module.exports = new AuthService();
