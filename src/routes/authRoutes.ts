import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import AuthService from '../services/authService';
import { RegisterSchema, LoginSchema } from '../validation/schemas';
import logger from '../utils/logger';

const router = Router();
const authService = new AuthService();

// POST /v1/auth/register
router.post('/register', 
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Validate with Zod
      const result = RegisterSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }

      const { email, password } = result.data;

      // Register user
      const registrationResult = await authService.registerUser(email, password);
      if (!registrationResult) {
        return res.status(400).json({ error: 'Registration failed' });
      }

      const { token, user } = registrationResult;
      
      // Return token (exclude password hash)
      const { passwordHash, ...userWithoutPassword } = user;
      res.status(201).json({ 
        token, 
        user: userWithoutPassword 
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /v1/auth/login
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Validate with Zod
      const result = LoginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }

      const { email, password } = result.data;

      // Login user
      const loginResult = await authService.loginUser(email, password);
      if (!loginResult) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const { token, user } = loginResult;
      
      // Return token (exclude password hash)
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ 
        token, 
        user: userWithoutPassword 
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /v1/auth/me
router.get('/me', (req, res) => {
  // In a real implementation, this would verify the JWT token
  // and return the user information
  res.json({ message: 'Protected route - user info would be returned here' });
});

export default router;
