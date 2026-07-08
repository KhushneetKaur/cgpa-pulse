import {
  registerUser,
  loginUser,
  getCurrentUser,
  setTokenCookie,
  setRefreshTokenCookie,
  clearTokenCookie,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
} from "../services/auth.service.js";
import { sendResponse } from "../utils/ApiResponse.js";


// ── POST /api/auth/signup ─────────────────────────────────────────────────────

export async function signup(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const { pendingSignup } = await registerUser({
      username, email, password,
    });

    sendResponse(
      res,
      201,
      { pendingSignup },
      "OTP sent. Verify within 5 minutes to create your account"
    );
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
    setRefreshTokenCookie(res,refreshToken);
    sendResponse(res, 200, { user }, "Login successful");

  } catch (err) {
    if (err.message === "EMAIL_NOT_VERIFIED" || err.message === "ACCOUNT_NOT_VERIFIED") {
      return res.status(403).json({
        success: false,
        message: "ACCOUNT_NOT_VERIFIED",
        code:    "ACCOUNT_NOT_VERIFIED",
      });
    }
    next(err);
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

export async function logout(req, res, next) {
  try {
    clearTokenCookie(res);
    res.clearCookie("refreshToken");
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
    sendResponse(res, 200, { user }, "User fetched");
  } catch (err) {
    next(err);
  }
}
// POST /api/auth/verify-otp
export async function verifyEmailOTP(req, res, next) {
  try {
    const { userId, otp } = req.body;
    const user = await verifyOTP(userId, otp);
    sendResponse(res, 200, { user }, "Email verified successfully");
  } catch (err) { next(err); }
}
// POST /api/auth/resend-otp
export async function resendOTP(req, res, next) {
  try {
    const { userId } = req.body;
    await sendOTP(userId);
    sendResponse(res, 200, null, "OTP sent");
  } catch (err) { next(err); }
}

// POST /api/auth/forgot-password
export async function forgotPasswordHandler(req, res, next) {
  try {
    await forgotPassword(req.body.email);
    // Always return success — don't reveal if email exists
    sendResponse(res, 200, null,
      "If that email is registered, a reset link has been sent"
    );
  } catch (err) { next(err); }
}
// POST /api/auth/reset-password
export async function resetPasswordHandler(req, res, next) {
  try {
    const { token, password } = req.body;
    const user = await resetPassword(token, password);
    sendResponse(res, 200, { user }, "Password reset successfully");
  } catch (err) { next(err); }
}
// POST /api/auth/refresh
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
    sendResponse(res, 200, { user }, "Token refreshed");
  } catch (err) { next(err); }
}
