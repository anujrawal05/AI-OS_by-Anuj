import dotenv from 'dotenv';
import app from '../backend/src/app.js';

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export default function handler(req, res) {
  // Vercel may strip the /api prefix before forwarding to the function.
  // Normalize both local and serverless request paths so Express sees /api/*.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  return app(req, res);
}
