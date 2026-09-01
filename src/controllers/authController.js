const { ADMIN_PASSWORD, generateAuthToken } = require('../middleware/auth');

exports.login = (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  if (password === ADMIN_PASSWORD) {
    const token = generateAuthToken(ADMIN_PASSWORD);
    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      admin: { name: 'Admin', role: 'admin' }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid password. Access denied.' });
};

exports.checkSession = (req, res) => {
  res.json({ success: true, message: 'Session is valid' });
};
