import {
  registerUser,
  loginUser,
  getCurrentUser,
  setTokenCookie,
  setRefreshTokenCookie,
  clearTokenCookie,
  refreshAccessToken,
  googleAuth,
} from "../services/auth.service.js";
import { sendResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

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
      { user, isNewUser },
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
    sendResponse(res, 201, { user }, "Account created successfully");
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
    sendResponse(res, 200, { user }, "Login successful");
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
    sendResponse(res, 200, { user }, "Token refreshed successfully");
  } catch (err) {
    next(err);
  }
}