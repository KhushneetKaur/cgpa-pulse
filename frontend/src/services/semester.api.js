import api from "./api.js";

/**
 * Normalizes response payloads from Axios / ApiResponse wrappers
 */
const unwrap = (res) => res.data?.data ?? res.data;

// ── GET /api/semesters/:branch ────────────────────────────────────────────────
// Returns all semesters + calculated CGPA for a branch
export async function apiGetSemesters(branch) {
  const res = await api.get(`/semesters/${branch}`);
  return unwrap(res); // { semesters, cgpa }
}

// ── GET /api/semesters/:branch/:semNumber ─────────────────────────────────────
export async function apiGetSemester(branch, semNumber) {
  const res = await api.get(`/semesters/${branch}/${semNumber}`);
  const payload = unwrap(res);
  return payload.semester ?? payload;
}

// ── POST /api/semesters/:branch/:semNumber ────────────────────────────────────
// Full detailed marks save
export async function apiSaveSemester(branch, semNumber, payload) {
  const res = await api.post(
    `/semesters/${branch}/${semNumber}`,
    payload
  );
  return unwrap(res); // { semester, cgpa }
}

// ── POST /api/semesters/:branch/:semNumber/quick ──────────────────────────────
// Quick SGPA save
export async function apiSaveQuickSgpa(branch, semNumber, sgpa, credits) {
  const res = await api.post(
    `/semesters/${branch}/${semNumber}/quick`,
    { sgpa, credits }
  );
  return unwrap(res); // { semester, cgpa }
}

// ── DELETE /api/semesters/:branch/:semNumber ──────────────────────────────────
export async function apiDeleteSemester(branch, semNumber) {
  const res = await api.delete(`/semesters/${branch}/${semNumber}`);
  return unwrap(res);
}

// ── PUT /api/semesters/:branch/:semNumber/backlog ─────────────────────────────
export async function apiToggleBacklog(branch, semNumber, subjectCode) {
  const res = await api.put(
    `/semesters/${branch}/${semNumber}/backlog`,
    { subjectCode }
  );
  const payload = unwrap(res);
  return payload.backlogs ?? payload;
}

// ── PUT /api/semesters/:branch/:semNumber/elective ────────────────────────────
export async function apiUpdateElective(branch, semNumber, subjectCode, name) {
  const res = await api.put(
    `/semesters/${branch}/${semNumber}/elective`,
    { subjectCode, name }
  );
  const payload = unwrap(res);
  return payload.electiveNames ?? payload;
}

// ── POST /api/semesters/:branch/:semNumber/custom-subjects ────────────────────
export async function apiAddCustomSubject(branch, semNumber, subject) {
  const res = await api.post(
    `/semesters/${branch}/${semNumber}/custom-subjects`,
    subject
  );
  return unwrap(res);
}

// ── DELETE /api/semesters/:branch/:semNumber/custom-subjects/:code ────────────
export async function apiRemoveCustomSubject(branch, semNumber, code) {
  const res = await api.delete(
    `/semesters/${branch}/${semNumber}/custom-subjects/${encodeURIComponent(code)}`
  );
  return unwrap(res);
}

// ── PATCH /api/semesters/:branch/:semNumber/subjects/:code/visibility ─────────
export async function apiToggleSubjectVisibility(branch, semNumber, code, hidden) {
  const res = await api.patch(
    `/semesters/${branch}/${semNumber}/subjects/${encodeURIComponent(code)}/visibility`,
    { hidden }
  );
  return unwrap(res);
}