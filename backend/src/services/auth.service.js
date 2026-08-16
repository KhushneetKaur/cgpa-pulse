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
  // 1. Fetch Google User Info with a strict 5-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let googleRes;
  try {
    googleRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw ApiError.badRequest("Google auth timed out — please try again");
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!googleRes.ok) throw ApiError.unauthorized("Invalid Google token");

  const { id: googleId, email, name } = await googleRes.json();
  const normalizedEmail = email.toLowerCase();

  // 2. Fast lookup by email first, fallback to googleId
  let user = await User.findOne({ email: normalizedEmail }).lean();
  if (!user && googleId) {
    user = await User.findOne({ googleId }).lean();
  }

  const isNewUser = !user;

  if (user) {
    // 3. Fire-and-forget non-blocking background update for lastLogin/googleId
    User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date(),
          ...(user.googleId ? {} : { googleId }) 
        } 
      }
    ).catch(err => console.error("Background user update error:", err));
  } else {
    // 4. Fast single-shot username generation
    const base = (name || normalizedEmail.split("@")[0])
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 15) || "user";

    const randomSuffix = crypto.randomInt(1000, 9999);
    const username = `${base.slice(0, 10)}_${randomSuffix}`;

    user = await User.create({
      username,
      email: normalizedEmail,
      googleId,
      passwordHash: crypto.randomBytes(16).toString("hex"),
      isEmailVerified: true,
      hasSetPassword: false,
      role: "student",
      lastLogin: new Date(),
    });
  }

  const userId = user._id;

  return {
    user: typeof user.toPublicJSON === "function" ? user.toPublicJSON() : user,
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
    isNewUser,
  };
}

// ── Get current user ──────────────────────────────────────────────────────────
export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return typeof user.toPublicJSON === "function" ? user.toPublicJSON() : user;
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

  // Fast lean lookup
  const user = await User.findById(decoded.id).lean();
  if (!user || !user.isActive) throw ApiError.unauthorized("User not found");

  return {
    user: typeof user.toPublicJSON === "function" ? user.toPublicJSON() : user,
    accessToken: generateAccessToken(user._id),
    refreshToken: generateRefreshToken(user._id),
  };
}