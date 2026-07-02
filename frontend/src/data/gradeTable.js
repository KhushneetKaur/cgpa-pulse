// MRSPTU Official Grade Boundaries — B.Tech Engineering
// A+ = 91–100, A = 81–90, B+ = 71–80, B = 61–70,
// C = 51–60,   D = 46–50, E = 40–45, F = below 40

export const GRADE_TABLE = [
  { min: 91, grade: "A+", points: 10, label: "91–100" },
  { min: 81, grade: "A",  points: 9,  label: "81–90"  },
  { min: 71, grade: "B+", points: 8,  label: "71–80"  },
  { min: 61, grade: "B",  points: 7,  label: "61–70"  },
  { min: 51, grade: "C",  points: 6,  label: "51–60"  },
  { min: 46, grade: "D",  points: 5,  label: "46–50"  },
  { min: 40, grade: "E",  points: 4,  label: "40–45"  },
  { min: 0,  grade: "F",  points: 0,  label: "Below 40" },
];

// Theory subjects:  Internal max = 40, External max = 60
// Lab/Practical:    Internal max = 60, External max = 40
export function getMaxMarks(type) {
  return type === "lab"
    ? { int: 60, ext: 40 }
    : { int: 40, ext: 60 };
}

// Returns the grade object for a given total marks (0–100), or null if invalid
export function getGrade(total) {
  if (total === null || total === undefined || total === "") return null;
  const m = Number(total);
  if (isNaN(m) || m < 0 || m > 100) return null;
  return GRADE_TABLE.find(g => m >= g.min);
}

// Returns a color string based on grade points value
export function gradeColor(points, colors) {
  // colors = { ok, accentTxt, warn, bad }
  if (points >= 9)  return colors.ok;
  if (points >= 7)  return colors.accentTxt;
  if (points >= 4)  return colors.warn;
  return colors.bad;
}

// Given a desired SGPA (e.g. 8.0), return the minimum grade points
// a subject needs to contribute — used in predictor highlighting
// instead of always highlighting A+
export function getTargetGradeForSGPA(desiredSGPA) {
  // Find the lowest grade whose points >= desiredSGPA
  // e.g. desiredSGPA = 8.0 → B+ (8 points) is exactly enough, no need for A or A+
  const match = [...GRADE_TABLE]
    .reverse()  // go from F upward
    .find(g => g.points >= desiredSGPA);
  return match || GRADE_TABLE[0];
}