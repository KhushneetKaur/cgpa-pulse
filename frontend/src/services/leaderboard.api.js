import api from "./api.js";

// ── GET /api/leaderboard ──────────────────────────────────────────────────────
// branch = "ALL" | "CSE" | "ECE" etc.
export async function apiGetLeaderboard(branch = "ALL", limit = 50) {
  const res = await api.get("/leaderboard", {
    params: { branch, limit },
  });
  return res.data;   // { entries, myRank, total }
}

// ── GET /api/leaderboard/stats ────────────────────────────────────────────────
// Admin only
export async function apiGetStats() {
  const res = await api.get("/leaderboard/stats");
  return res.data;   // { branchStats, overall }
}