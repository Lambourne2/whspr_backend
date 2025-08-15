import prisma from '../utils/db';
import { Track as PrismaTrack } from '@prisma/client';
import logger from '../utils/logger';
import path from 'path';

export interface Track {
  id: string;
  userId?: string;
  status: 'ready' | 'processing' | 'error';
  path: string;
  durationSec: number;
  sizeBytes: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TracksService {
  async createTrack(data: {
    userId?: string;
    path: string;
    durationSec: number;
    sizeBytes: number;
  }): Promise<Track | null> {
    try {
      const track = await prisma.track.create({
        data: {
          userId: data.userId,
          path: data.path,
          durationSec: data.durationSec,
          sizeBytes: data.sizeBytes,
          status: 'processing',
        },
      });

      return this.mapPrismaTrackToTrack(track);
    } catch (error) {
      logger.error('Failed to create track:', error);
      return null;
    }
  }

  async updateTrackStatus(trackId: string, status: 'ready' | 'processing' | 'error'): Promise<Track | null> {
    try {
      const track = await prisma.track.update({
        where: { id: trackId },
        data: { status },
      });

      return this.mapPrismaTrackToTrack(track);
    } catch (error) {
      logger.error(`Failed to update track ${trackId} status:`, error);
      return null;
    }
  }

  async getTrackById(trackId: string): Promise<Track | null> {
    try {
      const track = await prisma.track.findUnique({
        where: { id: trackId },
      });

      return track ? this.mapPrismaTrackToTrack(track) : null;
    } catch (error) {
      logger.error(`Failed to get track ${trackId}:`, error);
      return null;
    }
  }

  async getTracksByUserId(userId: string): Promise<Track[]> {
    try {
      const tracks = await prisma.track.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return tracks.map(track => this.mapPrismaTrackToTrack(track));
    } catch (error) {
      logger.error(`Failed to get tracks for user ${userId}:`, error);
      return [];
    }
  }

  async deleteTrack(trackId: string): Promise<boolean> {
    try {
      await prisma.track.delete({
        where: { id: trackId },
      });
      return true;
    } catch (error) {
      logger.error(`Failed to delete track ${trackId}:`, error);
      return false;
    }
  }

  private mapPrismaTrackToTrack(track: PrismaTrack): Track {
    return {
      id: track.id,
      userId: track.userId || undefined,
      status: track.status as 'ready' | 'processing' | 'error',
      path: track.path,
      durationSec: track.durationSec,
      sizeBytes: track.sizeBytes,
      createdAt: track.createdAt,
      updatedAt: track.updatedAt,
    };
  }
}

export default TracksService;
