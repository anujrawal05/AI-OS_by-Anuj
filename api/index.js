import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://ai-os-powerd-by-ar-labs.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Cache control middleware
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  if (req.path.includes('/static/') || req.path.match(/\.(js|css|png|jpg|gif|svg|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes placeholder
app.post('/api/auth/register', (req, res) => {
  res.status(200).json({ message: 'Registration endpoint', environment: process.env.NODE_ENV });
});

app.post('/api/auth/login', (req, res) => {
  res.status(200).json({ message: 'Login endpoint', environment: process.env.NODE_ENV });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
