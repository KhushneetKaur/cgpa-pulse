import api from "./api.js";

// ── GET /api/semesters/:branch ────────────────────────────────────────────────
// Returns all semesters + calculated CGPA for a branch
export async function apiGetSemesters(branch) {
  const res = await api.get(`/semesters/${branch}`);
  return res.data;   // { semesters, cgpa }
}

// ── GET /api/semesters/:branch/:semNumber ─────────────────────────────────────
export async function apiGetSemester(branch, semNumber) {
  const res = await api.get(`/semesters/${branch}/${semNumber}`);
  return res.data.semester;
}

// ── POST /api/semesters/:branch/:semNumber ────────────────────────────────────
// Full detailed marks save
export async function apiSaveSemester(branch, semNumber, payload) {
  const res = await api.post(
    `/semesters/${branch}/${semNumber}`,
    payload
  );
  return res.data;   // { semester, cgpa }
}

// ── POST /api/semesters/:branch/:semNumber/quick ──────────────────────────────
// Quick SGPA save
export async function apiSaveQuickSgpa(branch, semNumber, sgpa, credits) {
  const res = await api.post(
    `/semesters/${branch}/${semNumber}/quick`,
    { sgpa, credits }
  );
  return res.data;   // { semester, cgpa }
}

// ── DELETE /api/semesters/:branch/:semNumber ──────────────────────────────────
export async function apiDeleteSemester(branch, semNumber) {
  const res = await api.delete(`/semesters/${branch}/${semNumber}`);
  return res.data;
}

// ── PUT /api/semesters/:branch/:semNumber/backlog ─────────────────────────────
export async function apiToggleBacklog(branch, semNumber, subjectCode) {
  const res = await api.put(
    `/semesters/${branch}/${semNumber}/backlog`,
    { subjectCode }
  );
  return res.data.backlogs;
}

// ── PUT /api/semesters/:branch/:semNumber/elective ────────────────────────────
export async function apiUpdateElective(branch, semNumber, subjectCode, name) {
  const res = await api.put(
    `/semesters/${branch}/${semNumber}/elective`,
    { subjectCode, name }
  );
  return res.data.electiveNames;
}
export async function apiAddCustomSubject(branch, semNumber, subject) {
  const res = await api.post(
    `/semesters/${branch}/${semNumber}/custom-subjects`,
    subject
  );
  return res.data;
}

export async function apiRemoveCustomSubject(branch, semNumber, code) {
  const res = await api.delete(
    `/semesters/${branch}/${semNumber}/custom-subjects/${code}`
  );
  return res.data;
}

export async function apiToggleSubjectVisibility(branch, semNumber, code, hidden) {
  const res = await api.patch(
    `/semesters/${branch}/${semNumber}/subjects/${code}/visibility`,
    { hidden }
  );
  return res.data;
}