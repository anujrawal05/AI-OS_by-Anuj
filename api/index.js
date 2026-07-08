import dotenv from 'dotenv';
import app from '../backend/src/app.js';

if (!process.env.VERCEL) {
  dotenv.config();
}

export default app;
