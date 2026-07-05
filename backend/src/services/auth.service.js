import jwt  from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";
import { logger } from "../config/logger.js";
import {
  sendVerificationOTP,
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
  // Check if username already taken
  const existingUsername = await User.findOne({
    username: username.trim(),
  });
  if (existingUsername) {
    throw ApiError.conflict("Username is already taken");
  }

  // Check if email already registered
  const existingEmail = await User.findOne({
    email: email.toLowerCase().trim(),
  });
  if (existingEmail) {
    throw ApiError.conflict("An account with this email already exists");
  }

  // Create user — pre-save hook in User model hashes the password
  const user = await User.create({
    username:     username.trim(),
    email:        email.toLowerCase().trim(),
    passwordHash: password,   // gets hashed by pre-save hook
    role:         "student",
  });

  try {
    await sendOTP(user._id);
  } catch (err) {
    logger.error("Failed to send OTP during signup:", err.message);
    // Delete the user since we couldn't send OTP
    await User.findByIdAndDelete(user._id);
    throw ApiError.internal("Failed to send verification email. Please try again.");
  }

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

  if (!user.isEmailVerified) {
    throw ApiError.forbidden("ACCOUNT_NOT_VERIFIED");
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


// ── Generate 6-digit OTP ──────────────────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Send OTP after signup ─────────────────────────────────────────────────────
export async function sendOTP(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  if (user.isEmailVerified) throw ApiError.badRequest("Email already verified");

  const otp    = generateOTP();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.emailOTP       = otp;
  user.emailOTPExpiry = expiry;
  await user.save({ validateBeforeSave: false });

  await sendVerificationOTP(user.email, user.username, otp);
}

// ── Verify OTP ──────────────────────────────────────────────────────────
export async function verifyOTP(userId, otp) {
  const user = await User.findById(userId).select("+emailOTP +emailOTPExpiry");
  if (!user) throw ApiError.notFound("User not found");

  if (user.isEmailVerified) {
    throw ApiError.badRequest("Email already verified");
  }
  if (!user.emailOTP || !user.emailOTPExpiry) {
    throw ApiError.badRequest("No OTP found — request a new one");
  }
  if (new Date() > user.emailOTPExpiry) {
    throw ApiError.badRequest("OTP expired — request a new one");
  }
  if (user.emailOTP !== otp.trim()) {
    throw ApiError.badRequest("Incorrect OTP");
  }

  user.isEmailVerified = true;
  user.emailOTP        = null;
  user.emailOTPExpiry  = null;
  await user.save({ validateBeforeSave: false });

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
