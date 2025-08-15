# Whspr API Backend

A standalone TypeScript + Express backend for Whspr that proxies OpenRouter (affirmation generation) and ElevenLabs (TTS), assembles full sleep tracks server-side with FFmpeg, and exposes a JWT-protected REST API.

## Features

- **Affirmation Generation**: Proxies OpenRouter to generate positive affirmations
- **Text-to-Speech**: Proxies ElevenLabs to convert text to speech
- **Audio Processing**: Server-side audio pipeline with FFmpeg
- **User Authentication**: JWT-based authentication
- **Rate Limiting**: Per-endpoint rate limiting
- **Structured Logging**: Pino-based structured logging
- **Database**: Prisma ORM with PostgreSQL
- **Deployment**: Render-ready with persistent disk storage

## Tech Stack

- Node.js 20+
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Zod (validation)
- jsonwebtoken (JWT)
- express-rate-limit
- pino (structured logs)
- cors
- ffmpeg-static + fluent-ffmpeg
- dotenv (dev only)

## API Endpoints

### Authentication

- `POST /v1/auth/register` - Register a new user
- `POST /v1/auth/login` - Login existing user
- `GET /v1/auth/me` - Get current user info (JWT protected)

### Affirmations

- `POST /v1/affirmations/generate` - Generate affirmations based on themes

### Voice

- `POST /v1/voice/synthesize` - Convert text to speech

### Tracks

- `GET /v1/tracks` - List available backing tracks
- `POST /v1/tracks/assemble` - Assemble a complete sleep track
- `GET /v1/content/:trackId` - Serve MP3 file
- `DELETE /v1/content/:trackId` - Delete a track

### System

- `GET /healthz` - Health check endpoint
- `GET /v1/meta` - API metadata

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Security
JWT_SECRET=your-super-secret-jwt-key
ALLOWED_ORIGINS=http://localhost:5173,https://whspr.app

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/whspr

# External APIs
OPENROUTER_API_KEY=your-openrouter-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Storage
DATA_DIR=/var/whspr/data
```

## Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whspr_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Set up database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

This application is configured for deployment on Render. The `render.yaml` file contains the deployment configuration.

### Render Deployment Steps

1. Fork this repository to your GitHub account
2. Create a new Web Service on Render
3. Connect it to your forked repository
4. Configure the environment variables in the Render dashboard
5. Create a PostgreSQL database instance
6. The build and deployment will happen automatically

## Project Structure

```
src/
├── index.ts          # Application entry point
├── routes/           # API route definitions
├── services/         # Business logic and external service integrations
├── middleware/       # Express middleware
├── validation/       # Zod validation schemas
└── utils/            # Utility functions

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations
```

## Audio Processing Pipeline

1. Generate per-line WAVs via ElevenLabs
2. Insert gapSeconds silences; concat sequence
3. Normalize voice (e.g., loudnorm pass or gain staging)
4. Mix with selected backing track; duck backing under voice; add 1–2s fade in/out
5. Export MP3; write to DATA_DIR

## Rate Limits

- `/v1/affirmations/generate`: 20 requests per 15 minutes per IP
- `/v1/tracks/assemble`: 5 requests per 15 minutes per user

## Security

- All upstream keys are stored server-side only
- CORS restricted to configured origins
- JWT tokens with 7-day expiry
- Rate limiting on all endpoints
- Input validation with Zod on every request

## License

MIT
