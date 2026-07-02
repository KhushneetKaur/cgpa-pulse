import mongoose from "mongoose";
import { logger } from "./logger.js";

export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options avoid deprecation warnings
      serverSelectionTimeoutMS: 5000,  // fail fast if Atlas unreachable
      socketTimeoutMS:          45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // Log when connection drops
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

  } catch (err) {
    logger.error("MongoDB initial connection failed:", err.message);
    throw err;  // let server.js handle the exit
  }
}