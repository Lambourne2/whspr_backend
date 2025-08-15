import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { SynthesizeVoiceSchema } from '../validation/schemas';
import ElevenLabsService from '../services/elevenLabsService';
import logger from '../utils/logger';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Initialize ElevenLabs service
const elevenLabsService = new ElevenLabsService({
  apiKey: process.env.ELEVENLABS_API_KEY || ''
});

// POST /v1/voice/synthesize
router.post('/synthesize',
  body('text').exists(),
  body('voiceId').exists(),
  body('voiceParams').optional().isObject(),
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Validate with Zod
      const result = SynthesizeVoiceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }

      const { text, voiceId, voiceParams } = result.data;

      // Determine data directory
      const dataDir = process.env.DATA_DIR || '/tmp/whspr';
      
      // Handle single string or array of strings
      const texts = Array.isArray(text) ? text : [text];
      
      const files = [];
      
      // Process each text
      for (const [index, textItem] of texts.entries()) {
        // Generate unique filename
        const filename = `${uuidv4()}-${index}.wav`;
        const outputPath = path.join(dataDir, 'voice', filename);
        
        // Synthesize speech to file
        await elevenLabsService.synthesizeSpeechToFile(
          textItem,
          voiceId,
          outputPath,
          voiceParams
        );
        
        // Get duration
        // In a real implementation, we would use ffprobe to get the actual duration
        const duration = textItem.length * 0.1; // Approximate duration
        
        files.push({
          path: outputPath,
          duration
        });
      }

      res.json({ files });
    } catch (error) {
      logger.error('Voice synthesis error:', error);
      res.status(500).json({ error: 'Failed to synthesize voice' });
    }
  }
);

export default router;
