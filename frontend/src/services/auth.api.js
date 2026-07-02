import api from "./api.js";

export async function apiSignup({ username, email, password }) {
  const res = await api.post("/auth/signup", { username, email, password });
  console.log("apiSignup raw response:", res);
  return res.data;   // { user }
}

export async function apiLogin({ identifier, password }) {
  const res = await api.post("/auth/login", { identifier, password });
  return res.data.user;
}

export async function apiLogout() {
  await api.post("/auth/logout");
}

export async function apiGetMe() {
  const res = await api.get("/auth/me");
  return res.data.user;
}

export async function apiVerifyOTP(userId, otp) {
  const res = await api.post("/auth/verify-otp", { userId, otp });
  return res.data.user;
}

export async function apiResendOTP(userId) {
  await api.post("/auth/resend-otp", { userId });
}

export async function apiForgotPassword(email) {
  await api.post("/auth/forgot-password", { email });
}

export async function apiResetPassword(token, password) {
  const res = await api.post("/auth/reset-password", { token, password });
  return res.data.user;
}

export async function apiRefreshToken() {
  const res = await api.post("/auth/refresh");
  return res.data.user;
}