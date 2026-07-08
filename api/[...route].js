import dotenv from 'dotenv';
import app from '../backend/src/app.js';

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export default app;
