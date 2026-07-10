
import { logger } from "../config/logger.js";

import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
const client = new SibApiV3Sdk.TransactionalEmailsApi();

export async function verifyEmailTransport() {
  if (!process.env.BREVO_API_KEY) {
    logger.warn("BREVO_API_KEY not set — emails will not send");
    return;
  }
  logger.info("Brevo email service ready ✅");
}

export async function sendPasswordResetEmail(email, username, resetToken) {
  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  console.log(`\n🔑 Reset link for ${email}: ${resetURL}\n`);

  if (!process.env.BREVO_API_KEY) return;

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Reset your CGPA Pulse password";
    sendSmtpEmail.htmlContent = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;
                  padding:32px;background:#f4f3ff;border-radius:16px;">
        <h2 style="color:#1e1b4b;margin:0 0 8px;">Password reset</h2>
        <p style="color:#5b5687;margin:0 0 24px;">
          Hi ${username}, click below to reset your password.
          Expires in <strong>15 minutes</strong>.
        </p>
        <a href="${resetURL}"
           style="display:inline-block;
                  background:linear-gradient(135deg,#7c3aed,#10b981);
                  color:#fff;text-decoration:none;padding:14px 32px;
                  border-radius:12px;font-weight:700;font-size:15px;">
          Reset Password
        </a>
        <p style="color:#a09bbf;font-size:12px;margin:20px 0 0;">
          Didn't request this? Ignore this email.
        </p>
      </div>
    `;
    sendSmtpEmail.sender = {
      name:  "CGPA Pulse",
      email: process.env.EMAIL_FROM_ADDRESS,
    };
    sendSmtpEmail.to = [{ email }];

    await client.sendTransacEmail(sendSmtpEmail);
  } catch (err) {
    logger.error("Reset email failed:", err.message);
  }
}