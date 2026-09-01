const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local upload fallback directory exists
const uploadDir = path.join(__dirname, '..', '..', 'assets', 'products', 'uploaded');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = {
  upload,
  uploadDir
};
