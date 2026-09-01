const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { verifyAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', verifyAuth, upload.single('image'), uploadController.uploadImage);

module.exports = router;
