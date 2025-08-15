import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger';

interface ElevenLabsConfig {
  apiKey: string;
  baseUrl?: string;
}

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
}

interface ElevenLabsResponse {
  audio_base64: string;
}

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl: string;
  private client: AxiosInstance;

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.elevenlabs.io/v1';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async synthesizeSpeech(
    text: string, 
    voiceId: string, 
    voiceSettings?: VoiceSettings
  ): Promise<Buffer> {
    try {
      const config: AxiosRequestConfig = {
        responseType: 'arraybuffer'
      };
      
      const response: AxiosResponse<ElevenLabsResponse> = await this.client.post<ElevenLabsResponse>(
        `/text-to-speech/${voiceId}`,
        {
          text,
          voice_settings: {
            stability: voiceSettings?.stability || 0.5,
            similarity_boost: voiceSettings?.similarity_boost || 0.75
          }
        },
        config
      );

      return Buffer.from(response.data);
    } catch (error) {
      logger.error('Error synthesizing speech with ElevenLabs:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  async synthesizeSpeechToFile(
    text: string, 
    voiceId: string, 
    outputPath: string,
    voiceSettings?: VoiceSettings
  ): Promise<string> {
    try {
      const audioBuffer: Buffer = await this.synthesizeSpeech(text, voiceId, voiceSettings);
      
      // Ensure directory exists
      const dir: string = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Write file
      await fs.writeFile(outputPath, audioBuffer);
      
      return outputPath;
    } catch (error) {
      logger.error('Error saving speech to file:', error);
      throw new Error('Failed to save speech to file');
    }
  }
}

export default ElevenLabsService;
