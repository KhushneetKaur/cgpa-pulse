import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { sendResponse } from "../utils/ApiResponse.js";
import {
  upsertLeaderboardEntry,
  removeLeaderboardEntry,
} from "../services/leaderboard.service.js";
import {
  getUserSemesters,
  calculateCGPA,
} from "../services/semester.service.js";

// Helper to calculate days passed
const getDaysSince = (date) => {
  if (!date) return Infinity;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
};

// ── GET /api/user/profile ─────────────────────────────────────────────────────
export async function getProfile(req, res, next) {
  try {
    sendResponse(res, 200, { user: req.user.toPublicJSON() }, "Profile fetched");
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/user/username ───────────────────────────────────────────────────
export async function updateUsername(req, res, next) {
  try {
    const rawUsername = req.body?.username;
    if (!rawUsername || typeof rawUsername !== "string" || !rawUsername.trim()) {
      throw ApiError.badRequest("Valid username is required");
    }

    const username = rawUsername.trim();
    const userId = req.user._id.toString();
    const user = await User.findById(userId);

    if (!user) throw ApiError.notFound("User not found");

    // Check 30-day cooldown
    const daysSince = getDaysSince(user.usernameSetAt);
    if (daysSince < 30) {
      const daysLeft = 30 - daysSince;
      throw ApiError.badRequest(
        `You can change your username in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
      );
    }

    // Check uniqueness (case-insensitive check is recommended)
    const existing = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
      _id: { $ne: userId },
    });
    if (existing) throw ApiError.conflict("Username is already taken");

    user.username = username;
    user.usernameSetAt = new Date();
    await user.save();

    // Sync updated username to leaderboard if opted in
    if (user.lbOptIn && user.branch) {
      const allSems = await getUserSemesters(userId, user.branch);
      const cgpa = calculateCGPA(allSems);
      if (cgpa != null) {
        await upsertLeaderboardEntry({
          userId,
          username: user.username,
          branch: user.branch,
          cgpa,
          semCount: allSems.filter((s) => s.sgpa).length,
        });
      }
    }

    sendResponse(res, 200, { user: user.toPublicJSON() }, "Username updated");
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/user/branch ──────────────────────────────────────────────────────
export async function updateBranch(req, res, next) {
  try {
    const { branch } = req.body;
    if (!branch || typeof branch !== "string") {
      throw ApiError.badRequest("Branch is required");
    }

    const userId = req.user._id.toString();
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { branch } },
      { new: true, runValidators: true }
    );

    if (!user) throw ApiError.notFound("User not found");

    // Sync new branch to leaderboard if opted in
    if (user.lbOptIn) {
      const allSems = await getUserSemesters(userId, user.branch);
      const cgpa = calculateCGPA(allSems);
      if (cgpa != null) {
        await upsertLeaderboardEntry({
          userId,
          username: user.username,
          branch: user.branch,
          cgpa,
          semCount: allSems.filter((s) => s.sgpa).length,
        });
      }
    }

    sendResponse(res, 200, { branch: user.branch }, "Branch updated");
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/user/leaderboard ─────────────────────────────────────────────────
export async function updateLbOptIn(req, res, next) {
  try {
    const { optIn } = req.body;
    if (typeof optIn !== "boolean") {
      throw ApiError.badRequest("optIn must be a boolean value");
    }

    const userId = req.user._id.toString();
    const user = await User.findById(userId);

    if (!user) throw ApiError.notFound("User not found");

    // Opting OUT — check 30-day lock
    if (!optIn && user.lbOptIn) {
      const daysSinceOptIn = getDaysSince(user.lbOptInDate);

      if (daysSinceOptIn < 30) {
        const daysLeft = 30 - daysSinceOptIn;
        throw ApiError.badRequest(
          `You can opt out in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
        );
      }

      // Remove row from leaderboard database immediately
      await removeLeaderboardEntry(userId);
    }

    // Opting IN — add or update row in leaderboard database immediately
    if (optIn && !user.lbOptIn) {
      user.lbOptInDate = new Date();

      if (user.branch) {
        const allSems = await getUserSemesters(userId, user.branch);
        const cgpa = calculateCGPA(allSems);

        if (cgpa != null) {
          await upsertLeaderboardEntry({
            userId,
            username: user.username,
            branch: user.branch,
            cgpa,
            semCount: allSems.filter((s) => s.sgpa).length,
          });
        }
      }
    }

    user.lbOptIn = optIn;
    await user.save();

    sendResponse(
      res,
      200,
      { user: user.toPublicJSON() },
      "Leaderboard preference updated"
    );
  } catch (err) {
    next(err);
  }
}