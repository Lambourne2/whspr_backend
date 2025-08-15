import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic || '');

interface AudioProcessingOptions {
  gapSeconds?: number;
  targetLufs?: number;
  bitrate?: number;
}

export class AudioService {
  async insertSilence(audioPath: string, outputPath: string, seconds: number): Promise<string> {
    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(audioPath)
          .input(`aevalsrc=0:d=${seconds}`)
          .complexFilter([
            '[0:a][1:a] concat=n=2:v=0:a=1'
          ])
          .audioCodec('aac')
          .save(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });
      
      return outputPath;
    } catch (error) {
      logger.error('Error inserting silence:', error);
      throw new Error('Failed to insert silence');
    }
  }

  async normalizeAudio(audioPath: string, outputPath: string, targetLufs: number = -16): Promise<string> {
    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(audioPath)
          .audioFilters(`loudnorm=I=${targetLufs}`)
          .audioCodec('aac')
          .save(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });
      
      return outputPath;
    } catch (error) {
      logger.error('Error normalizing audio:', error);
      throw new Error('Failed to normalize audio');
    }
  }

  async mixAudio(
    voicePath: string, 
    musicPath: string, 
    outputPath: string,
    duckLevel: number = -10
  ): Promise<string> {
    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(voicePath)
          .input(musicPath)
          .complexFilter([
            // Duck the music under the voice
            ` [1:a]volume=${duckLevel}dB[MusicDucked]`,
            // Mix voice and music
            '[0:a][MusicDucked]amix=inputs=2:duration=first'
          ])
          .audioCodec('aac')
          .save(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });
      
      return outputPath;
    } catch (error) {
      logger.error('Error mixing audio:', error);
      throw new Error('Failed to mix audio');
    }
  }

  async convertToMp3(inputPath: string, outputPath: string, bitrate: number = 128): Promise<string> {
    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(inputPath)
          .audioCodec('libmp3lame')
          .audioBitrate(bitrate)
          .save(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });
      
      return outputPath;
    } catch (error) {
      logger.error('Error converting to MP3:', error);
      throw new Error('Failed to convert to MP3');
    }
  }

  async getAudioDuration(audioPath: string): Promise<number> {
    try {
      const metadata = await new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
        ffmpeg.ffprobe(audioPath, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
      
      return metadata.format.duration || 0;
    } catch (error) {
      logger.error('Error getting audio duration:', error);
      return 0;
    }
  }
}

export default AudioService;
