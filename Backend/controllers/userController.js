const userService = require('../services/userService');

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLeaderboard(req, res) {
    try {
      const orderBy = req.query.orderBy;
      const users = await userService.getLeaderboard(orderBy);
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UserController();

