import api from "./api.js";

function unwrapApiData(res) {
  return res?.data?.data ?? res?.data ?? res;
}

export async function apiGoogleSignIn(credential) {
  const res = await api.post("/auth/google", { credential });
  return res.data.user;
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
