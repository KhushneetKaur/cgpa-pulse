import nodemailer from "nodemailer";
import { logger } from "../config/logger.js";

const transporter = nodemailer.createTransport({
  host:   "smtp.gmail.com",
  port:   587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function verifyEmailTransport() {
  try {
    await transporter.verify();
    logger.info("Email transporter ready ✅");
  } catch (err) {
    logger.warn("Email transporter not ready:", err.message);
  }
}

export async function sendVerificationOTP(email, username, otp) {
  try {
    // Log to file/winston in production only — never log OTP to console
    if (process.env.NODE_ENV === "development") {
      logger.debug(`OTP for ${email}: ${otp}`);
    }

    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      email,
      subject: "Verify your CGPA Pulse account",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;
                    padding:32px;background:#f4f3ff;border-radius:16px;">
          <h2 style="color:#1e1b4b;margin:0 0 8px;">Hey ${username} 👋</h2>
          <p style="color:#5b5687;margin:0 0 24px;">
            Use this code to verify your CGPA Pulse account.
            Expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:#fff;border-radius:12px;padding:24px;
                      text-align:center;border:1.5px solid #e4e2f0;">
            <p style="margin:0 0 8px;font-size:13px;color:#a09bbf;
                      letter-spacing:1px;text-transform:uppercase;">
              Your OTP
            </p>
            <p style="margin:0;font-size:40px;font-weight:900;
                      letter-spacing:10px;color:#6d28d9;">
              ${otp}
            </p>
          </div>
          <p style="color:#a09bbf;font-size:12px;margin:20px 0 0;
                    text-align:center;">
            Didn't sign up? Ignore this email.
          </p>
        </div>
      `,
    });
  } catch (err) {
    logger.error("Failed to send verification OTP email:", {
      email,
      error: err.message,
      stack: err.stack,
    });
    throw err;
  }
}

export async function sendPasswordResetEmail(email, username, resetToken) {
  try {
    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Log to file/winston in development only — never log reset link to console
    if (process.env.NODE_ENV === "development") {
      logger.debug(`Reset link for ${email}: ${resetURL}`);
    }

    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      email,
      subject: "Reset your CGPA Pulse password",
      html: `
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
      `,
    });
  } catch (err) {
    logger.error("Failed to send password reset email:", {
      email,
      error: err.message,
      stack: err.stack,
    });
    throw err;
  }
}
