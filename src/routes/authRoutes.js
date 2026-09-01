const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAuth } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/check', verifyAuth, authController.checkSession);

module.exports = router;
