const rewardService = require('../services/rewardService');

class RewardController {
  async getClaimedRewards(req, res) {
    try {
      const rewards = await rewardService.getClaimedRewards(req.user.id);
      res.json(rewards);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async claimReward(req, res) {
    try {
      const { reward_id, reward_name, cost } = req.body;
      
      if (!reward_id || !reward_name || cost === undefined) {
        return res.status(400).json({ error: 'Reward ID, name, and cost are required' });
      }
      
      const result = await rewardService.claimReward(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      if (error.message === 'Insufficient points') {
        return res.status(400).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new RewardController();

