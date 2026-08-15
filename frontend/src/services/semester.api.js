import api from "./api.js";

/**
 * Unwraps backend response envelope safely.
 * Handles both response formats:
 * 1. Express Envelope: { success: true, message: "...", data: { ... } }
 * 2. Raw JSON payload: { ... }
 */
const unwrap = (res) => {
  if (!res) return res;
  
  // If `res` is already the backend JSON body (via Axios response interceptor)
  if (typeof res === "object" && res !== null && "data" in res) {
    return res.data;
  }
  
  return res;
};

export async function apiGetSemesters(branch) {
  const res = await api.get(`/semesters/${branch}`);
  return unwrap(res); // { semesters: [...], cgpa }
}

export async function apiSaveSemester(branch, semNumber, payload) {
  const res = await api.post(`/semesters/${branch}/${semNumber}`, payload);
  return unwrap(res); // { semester, cgpa }
}

export async function apiSaveQuickSgpa(branch, semNumber, sgpa, credits) {
  const res = await api.post(`/semesters/${branch}/${semNumber}/quick`, { sgpa, credits });
  return unwrap(res); // { semester, cgpa }
}

export async function apiDeleteSemester(branch, semNumber) {
  const res = await api.delete(`/semesters/${branch}/${semNumber}`);
  return unwrap(res);
}

export async function apiToggleBacklog(branch, semNumber, subjectCode) {
  const res = await api.put(`/semesters/${branch}/${semNumber}/backlog`, { subjectCode });
  return unwrap(res); // { backlogs: [...] }
}

export async function apiUpdateElective(branch, semNumber, subjectCode, name) {
  const res = await api.put(`/semesters/${branch}/${semNumber}/elective`, { subjectCode, name });
  return unwrap(res); // { electiveNames: [...] }
}

export async function apiAddCustomSubject(branch, semNumber, subject) {
  const res = await api.post(`/semesters/${branch}/${semNumber}/custom-subjects`, subject);
  return unwrap(res); // { customSubjects: [...] }
}

export async function apiRemoveCustomSubject(branch, semNumber, code) {
  const res = await api.delete(`/semesters/${branch}/${semNumber}/custom-subjects/${encodeURIComponent(code)}`);
  return unwrap(res); // { customSubjects: [...] }
}

export async function apiToggleSubjectVisibility(branch, semNumber, code, hidden) {
  const res = await api.patch(`/semesters/${branch}/${semNumber}/subjects/${encodeURIComponent(code)}/visibility`, { hidden });
  return unwrap(res); // { hiddenSubjects: [...] }
}