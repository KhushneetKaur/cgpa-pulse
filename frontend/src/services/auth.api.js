import api from "./api.js";

function unwrapApiData(res) {
  if (res?.data?.data) return res.data.data;
  if (res?.data && (res.success !== undefined || res.statusCode)) return res.data;
  if (res?.data?.user) return res.data;
  return res;
}

export async function apiSignup({ username, email, password }) {
  const res = await api.post("/auth/signup", { username, email, password });
  return unwrapApiData(res); // { user }
}

export async function apiLogin({ identifier, password }) {
  const res = await api.post("/auth/login", { identifier, password });
  const data = unwrapApiData(res);
  return data.user;
}

export async function apiLogout() {
  await api.post("/auth/logout");
}

export async function apiGetMe(signal) {
  const res = await api.get("/auth/me", { signal });
  const data = unwrapApiData(res);
  return data.user;
}

export async function apiVerifyOTP(userId, otp) {
  const res = await api.post("/auth/verify-otp", { userId, otp });
  const data = unwrapApiData(res);
  return data.user;
}

export async function apiResendOTP(userId) {
  await api.post("/auth/resend-otp", { userId });
}

export async function apiForgotPassword(email) {
  await api.post("/auth/forgot-password", { email });
}

export async function apiResetPassword(token, password) {
  const res = await api.post("/auth/reset-password", { token, password });
  const data = unwrapApiData(res);
  return data.user;
}

export async function apiRefreshToken() {
  const res = await api.post("/auth/refresh");
  const data = unwrapApiData(res);
  return data.user;
}