import jwt  from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";
import { logger } from "../config/logger.js";
import {
  sendPasswordResetEmail,
} from "./email.service.js";


// ── Set JWT as httpOnly cookie ────────────────────────────────────────────────
// httpOnly = JS cannot read it = safe from XSS attacks

export function setTokenCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("token", token, {
    httpOnly: true,
    secure:   isProduction, // True on Render (HTTPS)
    sameSite: isProduction ? "none" : "lax", // CRUCIAL: "none" allows cross-domain cookies
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
}

// ── Clear cookie on logout ────────────────────────────────────────────────────

export function clearTokenCookie(res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", "", {
    httpOnly: true,
    secure:   isProduction,
    sameSite: isProduction ? "none" : "lax", // Match the setting used when creating it
    expires:  new Date(0),
  });
}
// ── Signup ───────────────────────────────────────────────────────────

export async function registerUser({ username, email, password }) {
  const cleanUsername = username.trim();
  const cleanEmail    = email.toLowerCase().trim();

  const existingUsername = await User.findOne({ username: cleanUsername });
  if (existingUsername) throw ApiError.conflict("Username is already taken");

  const existingEmail = await User.findOne({ email: cleanEmail });
  if (existingEmail) throw ApiError.conflict("An account with this email already exists");

  const user = await User.create({
    username:        cleanUsername,
    email:           cleanEmail,
    passwordHash:    password,
    role:            "student",
    isEmailVerified: true,
  });

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return { user: user.toPublicJSON(), accessToken, refreshToken };
}

// ── Login ────────────────────────────────────────────────────────────

export async function loginUser({ identifier, password }) {
  // identifier can be username or email
  const isEmail = identifier.includes("@");

  // Must explicitly select passwordHash since select: false in schema
  const user = await User.findOne(
    isEmail
      ? { email: identifier.toLowerCase().trim() }
      : { username: identifier.trim() }
  ).select("+passwordHash");

 if (!user) {
  throw ApiError.unauthorized(
    "No account found with this username or email. Please sign up first."
  );
}

  if (!user.isActive) {
    throw ApiError.unauthorized("Your account has been deactivated");
  }

  const passwordMatch = await user.comparePassword(password);
if (!passwordMatch) {
  throw ApiError.unauthorized(
    "Incorrect password. Please try again."
  );
}

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return { user: user.toPublicJSON(), accessToken, refreshToken };
}

// ── Get current user from token ───────────────────────────────────────────────

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user.toPublicJSON();
}

// ── Forgot password ────────────────────────────────────────────────────────
export async function forgotPassword(email) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Don't reveal whether email exists — always return success message
  if (!user) return;

  const resetToken  = crypto.randomBytes(32).toString("hex");
  const tokenHash   = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expiry      = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  user.passwordResetToken  = tokenHash;
  user.passwordResetExpiry = expiry;
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, user.username, resetToken);
  } catch (err) {
    logger.error("Failed to send password reset email:", err.message);
    // Clear the reset token since we couldn't send the email
    user.passwordResetToken  = null;
    user.passwordResetExpiry = null;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal("Failed to send reset email. Please try again.");
  }
}

// ── Reset password ────────────────────────────────────────────────────────
export async function resetPassword(resetToken, newPassword) {
  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken:  tokenHash,
    passwordResetExpiry: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpiry");

  if (!user) {
    throw ApiError.badRequest("Reset link is invalid or has expired");
  }

  user.passwordHash        = newPassword; // pre-save hook hashes it
  user.passwordResetToken  = null;
  user.passwordResetExpiry = null;
  await user.save();

  return user.toPublicJSON();
}

// ── Refresh token ─────────────────────────────────────────────────────────
export function generateAccessToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
}

export function generateRefreshToken(userId) {
  return jwt.sign(
    { id: userId, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
}

export function setRefreshTokenCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure:   isProduction,
    sameSite: isProduction ? "none" : "lax", // CRUCIAL: "none" allows cross-domain cookies
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
}

export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized("No refresh token");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token — please log in again");
  }

  if (decoded.type !== "refresh") {
    throw ApiError.unauthorized("Invalid token type");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User not found");
  }

  const newAccessToken  = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  return { user: user.toPublicJSON(), accessToken: newAccessToken, refreshToken: newRefreshToken };
}


