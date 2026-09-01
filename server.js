/**
 * Diwan Al Attour - Server Entry Point
 * Haute Parfumerie Luxury Storefront & Admin Portal
 */

require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Start Server & Connect Database
const server = app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`  DIWAN AL ATTOUR SERVER RUNNING`);
  console.log(`  Storefront : http://localhost:${PORT}`);
  console.log(`  Admin Panel: http://localhost:${PORT}/admin.html (or /admin)`);
  console.log(`====================================================`);
  await connectDB();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

