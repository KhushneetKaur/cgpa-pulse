import api from "./api.js";

function unwrapApiData(res) {
  return res?.data?.data ?? res?.data ?? res;
}

export async function apiGoogleSignIn(credential) {
  const res = await api.post("/auth/google", { credential });
  return res.data;
}

export async function apiSignup({ username, email, password }) {
  const res = await api.post("/auth/signup", { username, email, password }, { timeout: 45000 });
  const data = unwrapApiData(res);
  return data.user;
}

export async function apiLogin({ identifier, password }) {
  const res = await api.post("/auth/login", { identifier, password }, { timeout: 45000 });
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


export async function apiRefreshToken() {
  const res = await api.post("/auth/refresh");
  const data = unwrapApiData(res);
  return data.user;
}

export async function apiCheckEmail(email) {
  const res = await api.post("/auth/check-email", { email });
  return unwrapApiData(res);
}

export async function apiSendOTP(payload) {
  const res = await api.post("/auth/send-otp", payload);
  return unwrapApiData(res);
}

export async function apiVerifyOTP(otpId, otp) {
  const res = await api.post("/auth/verify-otp", { otpId, otp });
  return unwrapApiData(res);
}

export async function apiForgotPassword(email) {
  const res = await api.post("/auth/forgot-password", { email });
  return unwrapApiData(res);
}

export async function apiValidateResetToken(token) {
  const res = await api.get(`/auth/validate-reset-token?token=${token}`);
  return unwrapApiData(res);
}

export async function apiResetPassword(token, newPassword) {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return unwrapApiData(res);
}
