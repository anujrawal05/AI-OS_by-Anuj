# AI-OS v2 Backend Foundation

This is the fresh, clean backend folder skeleton for **AI-OS v2**.

## Structure
- `/src/controllers` - Request handlers
- `/src/routes` - Express API endpoint declarations
- `/src/services` - Database queries, payment wrappers, email senders
- `/src/middleware` - JWT auth controls, request loggers, rate-limit checkers
- `/src/models` - Schema models and data entities
- `/src/config` - Environment parses and configuration validations
- `/src/utils` - General helper utilities
- `/src/server.js` - Server entry bootstrap script

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup configurations:
   - Copy `.env.example` from the root directory to `backend/.env`
   - Fill in database links and API keys.

3. Start development server:
   ```bash
   npm run dev
   ```

## Active Endpoints
- **GET `/health`**: Returns `{"status": "ok"}`
