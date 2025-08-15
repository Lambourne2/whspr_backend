import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import logger from '../utils/logger';

// Define user schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

interface JwtPayload {
  userId: string;
  email: string;
}

export class AuthService {
  private jwtSecret: string;
  private tokenExpiry: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'whspr-default-secret';
    this.tokenExpiry = '7d'; // 7 days
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateToken(user: { id: string; email: string }): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, this.jwtSecret, { 
      expiresIn: this.tokenExpiry,
      algorithm: 'HS256' 
    });
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  // Mock user storage (in a real app, this would use a database)
  private users: Map<string, User> = new Map();

  async registerUser(email: string, password: string): Promise<{ token: string; user: User } | null> {
    try {
      // Check if user already exists
      for (const user of this.users.values()) {
        if (user.email === email) {
          throw new Error('User already exists');
        }
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);
      
      // Create user
      const userId = Math.random().toString(36).substring(2, 15);
      const user: User = {
        id: userId,
        email,
        passwordHash,
        createdAt: new Date(),
      };

      // Store user
      this.users.set(userId, user);

      // Generate token
      const token = this.generateToken(user);

      return { token, user };
    } catch (error) {
      logger.error('Registration failed:', error);
      return null;
    }
  }

  async loginUser(email: string, password: string): Promise<{ token: string; user: User } | null> {
    try {
      // Find user
      let user: User | undefined;
      for (const u of this.users.values()) {
        if (u.email === email) {
          user = u;
          break;
        }
      }

      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isValid = await this.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        throw new Error('Invalid password');
      }

      // Generate token
      const token = this.generateToken(user);

      return { token, user };
    } catch (error) {
      logger.error('Login failed:', error);
      return null;
    }
  }
}

export default AuthService;
