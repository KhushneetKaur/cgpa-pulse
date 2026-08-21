// ── Engineering — MRSPTU B.Tech official grade boundaries ────────────────────
export const ENGINEERING_GRADES = [
  { min: 91, grade: "A+", points: 10, label: "91–100" },
  { min: 81, grade: "A",  points: 9,  label: "81–90"  },
  { min: 71, grade: "B+", points: 8,  label: "71–80"  },
  { min: 61, grade: "B",  points: 7,  label: "61–70"  },
  { min: 51, grade: "C",  points: 6,  label: "51–60"  },
  { min: 46, grade: "D",  points: 5,  label: "46–50"  },
  { min: 40, grade: "E",  points: 4,  label: "40–45"  },
  { min: 0,  grade: "F",  points: 0,  label: "Below 40" },
];

// ── Pharmacy — PCI Official (Table-XII, B.Pharm CBCS Syllabus) ────────────────
// Source: PCI Rules & Syllabus for B.Pharm, Regulation 6,7&8 (2014), Table-XII
// Grades: O, A, B, C, D, F — NO A+ or B+
// Boundaries are PERCENTAGE of total marks (not raw marks)
// Pass: ≥50% in theory AND ≥50% in practical SEPARATELY
export const PHARMACY_GRADES = [
  { min: 90, grade: "O", points: 10, label: "90–100%" },
  { min: 80, grade: "A", points: 9,  label: "80–89%"  },
  { min: 70, grade: "B", points: 8,  label: "70–79%"  },
  { min: 60, grade: "C", points: 7,  label: "60–69%"  },
  { min: 50, grade: "D", points: 6,  label: "50–59%"  },
  { min: 0,  grade: "F", points: 0,  label: "<50%"    },
];

// ── Max marks per subject type ────────────────────────────────────────────────
// Returns { int, ext, total }
// For pharmacy, total is essential because grade is % of total
export function getMaxMarks(type, scheme = "engineering") {
  if (scheme === "pharmacy") {
    switch (type) {
      case "lab":              return { int: 15, ext: 35,  total: 50  }; // standard practical
      case "theory-small":    return { int: 15, ext: 35,  total: 50  }; // NUE: Comm Skills, Remedial Bio/Math (Sem 1)
      case "theory-75":       return { int: 25, ext: 50,  total: 75  }; // NUE: Computer Apps, Env Sciences (Sem 2)
      case "lab-small":       return { int: 10, ext: 15,  total: 25  }; // NUE small practicals
      case "practice-school": return { int: 25, ext: 125, total: 150 }; // Sem 7 Practice School
      case "project":         return { int: 0,  ext: 150, total: 150 }; // Sem 8 Project Work
      default:                return { int: 25, ext: 75,  total: 100 }; // standard theory
    }
  }
  // Engineering — unchanged
  if (type === "lab")     return { int: 60, ext: 40, total: 100 };
  if (type === "project") return { int: 100, ext: 0, total: 100 };
  return                         { int: 40, ext: 60, total: 100 };
}

// ── Grade lookup — scheme + total aware ───────────────────────────────────────
// maxTotal: total marks for this subject (100, 50, 75, 150 for pharmacy)
// Engineering: grade from raw marks (always on 100 scale)
// Pharmacy: grade from PERCENTAGE of maxTotal
export function getGrade(total, scheme = "engineering", maxTotal = 100) {
  if (total === null || total === undefined || total === "") return null;
  const m = Number(total);
  if (isNaN(m) || m < 0) return null;

  if (scheme === "pharmacy") {
    const max = maxTotal || 100;
    const pct = (m / max) * 100;
    if (pct > 100.01) return null; // tiny float buffer
    return PHARMACY_GRADES.find(g => pct >= g.min) ?? null;
  }

  if (m > 100) return null;
  return ENGINEERING_GRADES.find(g => m >= g.min) ?? null;
}

// ── Grade color helper ────────────────────────────────────────────────────────
export function gradeColor(points, colors) {
  if (points >= 9) return colors.ok;
  if (points >= 7) return colors.accentTxt;
  if (points >= 4) return colors.warn;
  return colors.bad;
}

// ── Target grade for predictor — scheme-aware ─────────────────────────────────
export function getTargetGradeForSGPA(desiredSGPA, scheme = "engineering") {
  const table = scheme === "pharmacy" ? PHARMACY_GRADES : ENGINEERING_GRADES;
  return [...table].reverse().find(g => g.points >= desiredSGPA) ?? table[0];
}