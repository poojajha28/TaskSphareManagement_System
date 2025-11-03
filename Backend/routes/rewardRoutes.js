const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { authenticateToken } = require('../middleware/auth');

// All reward routes require authentication
router.use(authenticateToken);

router.get('/claimed', rewardController.getClaimedRewards);
router.post('/claim', rewardController.claimReward);

module.exports = router;

