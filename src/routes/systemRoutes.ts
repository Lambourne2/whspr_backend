import { Router } from 'express';
import os from 'os';
import logger from '../utils/logger';

const router = Router();

// GET /healthz
router.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GET /v1/meta
router.get('/meta', (req, res) => {
  try {
    const meta = {
      version: '1.0.0',
      uptimeSec: Math.floor(process.uptime()),
      gitSha: process.env.GIT_SHA || 'unknown',
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external
      }
    };
    
    res.json(meta);
  } catch (error) {
    logger.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

export default router;
