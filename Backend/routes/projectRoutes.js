// Last Updated: May 13, 2026
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');

// All project routes require authentication
router.use(authenticateToken);

router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);

module.exports = router;

