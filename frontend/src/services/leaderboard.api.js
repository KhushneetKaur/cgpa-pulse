import api from "./api.js";

// Helper function to extract response data safely
const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

// ── GET /api/leaderboard ──────────────────────────────────────────────────────
// branch = "ALL" | "CSE" | "ECE" etc.
export async function apiGetLeaderboard(params = {}) {
  const query = typeof params === "string"
    ? { branch: params, limit: "all" } // backwards compat with unlimited default
    : { branch: "ALL", limit: "all", ...params }; // default limit set to "all"

  const res = await api.get("/leaderboard", { params: query });
  return unwrap(res);
}

// ── GET /api/leaderboard/stats ────────────────────────────────────────────────
// Admin only
export async function apiGetStats() {
  const res = await api.get("/leaderboard/stats");
  return res.data;   // { branchStats, overall }
}