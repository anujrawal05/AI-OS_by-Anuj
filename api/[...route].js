import dotenv from 'dotenv';
import app from '../backend/src/app.js';

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export default function handler(req, res) {
  // Normalize incoming Vercel request paths so Express sees /api/*.
  let normalizedUrl = req.url || '';
  if (!normalizedUrl.startsWith('/')) {
    normalizedUrl = `/${normalizedUrl}`;
  }

  if (!normalizedUrl.startsWith('/api/')) {
    normalizedUrl = `/api${normalizedUrl}`;
  }

  req.url = normalizedUrl;
  res.setHeader('x-ai-os-normalized-url', normalizedUrl);
  return app(req, res);
}
