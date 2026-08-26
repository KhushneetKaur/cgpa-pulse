// ── MRSPTU Pharmacy Programmes ────────────────────────────────────────────────
// Source: PCI Rules & Syllabus for B.Pharm (CBCS), Regulation 2014 (effective 2016-17)
// Subject codes: official PCI codes (BP = B.Pharm)
// Mark scheme:
//   theory         → 25 int + 75 ext = 100 total (university exam)
//   lab            → 15 int + 35 ext = 50  total (university practical)
//   theory-small   → 15 int + 35 ext = 50  total (NUE: Comm Skills, Remedial Bio/Math)
//   theory-75      → 25 int + 50 ext = 75  total (NUE: Computer Apps, Env Sciences)
//   lab-small      → 10 int + 15 ext = 25  total (NUE practicals)
//   practice-school→ 25 int +125 ext = 150 total (Sem 7)
//   project        →  0 int +150 ext = 150 total (Sem 8)
// Pass: ≥50% of total for each subject separately (theory AND practical)

export const PHARMACY_BRANCHES = {

  // ── B.Pharmacy — 8 Semesters ─────────────────────────────────────────────
  BPHARM: {
    name:     "Bachelor of Pharmacy",
    short:    "B.Pharm",
    scheme:   "pharmacy",
    color:    "#0ea5e9",
    semLabel: "Sem",
    semesters: {

      1: { subjects: [
        { code: "BP101T",    name: "Human Anatomy & Physiology I",        type: "theory",       credits: 4 },
        { code: "BP102T",    name: "Pharmaceutical Analysis I",            type: "theory",       credits: 4 },
        { code: "BP103T",    name: "Pharmaceutics I",                      type: "theory",       credits: 4 },
        { code: "BP104T",    name: "Pharmaceutical Inorganic Chemistry",   type: "theory",       credits: 4 },
        { code: "BP105T",    name: "Communication Skills",                 type: "theory-small", credits: 2 }, // NUE
        { code: "BP106RBT",  name: "Remedial Biology/Remedial Maths",                     type: "theory-small", credits: 2 }, // NUE — hide if Maths stream
        { code: "BP107P",    name: "Human Anatomy & Physiology I Lab",     type: "lab",          credits: 2 },
        { code: "BP108P",    name: "Pharmaceutical Analysis I Lab",        type: "lab",          credits: 2 },
        { code: "BP109P",    name: "Pharmaceutics I Lab",                  type: "lab",          credits: 2 },
        { code: "BP110P",    name: "Pharmaceutical Inorganic Chemistry Lab",type: "lab",         credits: 2 },
        { code: "BP111P",    name: "Communication Skills Lab",             type: "lab-small",    credits: 1 }, // NUE
        { code: "BP112RBP",  name: "Remedial Biology Lab",                 type: "lab-small",    credits: 1 }, // NUE
      ]},

      2: { subjects: [
        { code: "BP201T",    name: "Human Anatomy & Physiology II",        type: "theory",    credits: 4 },
        { code: "BP202T",    name: "Pharmaceutical Organic Chemistry I",   type: "theory",    credits: 4 },
        { code: "BP203T",    name: "Biochemistry",                         type: "theory",    credits: 4 },
        { code: "BP204T",    name: "Pathophysiology",                      type: "theory",    credits: 4 },
        { code: "BP205T",    name: "Computer Applications in Pharmacy",    type: "theory-75", credits: 3 }, // NUE: 25+50=75
        { code: "BP206T",    name: "Environmental Sciences",               type: "theory-75", credits: 3 }, // NUE: 25+50=75
        { code: "BP207P",    name: "Human Anatomy & Physiology II Lab",    type: "lab",       credits: 2 },
        { code: "BP208P",    name: "Pharmaceutical Organic Chemistry I Lab",type: "lab",      credits: 2 },
        { code: "BP209P",    name: "Biochemistry Lab",                     type: "lab",       credits: 2 },
        { code: "BP210P",    name: "Computer Applications Lab",            type: "lab-small", credits: 1 }, // NUE: 10+15=25
      ]},

      3: { subjects: [
        { code: "BP301T",    name: "Pharmaceutical Organic Chemistry II",  type: "theory",    credits: 4 },
        { code: "BP302T",    name: "Physical Pharmaceutics I",             type: "theory",    credits: 4 },
        { code: "BP303T",    name: "Pharmaceutical Microbiology",          type: "theory",    credits: 4 },
        { code: "BP304T",    name: "Pharmaceutical Engineering",           type: "theory",    credits: 4 },
        { code: "BP305P",    name: "Pharmaceutical Organic Chemistry II Lab",type: "lab",     credits: 2 },
        { code: "BP306P",    name: "Physical Pharmaceutics I Lab",         type: "lab",       credits: 2 },
        { code: "BP307P",    name: "Pharmaceutical Microbiology Lab",      type: "lab",       credits: 2 },
        { code: "BP308P",    name: "Pharmaceutical Engineering Lab",       type: "lab",       credits: 2 },
      ]},

      4: { subjects: [
        { code: "BP401T",    name: "Pharmaceutical Organic Chemistry III", type: "theory",    credits: 4 },
        { code: "BP402T",    name: "Medicinal Chemistry I",                type: "theory",    credits: 4 },
        { code: "BP403T",    name: "Physical Pharmaceutics II",            type: "theory",    credits: 4 },
        { code: "BP404T",    name: "Pharmacology I",                       type: "theory",    credits: 4 },
        { code: "BP405T",    name: "Pharmacognosy & Phytochemistry I",     type: "theory",    credits: 4 },
        { code: "BP406P",    name: "Medicinal Chemistry I Lab",            type: "lab",       credits: 2 },
        { code: "BP407P",    name: "Physical Pharmaceutics II Lab",        type: "lab",       credits: 2 },
        { code: "BP408P",    name: "Pharmacology I Lab",                   type: "lab",       credits: 2 },
        { code: "BP409P",    name: "Pharmacognosy & Phytochemistry I Lab", type: "lab",       credits: 2 },
      ]},

      5: { subjects: [
        { code: "BP501T",    name: "Medicinal Chemistry II",               type: "theory",    credits: 4 },
        { code: "BP502T",    name: "Industrial Pharmacy I",                type: "theory",    credits: 4 },
        { code: "BP503T",    name: "Pharmacology II",                      type: "theory",    credits: 4 },
        { code: "BP504T",    name: "Pharmacognosy & Phytochemistry II",    type: "theory",    credits: 4 },
        { code: "BP505T",    name: "Pharmaceutical Jurisprudence",         type: "theory",    credits: 4 },
        { code: "BP506P",    name: "Industrial Pharmacy I Lab",            type: "lab",       credits: 2 },
        { code: "BP507P",    name: "Pharmacology II Lab",                  type: "lab",       credits: 2 },
        { code: "BP508P",    name: "Pharmacognosy & Phytochemistry II Lab",type: "lab",       credits: 2 },
      ]},

      6: { subjects: [
        { code: "BP601T",    name: "Medicinal Chemistry III",              type: "theory",    credits: 4 },
        { code: "BP602T",    name: "Pharmacology III",                     type: "theory",    credits: 4 },
        { code: "BP603T",    name: "Herbal Drug Technology",               type: "theory",    credits: 4 },
        { code: "BP604T",    name: "Biopharmaceutics & Pharmacokinetics",  type: "theory",    credits: 4 },
        { code: "BP605T",    name: "Pharmaceutical Biotechnology",         type: "theory",    credits: 4 },
        { code: "BP606T",    name: "Quality Assurance",                    type: "theory",    credits: 4 },
        { code: "BP607P",    name: "Medicinal Chemistry III Lab",          type: "lab",       credits: 2 },
        { code: "BP608P",    name: "Pharmacology III Lab",                 type: "lab",       credits: 2 },
        { code: "BP609P",    name: "Herbal Drug Technology Lab",           type: "lab",       credits: 2 },
      ]},

      7: { subjects: [
        { code: "BP701T",    name: "Instrumental Methods of Analysis",     type: "theory",          credits: 4 },
        { code: "BP702T",    name: "Industrial Pharmacy II",               type: "theory",          credits: 4 },
        { code: "BP703T",    name: "Pharmacy Practice",                    type: "theory",          credits: 4 },
        { code: "BP704T",    name: "Novel Drug Delivery System",           type: "theory",          credits: 4 },
        { code: "BP705P",    name: "Instrumental Methods of Analysis Lab", type: "lab",             credits: 2 },
        { code: "BP706PS",   name: "Practice School",                      type: "practice-school", credits: 6 }, // 25+125=150, NUE
      ]},

      8: { subjects: [
        { code: "BP801T",    name: "Biostatistics & Research Methodology", type: "theory",  credits: 4 },
        { code: "BP802T",    name: "Social & Preventive Pharmacy",         type: "theory",  credits: 4 },
        { code: "BP803ET",   name: "Departmental Elective I",              type: "theory",  credits: 4, elective: true },
        { code: "BP804ET",   name: "Departmental Elective II",             type: "theory",  credits: 4, elective: true },
        { code: "BP813PW",   name: "Project Work",                         type: "project", credits: 6 }, // 0+150=150
      ]},
    },
  },

  // ── Pharm.D — 5 Academic Years (Year 6 = Internship, no marks) ────────────
  PHARMD: {
    name:     "Doctor of Pharmacy",
    short:    "Pharm.D",
    scheme:   "pharmacy",
    color:    "#8b5cf6",
    semLabel: "Year",
    semesters: {
      1: { label: "Year 1", subjects: [
        { code: "MPHD1-101", name: "Human Anatomy & Physiology",             type: "theory", credits: 4 },
        { code: "MPHD1-102", name: "Pharmaceutics",                          type: "theory", credits: 3 },
        { code: "MPHD1-103", name: "Medicinal Biochemistry",                 type: "theory", credits: 4 },
        { code: "MPHD1-104", name: "Pharmaceutical Organic Chemistry",       type: "theory", credits: 4 },
        { code: "MPHD1-105", name: "Pharmaceutical Inorganic Chemistry",     type: "theory", credits: 3 },
        { code: "MPHD1-106", name: "Remedial Mathematics / Biology",         type: "theory", credits: 4 },
        { code: "MPHD1-107", name: "Human Anatomy & Physiology Lab",         type: "lab",    credits: 2 },
        { code: "MPHD1-108", name: "Pharmaceutics Lab",                      type: "lab",    credits: 2 },
        { code: "MPHD1-109", name: "Medicinal Biochemistry Lab",             type: "lab",    credits: 2 },
        { code: "MPHD1-110", name: "Pharmaceutical Organic Chemistry Lab",   type: "lab",    credits: 2 },
        { code: "MPHD1-111", name: "Pharmaceutical Inorganic Chemistry Lab", type: "lab",    credits: 2 },
      ]},
      2: { label: "Year 2", subjects: [
        { code: "MPHD1-213", name: "Pathophysiology",                        type: "theory", credits: 4 },
        { code: "MPHD1-214", name: "Pharmaceutical Microbiology",            type: "theory", credits: 4 },
        { code: "MPHD1-215", name: "Pharmacognosy & Phytopharmaceuticals",   type: "theory", credits: 4 },
        { code: "MPHD1-216", name: "Pharmacology I",                         type: "theory", credits: 4 },
        { code: "MPHD1-217", name: "Community Pharmacy",                     type: "theory", credits: 3 },
        { code: "MPHD1-218", name: "Pharmacotherapeutics I",                 type: "theory", credits: 4 },
        { code: "MPHD1-219", name: "Pharmaceutical Microbiology Lab",        type: "lab",    credits: 1 },
        { code: "MPHD1-220", name: "Pharmacognosy Lab",                      type: "lab",    credits: 1 },
        { code: "MPHD1-221", name: "Pharmacotherapeutics I Lab",             type: "lab",    credits: 1 },
        { code: "MPHD1-222", name: "Pharmacology I Lab",                     type: "lab",    credits: 1 },
      ]},
      3: { label: "Year 3", subjects: [
        { code: "MPHD1-323", name: "Pharmacology II",                        type: "theory", credits: 4 },
        { code: "MPHD1-324", name: "Pharmaceutical Analysis",                type: "theory", credits: 4 },
        { code: "MPHD1-325", name: "Pharmacotherapeutics II",                type: "theory", credits: 4 },
        { code: "MPHD1-326", name: "Pharmaceutical Jurisprudence",           type: "theory", credits: 3 },
        { code: "MPHD1-327", name: "Medicinal Chemistry",                    type: "theory", credits: 4 },
        { code: "MPHD1-328", name: "Pharmaceutical Formulations",            type: "theory", credits: 3 },
        { code: "MPHD1-329", name: "Pharmacology II Lab",                    type: "lab",    credits: 2 },
        { code: "MPHD1-330", name: "Pharmaceutical Analysis Lab",            type: "lab",    credits: 2 },
        { code: "MPHD1-331", name: "Pharmacotherapeutics II Lab",            type: "lab",    credits: 2 },
        { code: "MPHD1-332", name: "Medicinal Chemistry Lab",                type: "lab",    credits: 2 },
        { code: "MPHD1-333", name: "Pharmaceutical Formulations Lab",        type: "lab",    credits: 2 },
      ]},
      4: { label: "Year 4", subjects: [
        { code: "MPHD1-434", name: "Pharmacotherapeutics III",               type: "theory", credits: 4 },
        { code: "MPHD1-435", name: "Hospital Pharmacy",                      type: "theory", credits: 3 },
        { code: "MPHD1-436", name: "Clinical Pharmacy",                      type: "theory", credits: 4 },
        { code: "MPHD1-437", name: "Biostatistics & Research Methodology",   type: "theory", credits: 3 },
        { code: "MPHD1-438", name: "Biopharmaceutics & Pharmacokinetics",    type: "theory", credits: 4 },
        { code: "MPHD1-439", name: "Clinical Toxicology",                    type: "theory", credits: 3 },
        { code: "MPHD1-440", name: "Pharmacotherapeutics III Lab",           type: "lab",    credits: 2 },
        { code: "MPHD1-441", name: "Hospital Pharmacy Lab",                  type: "lab",    credits: 2 },
        { code: "MPHD1-442", name: "Clinical Pharmacy Lab",                  type: "lab",    credits: 2 },
        { code: "MPHD1-443", name: "Biopharmaceutics & Pharmacokinetics Lab",type: "lab",    credits: 2 },
      ]},
      5: { label: "Year 5", subjects: [
        { code: "MPHD1-544", name: "Clinical Research",                      type: "theory",  credits: 4 },
        { code: "MPHD1-545", name: "Pharmacoepidemiology & Pharmacoeconomics",type: "theory", credits: 4 },
        { code: "MPHD1-546", name: "Clinical Pharmacokinetics & TDM",        type: "theory",  credits: 3 },
        { code: "MPHD1-547", name: "Clerkship",                              type: "lab",     credits: 1 },
        { code: "MPHD1-548", name: "Project Work / Thesis",                  type: "project", credits: 20 },
      ]},
    },
  },

  // ── M.Pharmacy — 4 Semesters ─────────────────────────────────────────────
  MPHARM: {
    name:     "Master of Pharmacy",
    short:    "M.Pharm",
    scheme:   "pharmacy",
    color:    "#06b6d4",
    semLabel: "Sem",
    semesters: {
      1: { subjects: [
        { code: "MPHR1-101", name: "Modern Pharmaceutics",                   type: "theory", credits: 4 },
        { code: "MPHR1-102", name: "Drug Delivery Systems",                  type: "theory", credits: 4 },
        { code: "MPHR1-103", name: "Advanced Pharmaceutical Analysis",       type: "theory", credits: 4 },
        { code: "MPHR1-104", name: "Biopharmaceutics & Pharmacokinetics",    type: "theory", credits: 4 },
        { code: "MPHR1-105", name: "Pharmaceutics Lab I",                    type: "lab",    credits: 4 },
        { code: "MPHR1-106", name: "Pharmaceutical Analysis Lab I",          type: "lab",    credits: 4 },
      ]},
      2: { subjects: [
        { code: "MPHR1-201", name: "Novel Drug Delivery Systems",            type: "theory", credits: 4 },
        { code: "MPHR1-202", name: "Regulatory Affairs & Quality Systems",   type: "theory", credits: 4 },
        { code: "MPHR1-203", name: "Computer-Aided Drug Design",             type: "theory", credits: 4 },
        { code: "MPHR1-204", name: "Research Methodology & Biostatistics",   type: "theory", credits: 4 },
        { code: "MPHR1-205", name: "Pharmaceutics Lab II",                   type: "lab",    credits: 4 },
        { code: "MPHR1-206", name: "Pharmaceutical Analysis Lab II",         type: "lab",    credits: 4 },
      ]},
      3: { subjects: [
        { code: "MPHR1-301", name: "Dissertation Phase I",                   type: "project", credits: 24 },
      ]},
      4: { subjects: [
        { code: "MPHR1-401", name: "Dissertation Phase II & Viva",           type: "project", credits: 24 },
      ]},
    },
  },
};

export const PHARMACY_ELECTIVE_OPTIONS = {
  "BP803ET": ["Pharma Marketing Management"],
  "BP804ET": ["Pharmaceutical Regulatory Science"],
  "BP805ET": ["Pharmacovigilance"],
  "BP806ET": ["Quality Control and Standardization of Herbals"],
  "BP807ET": ["Computer Aided Drug Design"],
  "BP808ET": ["Cell and Molecular Biology"],
  "BP809ET": ["Cosmetic Science"],
  "BP810ET": ["Experimental Pharmacology"],
  "BP811ET": ["Advanced Instrumentation Techniques"],
  "BP812ET": ["Dietary Supplements and Nutraceuticals"],
};

// Expose for elective dropdowns in Sem 8
export const BPHARM_SEM8_ELECTIVES = Object.keys(PHARMACY_ELECTIVE_OPTIONS);