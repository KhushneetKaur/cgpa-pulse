import express      from "express";
import cors         from "cors";
import helmet       from "helmet";
import morgan       from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";

import { logger }           from "./config/logger.js";
import authRoutes           from "./routes/auth.routes.js";
import userRoutes           from "./routes/user.routes.js";
import semesterRoutes       from "./routes/semester.routes.js";
import leaderboardRoutes    from "./routes/leaderboard.routes.js";
import { errorMiddleware }  from "./middleware/error.middleware.js";
import { rateLimiter }      from "./middleware/rateLimit.middleware.js";
import { csrfProtection }   from "./middleware/csrf.middleware.js";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push(
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
  );
}

const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: true, // This dynamically allows whatever URL is trying to reach it (your Vercel link)
  credentials: true,   // allow cookies
  methods:     ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
}));
// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));        // reject huge payloads
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize({
  sanitizeParams: true,   // also clean req.params
  sanitizeQuery:  true,   // also clean req.query
  onSanitize: ({ req, key }) => {
    // optional: log when something got sanitized
  },
}));
app.use(csrfProtection);

// ── HTTP request logging ──────────────────────────────────────────────────────
// In dev: colorised one-liner. In prod: combined format piped to Winston.
app.use(morgan(
  process.env.NODE_ENV === "development" ? "dev" : "combined",
  {
    stream: {
      write: (msg) => logger.http(msg.trim()),
    },
  }
));

// ── Global rate limiter ───────────────────────────────────────────────────────
// Tighter limits are applied per-route in their own middleware files
app.use("/api", rateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:      200,              // 200 requests per window per IP
  message:  "Too many requests, please try again later.",
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/user",        userRoutes);
app.use("/api/semesters",   semesterRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CGPA Pulse API is running",
    env:     process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   `Route ${req.originalUrl} not found`,
  });
});

// ── Global error handler — must be last ──────────────────────────────────────
app.use(errorMiddleware);

export default app;
