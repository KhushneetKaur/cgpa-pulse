import { logger } from "../config/logger.js";

export async function verifyEmailTransport() {
  logger.info("Email service not required — auth handled via Google OAuth 🔐");
}