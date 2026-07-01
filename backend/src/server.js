const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`AI-OS v2 Backend Foundation running on port ${PORT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] HTTP connections closed. Process terminating.');
    process.exit(0);
  });
});
