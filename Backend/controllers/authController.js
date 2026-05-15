
const authService = require('../services/authService');
const { validateSignup, validateLogin } = require('../middleware/validate');

class AuthController {
  async signup(req, res) {
    try {
      // Validate input
      const errors = validateSignup(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
      }

      const { name, email, password, role } = req.body;
      const result = await authService.signup(name.trim(), email.trim().toLowerCase(), password, role);
      res.status(201).json(result);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      // Validate input
      const errors = validateLogin(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
      }

      const { email, password } = req.body;
      const result = await authService.login(email.trim().toLowerCase(), password);
      res.json(result);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await authService.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
