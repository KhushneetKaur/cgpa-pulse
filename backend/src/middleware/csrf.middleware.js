import crypto from "crypto";

/**
 * Issues a CSRF token as an un-httpOnly cookie and JSON response.
 * Client frontend reads this token and returns it in the X-CSRF-Token header.
 */
export function issueCsrfToken(req, res) {
  const token = crypto.randomBytes(32).toString("hex");

  res.cookie("csrfToken", token, {
    httpOnly: false, // Must be readable by client JS
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.json({ success: true, data: { token } });
}

/**
 * Validates the X-CSRF-Token header against the csrfToken cookie.
 */
export function csrfProtection(req, res, next) {
  // Skip safe HTTP methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token",
    });
  }

  next();
}