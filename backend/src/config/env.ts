import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'swipe-x-super-secret-jwt-key-2026-production',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  aiMode: (process.env.AI_MODE || (process.env.GEMINI_API_KEY ? 'gemini' : 'mock')) as 'gemini' | 'mock',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  uploadLimitMb: 10,
};
