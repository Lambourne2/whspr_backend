import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { GenerateAffirmationsSchema } from '../validation/schemas';
import OpenRouterService from '../services/openRouterService';
import logger from '../utils/logger';
import { affirmationRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Initialize OpenRouter service
const openRouterService = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY || ''
});

// POST /v1/affirmations/generate
router.post('/generate', 
  affirmationRateLimiter,
  body('themes').isArray({ min: 1 }),
  body('tone').optional().isIn(['calm', 'grateful', 'confident']),
  body('count').optional().isInt({ min: 1, max: 50 }),
  body('gapSeconds').optional().isInt({ min: 1, max: 10 }),
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Validate with Zod
      const result = GenerateAffirmationsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }

      const { themes, tone, count, gapSeconds } = result.data;

      // Create prompt based on themes and tone
      let prompt = `Create positive affirmations`;
      if (tone) {
        prompt += ` with a ${tone} tone`;
      }
      prompt += ` related to: ${themes.join(', ')}`;

      // Generate affirmations
      const affirmations = await openRouterService.generateAffirmations(prompt, count);

      res.json({ 
        affirmations, 
        promptUsed: prompt, 
        model: 'mistralai/mistral-7b-instruct' 
      });
    } catch (error) {
      logger.error('Affirmation generation error:', error);
      res.status(500).json({ error: 'Failed to generate affirmations' });
    }
  }
);

export default router;
