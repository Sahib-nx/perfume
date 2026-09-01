require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';

function generateAuthToken(password) {
  return Buffer.from(`admin:${password}:${new Date().getFullYear()}`).toString('base64');
}

function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const expectedToken = generateAuthToken(ADMIN_PASSWORD);

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  if (token === expectedToken || token === ADMIN_PASSWORD) {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Invalid credentials or session expired.' });
}

module.exports = {
  ADMIN_PASSWORD,
  generateAuthToken,
  verifyAuth
};
