import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import logger from '../utils/logger';
import prisma from '../utils/db';
import { User as PrismaUser } from '@prisma/client';

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
    const saltRounds: number = 10;
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
      const decoded = jwt.verify(token, this.jwtSecret, { algorithms: ['HS256'] }) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  async registerUser(email: string, password: string): Promise<{ token: string; user: User } | null> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const passwordHash: string = await this.hashPassword(password);
      
      // Create user
      const prismaUser: PrismaUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
        }
      });

      // Convert Prisma user to our User type
      const user: User = {
        id: prismaUser.id,
        email: prismaUser.email,
        passwordHash: prismaUser.passwordHash,
        createdAt: prismaUser.createdAt,
      };

      // Generate token
      const token: string = this.generateToken(user);

      return { token, user };
    } catch (error) {
      logger.error('Registration failed:', error);
      return null;
    }
  }

  async loginUser(email: string, password: string): Promise<{ token: string; user: User } | null> {
    try {
      // Find user
      const prismaUser = await prisma.user.findUnique({
        where: { email }
      });

      if (!prismaUser) {
        throw new Error('User not found');
      }

      // Verify password
      const isValid: boolean = await this.verifyPassword(password, prismaUser.passwordHash);
      if (!isValid) {
        throw new Error('Invalid password');
      }

      // Convert Prisma user to our User type
      const user: User = {
        id: prismaUser.id,
        email: prismaUser.email,
        passwordHash: prismaUser.passwordHash,
        createdAt: prismaUser.createdAt,
      };

      // Generate token
      const token: string = this.generateToken(user);

      return { token, user };
    } catch (error) {
      logger.error('Login failed:', error);
      return null;
    }
  }
}

export default AuthService;
