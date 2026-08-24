import api from "./api.js";

// ── GET /api/leaderboard ──────────────────────────────────────────────────────
// branch = "ALL" | "CSE" | "ECE" etc.
export async function apiGetLeaderboard(params = {}) {
  const query = typeof params === "string"
    ? { branch: params }      // backwards compat
    : { branch: "ALL", ...params };
  const res = await api.get("/leaderboard", { params: query });
  return unwrap(res);
}

// ── GET /api/leaderboard/stats ────────────────────────────────────────────────
// Admin only
export async function apiGetStats() {
  const res = await api.get("/leaderboard/stats");
  return res.data;   // { branchStats, overall }
}