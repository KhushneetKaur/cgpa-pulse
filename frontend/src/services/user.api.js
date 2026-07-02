import api from "./api.js";

// ── GET /api/user/profile ─────────────────────────────────────────────────────
export async function apiGetProfile() {
  const res = await api.get("/user/profile");
  return res.data.user;
}

// ── PUT /api/user/branch ──────────────────────────────────────────────────────
export async function apiUpdateBranch(branch) {
  const res = await api.put("/user/branch", { branch });
  return res.data.branch;
}

// ── PUT /api/user/leaderboard ─────────────────────────────────────────────────
export async function apiUpdateLbOptIn(optIn) {
  const res = await api.put("/user/leaderboard", { optIn });
  return res.data;
}