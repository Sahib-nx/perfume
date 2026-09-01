const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const rootDir = path.join(__dirname, '..');

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static assets and frontend
app.use(express.static(rootDir));

// Mount Routes
app.use(routes);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
