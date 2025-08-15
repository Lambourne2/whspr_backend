import { Router } from 'express';
import authRoutes from './authRoutes';
import affirmationsRoutes from './affirmationsRoutes';
import voiceRoutes from './voiceRoutes';
import tracksRoutes from './tracksRoutes';
import systemRoutes from './systemRoutes';

const router = Router();

// System routes (no auth required)
router.use('/', systemRoutes);

// API v1 routes
router.use('/v1/auth', authRoutes);
router.use('/v1/affirmations', affirmationsRoutes);
router.use('/v1/voice', voiceRoutes);
router.use('/v1/tracks', tracksRoutes);

export default router;
