import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";

// ── Google OAuth Authenticator ────────────────────────────────────────────────

export async function googleAuth(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw ApiError.unauthorized("Invalid Google token");

  const { id: googleId, email, name } = await response.json();

  let user = await User.findOne({
    $or: [{ googleId }, { email: email.toLowerCase() }],
  });

  const isNewUser = !user;
  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save({ validateBeforeSave: false });
    }
  } else {
    const baseUsername = (name || email.split("@")[0])
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 25) || "user";

    let username = baseUsername;
    let counter = 1;
    let created = false;

    // Retry block handles race conditions if 2 users get identical base usernames simultaneously
    while (!created) {
      try {
        user = await User.create({
          username,
          email: email.toLowerCase(),
          googleId,
          passwordHash: crypto.randomBytes(32).toString("hex"),
          isEmailVerified: true,
          hasSetPassword: false,
          role: "student",
        });
        created = true;
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.username) {
          username = `${baseUsername}${counter++}`;
        } else {
          throw err;
        }
      }
    }
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const jwtAccess = generateAccessToken(user._id);
  const jwtRefresh = generateRefreshToken(user._id);

  return { user: user.toPublicJSON(), accessToken: jwtAccess, refreshToken: jwtRefresh, isNewUser };
}

// ── Set JWT as httpOnly cookie ────────────────────────────────────────────────

export function setTokenCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function setRefreshTokenCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// ── Clear cookie on logout ────────────────────────────────────────────────────

export function clearTokenCookie(res) {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
  };

  res.cookie("token", "", cookieOptions);
  res.cookie("refreshToken", "", cookieOptions);
}

// ── Signup ───────────────────────────────────────────────────────────

export async function registerUser({ username, email, password }) {
  const cleanUsername = username.trim();
  const cleanEmail = email.toLowerCase().trim();

  const existingUsername = await User.findOne({ username: cleanUsername });
  if (existingUsername) throw ApiError.conflict("Username is already taken");

  const existingEmail = await User.findOne({ email: cleanEmail });
  if (existingEmail) throw ApiError.conflict("An account with this email already exists");

  const user = await User.create({
    username: cleanUsername,
    email: cleanEmail,
    passwordHash: password,
    role: "student",
    isEmailVerified: true,
    hasSetPassword: true,
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return { user: user.toPublicJSON(), accessToken, refreshToken, isNewUser: true };
}

// ── Login ────────────────────────────────────────────────────────────

export async function loginUser({ identifier, password }) {
  const isEmail = identifier.includes("@");

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

  if (!user.hasSetPassword) {
    throw ApiError.badRequest(
      "This account was created with Google Sign-In. Please use the 'Continue with Google' button to log in."
    );
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    throw ApiError.unauthorized("Incorrect password. Please try again.");
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return { user: user.toPublicJSON(), accessToken, refreshToken };
}

// ── Get Current User ─────────────────────────────────────────────────────────

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user.toPublicJSON();
}

// ── Refresh Tokens ───────────────────────────────────────────────────────────

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

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  return { user: user.toPublicJSON(), accessToken: newAccessToken, refreshToken: newRefreshToken };
}