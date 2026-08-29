import { config } from './config/index.js';
import { testConnection, closePool } from './config/database.js';
import app from './app.js';

async function start() {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║         AlgoLab Backend API           ║
  ║    Algorithmic Trading Platform       ║
  ╚═══════════════════════════════════════╝
  `);

  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Cannot start without database connection. Exiting.');
    process.exit(1);
  }

  // Start HTTP server
  const server = app.listen(config.port, () => {
    console.log(`\n🚀 Server running on http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Health check: http://localhost:${config.port}/api/health\n`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await closePool();
      console.log('Server shut down.');
      process.exit(0);
    });
    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
