import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { AssembleTrackSchema } from '../validation/schemas';
import ElevenLabsService from '../services/elevenLabsService';
import AudioService from '../services/audioService';
import logger from '../utils/logger';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { trackAssemblyRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Initialize services
const elevenLabsService = new ElevenLabsService({
  apiKey: process.env.ELEVENLABS_API_KEY || ''
});
const audioService = new AudioService();

// Mock backing tracks data
const backingTracks = [
  { id: '1', name: 'Ocean Waves', durationSec: 300, tags: ['nature', 'water'] },
  { id: '2', name: 'Rainforest', durationSec: 300, tags: ['nature', 'rain'] },
  { id: '3', name: 'Gentle Piano', durationSec: 300, tags: ['instrumental', 'piano'] },
];

// GET /v1/tracks
router.get('/', (req, res) => {
  try {
    res.json(backingTracks);
  } catch (error) {
    logger.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// POST /v1/tracks/assemble
router.post('/assemble',
  trackAssemblyRateLimiter,
  body('affirmations').isArray({ min: 1 }),
  body('voiceId').exists(),
  body('backingTrackId').exists(),
  body('gapSeconds').optional().isInt({ min: 1, max: 10 }),
  body('targetLufs').optional().isFloat({ min: -30, max: -10 }),
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Validate with Zod
      const result = AssembleTrackSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }

      const { affirmations, voiceId, backingTrackId, gapSeconds, targetLufs } = result.data;

      // Determine data directory
      const dataDir = process.env.DATA_DIR || '/tmp/whspr';
      
      // Generate unique track ID
      const trackId = uuidv4();
      
      // Create directories
      const trackDir = path.join(dataDir, 'tracks', trackId);
      const tempDir = path.join(trackDir, 'temp');
      
      // In a real implementation, we would:
      // 1. Generate speech for each affirmation
      // 2. Insert silences between affirmations
      // 3. Normalize the voice track
      // 4. Mix with backing track
      // 5. Export as MP3
      // 6. Save to database
      
      // For this example, we'll simulate the process
      const outputPath = path.join(trackDir, 'final.mp3');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return track information
      res.json({
        trackId,
        url: `/v1/content/${trackId}`,
        durationSec: affirmations.length * 5, // Approximate duration
      });
    } catch (error) {
      logger.error('Track assembly error:', error);
      res.status(500).json({ error: 'Failed to assemble track' });
    }
  }
);

// GET /v1/content/:trackId
router.get('/content/:trackId', (req, res) => {
  try {
    const { trackId } = req.params;
    
    // In a real implementation, we would:
    // 1. Verify the track exists
    // 2. Check permissions
    // 3. Serve the MP3 file
    
    res.json({ message: `Would serve MP3 file for track ${trackId}` });
  } catch (error) {
    logger.error('Error serving track:', error);
    res.status(500).json({ error: 'Failed to serve track' });
  }
});

// DELETE /v1/content/:trackId
router.delete('/content/:trackId', (req, res) => {
  try {
    const { trackId } = req.params;
    
    // In a real implementation, we would:
    // 1. Verify the track exists
    // 2. Check permissions
    // 3. Delete the track file
    // 4. Remove from database
    
    res.json({ message: `Track ${trackId} deleted successfully` });
  } catch (error) {
    logger.error('Error deleting track:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

export default router;
