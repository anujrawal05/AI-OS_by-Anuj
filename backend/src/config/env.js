const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

// Load environment variables from backend/.env if not already loaded in process
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Setup Neon / Vercel PostgreSQL connection URL fallback logic
if (!process.env.DATABASE_URL) {
  const fallback = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
  if (fallback) {
    process.env.DATABASE_URL = fallback;
  }
}

// Support both RAZORPAY_KEY_SECRET and RAZORPAY_SECRET_KEY
if (!process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_SECRET_KEY) {
  process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_SECRET_KEY;
}

// Zod validation schema
const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  RAZORPAY_KEY_ID: z.string().optional().or(z.literal('')),
  RAZORPAY_KEY_SECRET: z.string().optional().or(z.literal('')),
  BREVO_API_KEY: z.string().optional().or(z.literal('')),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email').optional().or(z.literal('')),
  EMAIL_FROM_NAME: z.string().default('AI-OS'),
  OPENROUTER_API_KEY: z.string().optional().or(z.literal('')),
  NEWS_API_KEY: z.string().optional().or(z.literal('')),
  FINNHUB_API_KEY: z.string().optional().or(z.literal('')),
  COUPON_CODES: z.string().default(''),
});

let parsedEnv;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (process.env.NODE_ENV !== 'test') {
    console.error('❌ Invalid environment variables:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(error);
    }
    
    console.error('\n⚠️  DEPLOYMENT FIX: Set these in Vercel → Project Settings → Environment Variables.\n');

    // In serverless environments, don't crash hard immediately at build time,
    // but crash if running locally to prevent developer mistakes.
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
  
  // Safe default object in case validation fails in test/vercel environment
  parsedEnv = {
    PORT: Number(process.env.PORT) || 8080,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret-must-be-32-chars-long-for-testing',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
    BREVO_API_KEY: process.env.BREVO_API_KEY || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@aios.com',
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'AI-OS',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
    NEWS_API_KEY: process.env.NEWS_API_KEY || '',
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY || '',
    COUPON_CODES: process.env.COUPON_CODES || '',
  };
}

module.exports = parsedEnv;
