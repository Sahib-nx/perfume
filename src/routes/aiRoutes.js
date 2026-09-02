/**
 * AI Features API Routes
 * Diwan Al Attour
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/generate-description', verifyAuth, aiController.generateDescription);
router.post('/generate-tags', verifyAuth, aiController.generateTags);

module.exports = router;
