import {
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
    const { user, accessToken, refreshToken, isNewUser } = await googleAuth(req.body.credential);
    setTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
    sendResponse(res, isNewUser ? 201 : 200, { user, isNewUser }, "Google sign-in successful");
  } catch (err) { next(err); }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export function logout(req, res, next) {
  try {
    clearTokenCookie(res);
    sendResponse(res, 200, null, "Logged out successfully");
  } catch (err) { next(err); }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export function getMe(req, res, next) {
  try {
    sendResponse(res, 200, { user: req.user.toPublicJSON() }, "User fetched successfully");
  } catch (err) { next(err); }
}

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw ApiError.unauthorized("No refresh token");

    const { user, accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(token);
    setTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, newRefreshToken);
    sendResponse(res, 200, { user }, "Token refreshed successfully");
  } catch (err) { next(err); }
}