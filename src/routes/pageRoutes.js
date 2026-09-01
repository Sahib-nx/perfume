const express = require('express');
const path = require('path');
const router = express.Router();

const rootDir = path.join(__dirname, '..', '..');

router.get('/about', (req, res) => {
  res.sendFile(path.join(rootDir, 'about.html'));
});

router.get('/notes', (req, res) => {
  res.sendFile(path.join(rootDir, 'notes.html'));
});

router.get('/contact', (req, res) => {
  res.sendFile(path.join(rootDir, 'contact.html'));
});

router.get('/admin', (req, res) => {
  res.sendFile(path.join(rootDir, 'admin.html'));
});

module.exports = router;
