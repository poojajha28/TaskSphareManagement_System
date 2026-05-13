const pool = require('../config/database');

class RewardService {
  async getClaimedRewards(userId) {
    const [rewards] = await pool.execute(
      'SELECT * FROM claimed_rewards WHERE user_id = ? ORDER BY claimed_at DESC',
      [userId]
    );
    return rewards;
  }

  async claimReward(userId, rewardData) {
    const { reward_id, reward_name, cost } = rewardData;
    
    // Check if user has enough points
    const [users] = await pool.execute(
      'SELECT reward_points FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0 || users[0].reward_points < cost) {
      throw new Error('Insufficient points');
    }
    
    // Deduct points from user
    await pool.execute(
      'UPDATE users SET reward_points = reward_points - ? WHERE id = ?',
      [cost, userId]
    );
    
    // Record claimed reward
    await pool.execute(
      'INSERT INTO claimed_rewards (user_id, reward_id, reward_name, cost, status) VALUES (?, ?, ?, ?, ?)',
      [userId, reward_id, reward_name, cost, 'pending']
    );
    
    return { message: 'Reward claimed successfully' };
  }
}

module.exports = new RewardService();

