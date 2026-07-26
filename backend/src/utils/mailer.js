import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Shared base wrapper (dark theme: #080c18 bg, #7c3aed accent) ─────────────
function baseTemplate(title, bodyHtml) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
  <body style="margin:0;padding:0;background:#080c18;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:40px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Header -->
          <tr><td style="background:linear-gradient(135deg,#7c3aed,#a78bfa);border-radius:12px 12px 0 0;padding:24px 32px;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">CGPA Pulse</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);">MRSPTU Bathinda</p>
          </td></tr>
          <!-- Body -->
          <tr><td style="background:#0f1133;border-radius:0 0 12px 12px;padding:32px;border:1px solid rgba(167,139,250,0.18);border-top:none;">
            <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#fff;">${title}</h2>
            ${bodyHtml}
            <p style="margin:24px 0 0;font-size:11px;color:rgba(255,255,255,0.25);">Unofficial · Not affiliated with MRSPTU · Free forever</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
}

export async function sendOTPEmail(to, otp) {
  const body = `
    <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.6;"
    >Use the code below to verify your identity. It expires in <strong style="color:#a78bfa;">15 minutes</strong>.</p>
    <div style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.35);border-radius:10px;padding:20px;text-align:center;">
      <p style="margin:0;font-size:36px;font-weight:900;letter-spacing:12px;color:#a78bfa;font-family:monospace;">${otp}</p>
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">If you didn't request this, ignore this email.</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your CGPA Pulse verification code",
    html: baseTemplate("Verification Code", body),
    text: `Your CGPA Pulse OTP is: ${otp}. Valid for 15 minutes.`,
  });
}

export async function sendPasswordResetEmail(to, resetLink) {
  const body = `
    <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.6;"
    >Click the button below to reset your password. This link expires in <strong style="color:#a78bfa;">15 minutes</strong>.</p>
    <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;">Reset Password</a>
    <p style="margin:20px 0 0;font-size:11px;color:rgba(255,255,255,0.3);">Or paste this link: <span style="color:#a78bfa;word-break:break-all;">${resetLink}</span></p>
    <p style="margin:12px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">If you didn't request this, ignore this email.</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your CGPA Pulse password",
    html: baseTemplate("Password Reset", body),
    text: `Reset your CGPA Pulse password: ${resetLink}\nExpires in 15 minutes.`,
  });
}
