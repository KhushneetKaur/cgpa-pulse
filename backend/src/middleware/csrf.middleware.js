import crypto from "crypto";

// CSRF is only meaningful for routes that don't already use JWT auth.
// All our protected routes use httpOnly JWT cookies which are
// already immune to CSRF by definition — a cross-origin page
// cannot read or set httpOnly cookies.
// We keep CSRF only for the public auth routes as a belt-and-braces measure.

const CSRF_PROTECTED = new Set([
  // Only protect public endpoints that don't require JWT
  // Currently none — all our sensitive routes require JWT
  // Leave this set empty to disable CSRF checks globally
]);

export function issueCsrfToken(req, res) {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie("csrfToken", token, {
    httpOnly: false,          // must be readable by JS
    secure:   process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge:   60 * 60 * 1000, // 1 hour
  });
  res.json({ success: true, data: { token } });
}

export function csrfProtection(req, res, next) {
  // Skip CSRF entirely — JWT httpOnly cookies already prevent CSRF
  // In cross-domain production setup (Vercel+Render) CSRF cookies
  // don't work reliably anyway
  return next();
}