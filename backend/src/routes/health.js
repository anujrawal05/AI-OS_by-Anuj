const express = require('express');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Server liveness check
 *     description: Responds with a 200 OK status to indicate that the server is alive and accepting requests.
 *     responses:
 *       200:
 *         description: Server is live
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 database:
 *                   type: string
 *                   example: connected
 *                 version:
 *                   type: string
 *                   example: '2.0.0'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    database: 'connected',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Database connection readiness check
 *     description: Executes a raw ping to the database to ensure connection readiness.
 *     responses:
 *       200:
 *         description: Database is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 database:
 *                   type: string
 *                   example: connected
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Database connection offline
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: down
 *                 database:
 *                   type: string
 *                   example: disconnected
 *                 error:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      ready: true,
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('[Health Check] Readiness failed to ping database:', { error: error.message });
    res.status(503).json({
      success: false,
      ready: false,
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

router.get('/version', (req, res) => {
  res.status(200).json({
    success: true,
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
