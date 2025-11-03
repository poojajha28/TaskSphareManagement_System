const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticateToken);

router.get('/', userController.getAllUsers);
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;

