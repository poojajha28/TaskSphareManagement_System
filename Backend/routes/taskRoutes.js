const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

// All task routes require authentication
router.use(authenticateToken);

router.get('/overdue', taskController.getOverdueTasks);

router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.patch('/:id', taskController.updateTask);

module.exports = router;

