const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const uploadRoutes = require('./uploadRoutes');
const pageRoutes = require('./pageRoutes');

// API Endpoints
router.use('/api/auth', authRoutes);
router.use('/api/products', productRoutes);
router.use('/api/upload', uploadRoutes);

// Static Page Routes
router.use('/', pageRoutes);

module.exports = router;
