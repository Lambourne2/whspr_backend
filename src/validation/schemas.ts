import { z } from 'zod';

// Auth schemas
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Affirmation schemas
export const GenerateAffirmationsSchema = z.object({
  themes: z.array(z.string()).min(1, 'At least one theme is required'),
  tone: z.enum(['calm', 'grateful', 'confident']).optional(),
  count: z.number().min(1).max(50).default(20),
  gapSeconds: z.number().min(1).max(10).default(4),
});

// Voice schemas
export const SynthesizeVoiceSchema = z.object({
  text: z.union([z.string(), z.array(z.string())]),
  voiceId: z.string(),
  voiceParams: z.object({
    stability: z.number().min(0).max(1).optional(),
    similarity_boost: z.number().min(0).max(1).optional(),
  }).optional(),
});

// Track schemas
export const AssembleTrackSchema = z.object({
  affirmations: z.array(z.string()).min(1, 'At least one affirmation is required'),
  voiceId: z.string(),
  backingTrackId: z.string(),
  gapSeconds: z.number().min(1).max(10).default(4),
  targetLufs: z.number().min(-30).max(-10).default(-16),
});

// Job schemas
export const JobIdSchema = z.object({
  jobId: z.string().uuid(),
});

export const TrackIdSchema = z.object({
  trackId: z.string().uuid(),
});

// Export types
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type GenerateAffirmationsInput = z.infer<typeof GenerateAffirmationsSchema>;
export type SynthesizeVoiceInput = z.infer<typeof SynthesizeVoiceSchema>;
export type AssembleTrackInput = z.infer<typeof AssembleTrackSchema>;
