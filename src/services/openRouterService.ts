import axios, { AxiosInstance, AxiosResponse } from 'axios';
import logger from '../utils/logger';

interface OpenRouterConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class OpenRouterService {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private client: AxiosInstance;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'mistralai/mistral-7b-instruct';
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://whspr.app',
        'X-Title': 'WHSR App'
      }
    });
  }

  async generateAffirmations(prompt: string, count: number = 20): Promise<string[]> {
    try {
      const response: AxiosResponse<OpenRouterResponse> = await this.client.post<OpenRouterResponse>('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates positive affirmations.'
          },
          {
            role: 'user',
            content: `${prompt}. Generate exactly ${count} unique affirmations, one per line, without numbering or bullets.`
          }
        ],
        temperature: 0.7
      });

      const content: string = response.data.choices[0].message.content;
      return content.split('\n').filter((line: string) => line.trim().length > 0);
    } catch (error) {
      logger.error('Error generating affirmations with OpenRouter:', error);
      throw new Error('Failed to generate affirmations');
    }
  }
}

export default OpenRouterService;
