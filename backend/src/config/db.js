import mongoose from "mongoose";
import { logger } from "./logger.js";
import User from "../models/User.js"; 

export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options avoid deprecation warnings
      serverSelectionTimeoutMS: 5000,  // fail fast if Atlas unreachable
      socketTimeoutMS:          45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // Create indexes for fast Google Auth lookups
    User.collection.createIndex({ email: 1 }, { unique: true }).catch((err) => {
      logger.error("Failed to create email index:", err);
    });
    User.collection.createIndex({ googleId: 1 }, { sparse: true }).catch((err) => {
      logger.error("Failed to create googleId index:", err);
    });

    // Log when connection drops
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

  } catch (err) {
    logger.error("MongoDB initial connection failed:", err.message);
    throw err;  
  }
}