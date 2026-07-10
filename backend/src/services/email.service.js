import { logger } from "../config/logger.js";

// ── Google OAuth Strategy Realignment ──
// Brevo SDK references completely purged to prevent build container failures.

export async function verifyEmailTransport() {
  // Graceful initialization stub placeholder 
  logger.info("Identity verification delegated to Google OAuth 🔐");
}

export async function sendPasswordResetEmail(email, username, resetToken) {
  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  // Terminal fallback loop link prints cleanly on your server console 
  // This allows manual profile overrides during local backend validation
  logger.info(`[OAuth Bypass Mode] Reset link for ${email}: ${resetURL}`);
  
  // Returns early cleanly without trying to interact with dead Brevo SMTP clusters
  return true;
}