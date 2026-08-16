import "dotenv/config";
import mongoose from "mongoose";
import app      from "./src/app.js";
import { connectDB }    from "./src/config/db.js";
import { validateEnv }  from "./src/config/env.js";
import { logger }       from "./src/config/logger.js";
import User             from "./src/models/User.js"; 

validateEnv();

// Register BEFORE startServer — catches errors during DB connect and app init
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// ── One-time auto enrollment migration ──────────────────────────────────────
async function autoMigrateLeaderboardOptIn() {
  try {
    // Force update ALL users in localhost database
    const result = await User.updateMany(
      {}, // Empty filter = targets every user in DB
      { 
        $set: { 
          lbOptIn: true, 
          lbOptInDate: new Date() 
        } 
      }
    );
    
    logger.info(`[Migration] Updated ${result.modifiedCount} users to lbOptIn: true`);
  } catch (error) {
    logger.error("[Migration Error] Failed to update users:", error);
  }
}

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Tells Express to trust Render's reverse proxy so req.secure returns true for HTTPS.
    app.set("trust proxy", 1);

    await connectDB();

    // Auto-enroll all existing users who haven't explicitly set opt-in status
    await autoMigrateLeaderboardOptIn();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    server.on("error", (err) => {
      logger.error(err.code === "EADDRINUSE"
        ? `Port ${PORT} is already in use`
        : `HTTP server error: ${err.message}`
      );
      process.exit(1);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await mongoose.connection.close();
        logger.info("HTTP server and DB connection closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();