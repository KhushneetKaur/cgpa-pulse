import User           from "../models/User.js";
import ApiError       from "../utils/ApiError.js";
import { sendResponse } from "../utils/ApiResponse.js";
import {
  upsertLeaderboardEntry,
  removeLeaderboardEntry,
} from "../services/leaderboard.service.js";
import {
  getUserSemesters,
  calculateCGPA,
} from "../services/semester.service.js";

// ── GET /api/user/profile ─────────────────────────────────────────────────────

export async function getProfile(req, res, next) {
  try {
    sendResponse(res, 200, { user: req.user.toPublicJSON() }, "Profile fetched");
  } catch (err) {
    next(err);
  }
}
export async function updateUsername(req, res, next) {
  try {
    const { username } = req.body;
    const user         = await User.findById(req.user._id);

    if (!user) throw ApiError.notFound("User not found");

    // Check 30-day cooldown
    if (user.usernameSetAt) {
      const daysSince = Math.floor(
        (Date.now() - new Date(user.usernameSetAt).getTime())
        / (1000 * 60 * 60 * 24)
      );
      if (daysSince < 30) {
        const daysLeft = 30 - daysSince;
        throw ApiError.badRequest(
          `You can change your username in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
        );
      }
    }

    // Check uniqueness
    const existing = await User.findOne({
      username: username.trim(),
      _id:      { $ne: user._id },
    });
    if (existing) throw ApiError.conflict("Username is already taken");

    user.username      = username.trim();
    user.usernameSetAt = new Date();
    await user.save({ validateBeforeSave: false });

    sendResponse(res, 200, { user: user.toPublicJSON() }, "Username updated");
  } catch (err) { next(err); }
}
// ── PUT /api/user/branch ──────────────────────────────────────────────────────

export async function updateBranch(req, res, next) {
  try {
    const { branch } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { branch } },
      { new: true, runValidators: true }
    );

    sendResponse(res, 200, { branch: user.branch }, "Branch updated");
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/user/leaderboard ─────────────────────────────────────────────────
// Toggle leaderboard opt-in / opt-out

export async function updateLbOptIn(req, res, next) {
  try {
    const { optIn } = req.body;
    const user      = await User.findById(req.user._id);

    if (!user) throw ApiError.notFound("User not found");

    // Opting OUT — check 30-day lock
    if (!optIn && user.lbOptIn) {
      const optInDate = user.lbOptInDate
        ? new Date(user.lbOptInDate)
        : new Date();

      if (optInDate) {
        const daysSinceOptIn = Math.floor(
          (Date.now() - optInDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        console.log(`Days since opt-in: ${daysSinceOptIn}`); // ← add this
  console.log(`lbOptInDate: ${user.lbOptInDate}`);     // ← add this

        if (daysSinceOptIn < 30) {
          const daysLeft = 30 - daysSinceOptIn;
          throw ApiError.badRequest(
            `You can opt out in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
          );
        }
      }
    }

    // Opting IN — record date
    user.lbOptIn = optIn;
    if (optIn) user.lbOptInDate = new Date();

    await user.save({ validateBeforeSave: false });

    sendResponse(res, 200, { user: user.toPublicJSON() }, "Leaderboard preference updated");
  } catch (err) { next(err); }
}