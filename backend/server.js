import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { validateEnv } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";
import { verifyEmailTransport } from "./src/services/email.service.js";

// Validate all required env vars before anything starts
validateEnv();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB first, then start listening
    await connectDB();

    await verifyEmailTransport();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        logger.error(
          `Port ${PORT} is already in use. Stop the existing server or set a different PORT in .env.`
        );
      } else {
        logger.error("HTTP server error:", err);
      }
      process.exit(1);
    });

    // Graceful shutdown — close DB connection on termination signals
    const shutdown = (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

    process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();




