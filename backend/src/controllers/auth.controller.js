import {
  registerUser,
  loginUser,
  getCurrentUser,
  setTokenCookie,
  setRefreshTokenCookie,
  clearTokenCookie,
  refreshAccessToken,
  googleAuth,
  generateAccessToken,
  generateRefreshToken,
} from "../services/auth.service.js";
import { sendResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import TokenRecord from "../models/TokenRecord.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/mailer.js";

// ── POST /api/auth/google ─────────────────────────────────────────────────────


export async function googleSignIn(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) throw ApiError.badRequest("No Google credential provided");

    const { user, accessToken, refreshToken, isNewUser } = await googleAuth(credential);
    setTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
    
    sendResponse(
      res,
      isNewUser ? 201 : 200,
      { user, isNewUser, accessToken }, // 👈 Added accessToken for mobile/iOS fallback
      "Google sign-in successful"
    );
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────

export async function signup(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const { user, accessToken, refreshToken } = await registerUser({
      username,
      email,
      password,
    });
    
    setTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
    sendResponse(res, 201, { user, accessToken }, "Account created successfully"); // 👈 Added accessToken
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUser({ identifier, password });
    
    setTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
    sendResponse(res, 200, { user, accessToken }, "Login successful"); // 👈 Added accessToken
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

export async function logout(req, res, next) {
  try {
    // clearTokenCookie clears both 'token' and 'refreshToken' with matching domain/secure attributes
    clearTokenCookie(res);
    sendResponse(res, 200, null, "Logged out successfully");
  } catch (err) {
    next(err);
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Returns current logged-in user — used on app load to restore session

export async function getMe(req, res, next) {
  try {
    // req.user is attached by protect middleware
    const user = await getCurrentUser(req.user._id);
    sendResponse(res, 200, { user }, "User fetched successfully");
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/refresh ───────────────────────────────────────────────────

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const {
      user,
      accessToken,
      refreshToken: newRefreshToken,
    } = await refreshAccessToken(refreshToken);
    
    setTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, newRefreshToken);
    sendResponse(res, 200, { user, accessToken }, "Token refreshed successfully"); // 👈 Added accessToken
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/check-email ───────────────────────────────────────────────

export async function checkEmail(req, res, next) {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return sendResponse(res, 200, { exists: false, hasSetPassword: false, isGoogleOnly: false }, "Email available");
    }
    
    return sendResponse(res, 200, {
      exists: true,
      hasSetPassword: user.hasSetPassword,
      isGoogleOnly: !user.hasSetPassword && !!user.googleId,
    }, "Email checked");
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/send-otp ──────────────────────────────────────────────────

export async function sendOTP(req, res, next) {
  try {
    const { email, intent, username, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    
    // For signup: Check if email or username is already taken
    if (intent === "signup") {
      const existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, { username: username?.trim() }]
      });
      if (existingUser) {
        throw ApiError.conflict("Username or Email is already taken");
      }
    }
    
    // For login: Check password first
    let userId = null;
    if (intent === "login") {
      const user = await User.findOne({ email: cleanEmail }).select("+passwordHash");
      if (!user) throw ApiError.unauthorized("No account found");
      if (!user.isActive) throw ApiError.unauthorized("Account deactivated");
      if (!user.hasSetPassword) throw ApiError.badRequest("Please use Google Sign-In");
      
      const passwordMatch = await user.comparePassword(password);
      if (!passwordMatch) throw ApiError.unauthorized("Incorrect password");
      
      userId = user._id;
    }
    
    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const tokenId = crypto.randomUUID();
    
    // Create token record
    await TokenRecord.create({
      tokenId,
      type: "otp",
      otpHash,
      intent,
      payload: intent === "signup" ? {
        email: cleanEmail,
        username: username?.trim(),
        password // Will be hashed via pre-save hook on User later
      } : { userId }
    });
    
    // Send email
    await sendOTPEmail(cleanEmail, otp);
    
    sendResponse(res, 200, { otpId: tokenId }, "OTP sent successfully");
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/verify-otp ────────────────────────────────────────────────

export async function verifyOTP(req, res, next) {
  try {
    const { otpId, otp } = req.body;
    
    const record = await TokenRecord.findOne({ tokenId: otpId, type: "otp" }).select("+otpHash");
    if (!record) {
      throw ApiError.unauthorized("OTP has expired or is invalid. Please request a new one.");
    }
    
    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      throw ApiError.unauthorized("Invalid OTP code.");
    }
    
    // Delete OTP record since it's verified
    await TokenRecord.deleteOne({ _id: record._id });
    
    let user;
    if (record.intent === "signup") {
      const { email, username, password } = record.payload;
      
      // Double check availability
      const existing = await User.findOne({ $or: [{ email }, { username }] });
      if (existing) throw ApiError.conflict("Username or Email was taken during verification");
      
      user = await User.create({
        email,
        username,
        passwordHash: password, // Pre-save hook hashes it
        hasSetPassword: true,
        role: "student",
        isEmailVerified: true
      });
    } else if (record.intent === "login") {
      user = await User.findById(record.payload.userId);
      if (!user) throw ApiError.unauthorized("User not found");
      
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    }
    
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    setTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
    
    sendResponse(res, record.intent === "signup" ? 201 : 200, { user: user.toPublicJSON(), accessToken }, "Successfully verified and logged in");
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/forgot-password ───────────────────────────────────────────

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ email: cleanEmail });
    if (user && user.hasSetPassword) {
      const tokenId = crypto.randomUUID();
      
      await TokenRecord.create({
        tokenId,
        type: "reset",
        payload: { userId: user._id }
      });
      
      const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${tokenId}`;
      await sendPasswordResetEmail(cleanEmail, resetLink);
    }
    
    // Always return 200 to prevent user enumeration
    sendResponse(res, 200, null, "If an account exists, a reset link was sent.");
  } catch (err) {
    next(err);
  }
}

// ── GET /api/auth/validate-reset-token ───────────────────────────────────────

export async function validateResetToken(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) throw ApiError.badRequest("Token required");
    
    const record = await TokenRecord.findOne({ tokenId: token, type: "reset" });
    if (!record) {
      return sendResponse(res, 200, { valid: false }, "Token invalid or expired");
    }
    
    // Optionally fetch user email to display on the reset page
    const user = await User.findById(record.payload.userId);
    return sendResponse(res, 200, { valid: true, email: user?.email }, "Token valid");
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/reset-password ────────────────────────────────────────────

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    
    const record = await TokenRecord.findOne({ tokenId: token, type: "reset" });
    if (!record) {
      throw ApiError.unauthorized("Reset link has expired or is invalid.");
    }
    
    const user = await User.findById(record.payload.userId);
    if (!user) throw ApiError.notFound("User not found");
    
    user.passwordHash = newPassword; // Pre-save hook hashes it
    user.hasSetPassword = true; // In case they previously only had Google auth but somehow triggered this
    await user.save();
    
    await TokenRecord.deleteOne({ _id: record._id });
    
    sendResponse(res, 200, null, "Password reset successfully. You can now log in.");
  } catch (err) {
    next(err);
  }
}