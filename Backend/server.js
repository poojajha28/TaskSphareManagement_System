const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tasksphere',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, reward_points, rating, tasks_completed, projects_completed) VALUES (?, ?, ?, 0, 0, 0, 0)',
      [name, email, hashedPassword]
    );
    
    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    
    res.json({ token, user: { id: userId, name, email, rewardPoints: 0, rating: 0, tasksCompleted: 0 } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        rewardPoints: user.reward_points,
        rating: user.rating,
        tasksCompleted: user.tasks_completed
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      rewardPoints: user.reward_points,
      rating: user.rating,
      tasksCompleted: user.tasks_completed,
      projectsCompleted: user.projects_completed,
      createdAt: user.created_at
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Tasks Routes
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const [tasks] = await pool.execute(
      `SELECT t.*, u.name as assigned_to_name 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       ORDER BY t.created_at DESC`
    );
    res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, estimated_hours, due_date, assigned_to } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO tasks (title, description, priority, status, estimated_hours, due_date, assigned_to, created_by) 
       VALUES (?, ?, ?, 'todo', ?, ?, ?, ?)`,
      [title, description, priority, estimated_hours, due_date, assigned_to, req.user.id]
    );
    
    res.json({ id: result.insertId, message: 'Task created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;
    
    const [tasks] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = tasks[0];
    let points = 0;
    
    if (status === 'done' && task.status !== 'done') {
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
      
      points = Math.floor((basePoints + hoursBonus) * priorityMultiplier[task.priority] + timeBonus);
      points = Math.max(points, 5);
      
      const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [task.assigned_to]);
      if (users.length > 0) {
        const newTasksCompleted = users[0].tasks_completed + 1;
        const newRating = Math.min(5, Math.floor(newTasksCompleted / 10) + 1);
        
        await pool.execute(
          'UPDATE users SET reward_points = reward_points + ?, tasks_completed = tasks_completed + 1, rating = ? WHERE id = ?',
          [points, newRating, task.assigned_to]
        );
      }
      
      await pool.execute(
        'UPDATE tasks SET status = ?, completed_at = NOW(), updated_at = NOW() WHERE id = ?',
        [status, taskId]
      );
    } else {
      await pool.execute(
        'UPDATE tasks SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, taskId]
      );
    }
    
    res.json({ message: 'Task updated successfully', points });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Projects Routes
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const [projects] = await pool.execute('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(projects);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, priority, due_date, estimated_hours } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO projects (name, description, status, priority, due_date, estimated_hours, created_by) 
       VALUES (?, ?, 'planning', ?, ?, ?, ?)`,
      [name, description, priority, due_date, estimated_hours, req.user.id]
    );
    
    res.json({ id: result.insertId, message: 'Project created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Users/Leaderboard Routes
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, name, email, reward_points, rating, tasks_completed, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  try {
    const orderBy = req.query.orderBy || 'reward_points';
    const [users] = await pool.execute(
      `SELECT id, name, email, reward_points, rating, tasks_completed, created_at 
       FROM users 
       ORDER BY ${orderBy} DESC 
       LIMIT 10`
    );
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rewards Routes
app.get('/api/rewards/claimed', authenticateToken, async (req, res) => {
  try {
    const [rewards] = await pool.execute(
      'SELECT * FROM claimed_rewards WHERE user_id = ? ORDER BY claimed_at DESC',
      [req.user.id]
    );
    res.json(rewards);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/rewards/claim', authenticateToken, async (req, res) => {
  try {
    const { reward_id, reward_name, cost } = req.body;
    
    const [users] = await pool.execute('SELECT reward_points FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0 || users[0].reward_points < cost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    await pool.execute('UPDATE users SET reward_points = reward_points - ? WHERE id = ?', [cost, req.user.id]);
    
    await pool.execute(
      'INSERT INTO claimed_rewards (user_id, reward_id, reward_name, cost, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, reward_id, reward_name, cost, 'pending']
    );
    
    res.json({ message: 'Reward claimed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});