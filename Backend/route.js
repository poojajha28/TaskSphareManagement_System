/**
 * Route Layer Index
 * 
 * This file serves as a central export for all route modules.
 * Routes define API endpoints and map them to controllers.
 * 
 * Available Routes:
 * - /api/auth/*: Authentication routes (signup, login, profile)
 * - /api/tasks/*: Task management routes
 * - /api/projects/*: Project management routes
 * - /api/users/*: User data and leaderboard routes
 * - /api/rewards/*: Reward system routes
 */

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const rewardRoutes = require('./routes/rewardRoutes');

module.exports = {
  authRoutes,
  taskRoutes,
  projectRoutes,
  userRoutes,
  rewardRoutes
};

