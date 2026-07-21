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

const getDaysSince = (date) => {
  if (!date) return null; // 👈 Return null instead of Infinity when date is absent
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

    // Only enforce the 30-day rule if usernameSetAt exists (i.e. they've changed it before)
    if (user.usernameSetAt) {
      const daysSince = getDaysSince(user.usernameSetAt);
      if (daysSince !== null && daysSince < 30) {
        const daysLeft = 30 - daysSince;
        throw ApiError.badRequest(
          `You can change your username in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
        );
      }
    }

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
      const allSems = (await getUserSemesters(userId, user.branch)) || [];
      const computedCgpa = calculateCGPA(allSems);
      const cgpa = computedCgpa ?? user.cgpa ?? 0;

      await upsertLeaderboardEntry({
        userId,
        username: user.username,
        branch: user.branch,
        cgpa,
        semCount: allSems.filter((s) => s.sgpa).length,
      });
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
      const allSems = (await getUserSemesters(userId, user.branch)) || [];
      const computedCgpa = calculateCGPA(allSems);
      const cgpa = computedCgpa ?? user.cgpa ?? 0;

      await upsertLeaderboardEntry({
        userId,
        username: user.username || user.name || "Anonymous",
        branch: user.branch,
        cgpa,
        semCount: allSems.filter((s) => s.sgpa).length,
      });
    }

    sendResponse(res, 200, { branch: user.branch }, "Branch updated");
  } catch (err) {
    next(err);
  }
}

export async function updateCurrentSem(req, res, next) {
  try {
    const { semNumber } = req.body;
    if (!semNumber || semNumber < 1 || semNumber > 8) {
      throw ApiError.badRequest("Semester must be between 1 and 8");
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { currentSem: Number(semNumber) } },
      { new: true }
    );
    sendResponse(res, 200, { user: user.toPublicJSON() }, "Current semester updated");
  } catch (err) { next(err); }
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
      if (user.lbOptInDate) {
        const daysSinceOptIn = getDaysSince(user.lbOptInDate);

        if (daysSinceOptIn !== null && daysSinceOptIn < 30) {
          const daysLeft = 30 - daysSinceOptIn;
          throw ApiError.badRequest(
            `You can opt out in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
          );
        }
      }

      await removeLeaderboardEntry(userId);
    }

    // Opting IN — immediately calculate CGPA and insert entry
    if (optIn) {
      user.lbOptInDate = new Date();

      if (user.branch) {
        const allSems = (await getUserSemesters(userId, user.branch)) || [];
        const computedCgpa = calculateCGPA(allSems);
        const cgpa = computedCgpa ?? user.cgpa ?? 0;

        await upsertLeaderboardEntry({
          userId,
          username: user.username || user.name || "Anonymous",
          branch: user.branch,
          cgpa,
          semCount: allSems.filter((s) => s.sgpa).length,
        });
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