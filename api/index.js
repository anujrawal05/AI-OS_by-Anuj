import { createRequire } from "module";

const require = createRequire(import.meta.url);

let app;

try {
  if (!process.env.VERCEL) {
    require("dotenv").config();
  }
  // Require our modular Express backend application
  app = require("../backend/src/app");
} catch (err) {
  console.error("[Vercel Boot Error] Failed to initialize Express app:", err);

  const express = require("express");
  app = express();
  
  app.get("*", (req, res) => {
    res.status(500).json({
      success: false,
      message: "Vercel serverless function boot error.",
      error: err.message,
      stack: err.stack
    });
  });
}

export default app;
