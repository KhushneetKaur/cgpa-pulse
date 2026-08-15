import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";

// ── Cookie config — single source of truth ────────────────────────────────────
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getCookieOptions(maxAgeMs = MAX_AGE_MS) {
  const isProd = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
  
  return {
    httpOnly: true,
    secure: true, // Always true for modern cross-origin auth
    sameSite: isProd ? "none" : "lax",
    partitioned: isProd ? true : undefined, // Essential for iOS 17+ Safari cross-site cookies
    path: "/",
    maxAge: maxAgeMs,
  };
}

export function setTokenCookie(res, token) {
  res.cookie("accessToken", token, getCookieOptions(15 * 60 * 1000)); // 15 mins
}

export function setRefreshTokenCookie(res, token) {
  res.cookie("refreshToken", token, getCookieOptions(MAX_AGE_MS)); // 30 days
}

export function clearTokenCookie(res) {
  const opts = { ...getCookieOptions(0), expires: new Date(0) };
  res.cookie("accessToken", "", opts);
  res.cookie("refreshToken", "", opts);
}

// ── Token generators ──────────────────────────────────────────────────────────
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
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "30d" }
  );
}

// ── Google OAuth ──────────────────────────────────────────────────────────────
export async function googleAuth(accessToken) {
  const googleRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!googleRes.ok) throw ApiError.unauthorized("Invalid Google token");

  const { id: googleId, email, name } = await googleRes.json();

  let user = await User.findOne({
    $or: [{ googleId }, { email: email.toLowerCase() }],
  });

  const isNewUser = !user;

  if (user) {
    if (!user.googleId) user.googleId = googleId;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
  } else {
    const base = (name || email.split("@")[0])
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 25) || "user";

    let username = base;
    let counter = 1;
    const MAX_RETRIES = 10;

    while (counter <= MAX_RETRIES) {
      try {
        user = await User.create({
          username,
          email: email.toLowerCase(),
          googleId,
          passwordHash: crypto.randomBytes(32).toString("hex"),
          isEmailVerified: true,
          hasSetPassword: false,
          role: "student",
          lastLogin: new Date(),
        });
        break;
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.username) {
          username = `${base}${counter++}`;
        } else {
          throw err;
        }
      }
    }

    if (!user) throw ApiError.internal("Failed to generate a unique username — try again");
  }

  return {
    user: user.toPublicJSON(),
    accessToken: generateAccessToken(user._id),
    refreshToken: generateRefreshToken(user._id),
    isNewUser,
  };
}

// ── Get current user ──────────────────────────────────────────────────────────
export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user.toPublicJSON();
}

// ── Refresh tokens ────────────────────────────────────────────────────────────
export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized("No refresh token");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token — please log in again");
  }

  if (decoded.type !== "refresh") throw ApiError.unauthorized("Invalid token type");

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw ApiError.unauthorized("User not found");

  return {
    user: user.toPublicJSON(),
    accessToken: generateAccessToken(user._id),
    refreshToken: generateRefreshToken(user._id),
  };
}