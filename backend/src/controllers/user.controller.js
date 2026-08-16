import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { sendResponse } from "../utils/ApiResponse.js";
import { upsertLeaderboardEntry, removeLeaderboardEntry } from "../services/leaderboard.service.js";
import { getUserSemesters, calculateCGPA } from "../services/semester.service.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getDaysSince = (date) =>
  Math.floor((Date.now() - new Date(date).getTime()) / 86400000);

async function syncLeaderboard(user, userId) {
  if (!user.lbOptIn || !user.branch) return;
  const allSems = await getUserSemesters(userId, user.branch) || [];
  await upsertLeaderboardEntry({
    userId,
    username: user.username || "Anonymous",
    branch:   user.branch,
    cgpa:     calculateCGPA(allSems) ?? 0,
    semCount: allSems.filter(s => s.sgpa).length,
  });
}

// ── GET /api/user/profile ─────────────────────────────────────────────────────
export function getProfile(req, res, next) {
  try {
    sendResponse(res, 200, { user: req.user.toPublicJSON() }, "Profile fetched");
  } catch (err) { next(err); }
}

// ── PUT /api/user/username ────────────────────────────────────────────────────
export async function updateUsername(req, res, next) {
  try {
    const username = req.body.username.trim(); // schema already validated
    const userId   = req.user._id.toString();
    const user     = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");

    if (user.usernameSetAt) {
      const daysLeft = 30 - getDaysSince(user.usernameSetAt);
      if (daysLeft > 0)
        throw ApiError.badRequest(
          `You can change your username in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
        );
    }

    // Case-insensitive uniqueness check — consistent with update behaviour
    const existing = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
      _id:      { $ne: userId },
    });
    if (existing) throw ApiError.conflict("Username is already taken");

    user.username      = username;
    user.usernameSetAt = new Date();
    await user.save();
    await syncLeaderboard(user, userId);

    sendResponse(res, 200, { user: user.toPublicJSON() }, "Username updated");
  } catch (err) { next(err); }
}

// ── GET /api/user/check-username ──────────────────────────────────────────────
export async function checkUsername(req, res, next) {
  try {
    const { username } = req.query;
    if (!username) return sendResponse(res, 200, { available: false });

    const base = username.trim();

    // Case-insensitive check — consistent with updateUsername uniqueness check
    const existing  = await User.findOne({ username: { $regex: new RegExp(`^${base}$`, "i") } });
    const available = !existing;

    let suggestions = [];
    if (!available) {
      const candidates = [`${base}_`, `${base}2`, `${base}25`, `${base}_mrsptu`, `${base}cse`];
      const taken      = new Set(
        (await User.find({ username: { $in: candidates } }, "username").lean())
          .map(u => u.username)
      );
      suggestions = candidates.filter(c => !taken.has(c)).slice(0, 3);
    }

    sendResponse(res, 200, { available, suggestions }, "");
  } catch (err) { next(err); }
}

// ── PUT /api/user/branch ──────────────────────────────────────────────────────
export async function updateBranch(req, res, next) {
  try {
    const userId = req.user._id.toString();
    const user   = await User.findByIdAndUpdate(
      userId,
      { $set: { branch: req.body.branch } },
      { new: true, runValidators: true }
    );
    if (!user) throw ApiError.notFound("User not found");
    await syncLeaderboard(user, userId);
    sendResponse(res, 200, { branch: user.branch }, "Branch updated");
  } catch (err) { next(err); }
}

// ── PUT /api/user/current-sem ─────────────────────────────────────────────────
export async function updateCurrentSem(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { currentSem: Number(req.body.semNumber) } },
      { new: true }
    );
    sendResponse(res, 200, { user: user.toPublicJSON() }, "Current semester updated");
  } catch (err) { next(err); }
}

// ── PUT /api/user/leaderboard ─────────────────────────────────────────────────
export async function updateLbOptIn(req, res, next) {
  try {
    const { optIn } = req.body;
    const userId    = req.user._id.toString();
    const user      = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");

    if (!optIn && user.lbOptIn) {
      if (user.lbOptInDate) {
        const daysLeft = 45 - getDaysSince(user.lbOptInDate);
        if (daysLeft > 0)
          throw ApiError.badRequest(
            `You can opt out in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
          );
      }
      await removeLeaderboardEntry(userId);
    }

    if (optIn) {
      user.lbOptInDate = new Date();
      await syncLeaderboard({ ...user.toObject(), lbOptIn: true }, userId);
    }

    user.lbOptIn = optIn;
    await user.save();
    sendResponse(res, 200, { user: user.toPublicJSON() }, "Leaderboard preference updated");
  } catch (err) { next(err); }
}

// ── POST /api/user/app-install ────────────────────────────────────────────────
export async function recordAppInstall(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { appInstalled: true, appInstalledAt: new Date(), appInstalledOn: req.body.platform } },
      { new: true }
    );
    sendResponse(res, 200, { user: user.toPublicJSON() }, "Install recorded");
  } catch (err) { next(err); }
}