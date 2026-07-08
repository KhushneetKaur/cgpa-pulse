import { Resend } from "resend";
import { logger } from "../config/logger.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function verifyEmailTransport() {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set — emails will not send");
    return;
  }
  logger.info("Resend email service ready ✅");
}

export async function sendVerificationOTP(email, username, otp) {
  console.log(`\n📧 OTP for ${email}: ${otp}\n`);

  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY missing — OTP logged to console only");
    return;
  }

  try {
    await resend.emails.send({
      from:    process.env.EMAIL_FROM || "CGPA Pulse <onboarding@resend.dev>",
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
                      letter-spacing:1px;text-transform:uppercase;">Your OTP</p>
            <p style="margin:0;font-size:40px;font-weight:900;
                      letter-spacing:10px;color:#6d28d9;">${otp}</p>
          </div>
          <p style="color:#a09bbf;font-size:12px;margin:20px 0 0;text-align:center;">
            Didn't sign up? Ignore this email.
          </p>
        </div>
      `,
    });
    logger.info(`OTP email sent to ${email}`);
  } catch (err) {
    logger.error("Resend email failed:", err.message);
    // Don't rethrow — user can resend OTP from verification screen
  }
}

export async function sendPasswordResetEmail(email, username, resetToken) {
  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  console.log(`\n🔑 Reset link for ${email}: ${resetURL}\n`);

  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from:    process.env.EMAIL_FROM || "CGPA Pulse <onboarding@resend.dev>",
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
    logger.error("Reset email failed:", err.message);
  }
}