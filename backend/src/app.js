import express         from "express";
import cors            from "cors";
import helmet          from "helmet";
import morgan          from "morgan";
import cookieParser    from "cookie-parser";
import mongoSanitize   from "express-mongo-sanitize";
import { logger }          from "./config/logger.js";
import authRoutes          from "./routes/auth.routes.js";
import userRoutes          from "./routes/user.routes.js";
import semesterRoutes      from "./routes/semester.routes.js";
import leaderboardRoutes   from "./routes/leaderboard.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// Trust proxy in production — required for correct IP detection behind Render/load balancers
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ── Allowed origins ───────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push(
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
  );
}

const uniqueOrigins = [...new Set(allowedOrigins)];

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:         uniqueOrigins,
  credentials:    true,
  methods:        ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], 
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── NoSQL injection sanitization ──────────────────────────────────────────────
app.use(mongoSanitize({
  sanitizeParams: true,
  sanitizeQuery:  true,
}));

// ── HTTP request logging ──────────────────────────────────────────────────────
app.use(morgan(
  process.env.NODE_ENV === "development" ? "dev" : "combined",
  { stream: { write: (msg) => logger.http(msg.trim()) } }
));

// ── Health check — pinged by cron-job.org to keep Render warm ────────────────
app.get("/health", (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.json({ status: "ok", ts: Date.now() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/user",        userRoutes);
app.use("/api/semesters",   semesterRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// ── Global error handler  ───────────────────────────────────────
app.use(errorMiddleware);

export default app;