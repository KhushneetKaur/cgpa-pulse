import mongoose from "mongoose";

// Stores one document per user per branch per semester
// e.g. user A, CSE branch, Semester 3

const subjectMarksSchema = new mongoose.Schema(
  {
    code: { type: String, required: true }, // e.g. "BCSES1-302"
    int:  { type: Number, default: null, min: 0, max: 60 },
    ext:  { type: Number, default: null, min: 0, max: 60 },
  },
  { _id: false } // no separate _id for subdocuments
);

const semesterDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    branch: {
      type: String,
      required: true,
      enum: ["CSE", "AIML", "ECE", "EE", "ME", "CIVIL", "TE"],
    },

    semNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    // Array of subject marks — one entry per subject in the semester
    marks: {
      type: [subjectMarksSchema],
      default: [],
    },

    // Calculated SGPA — stored so we don't recalculate on every fetch
    sgpa: {
      type: Number,
      default: null,
      min: 0,
      max: 10,
    },

    // Total credits for this semester
    credits: {
      type: Number,
      default: 0,
    },

    // true if not all subjects were filled when saved
    isPartial: {
      type: Boolean,
      default: false,
    },

    // "detailed" = marks entered, "quick" = SGPA entered directly
    mode: {
      type: String,
      enum: ["detailed", "quick"],
      default: "detailed",
    },

    // Elective name overrides — { "BCSED1-51X": "Machine Learning" }
    electiveNames: {
      type: Map,
      of: String,
      default: {},
    },

    // Subject codes marked as backlog
    backlogs: {
      type: [String],
      default: [],
    },

    savedAt: {
      type: Date,
      default: Date.now,
    },

    customSubjects: [
      {
        code: { type: String, required: true },
        name: { type: String, required: true },
        credits: { type: Number, min: 0, max: 10, required: true },
        type: { type: String, enum: ["theory", "lab"], default: "theory" },
      },
    ],

    hiddenSubjects: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// ── Compound unique index ─────────────────────────────────────────────────────
// The compound index handles both single user+branch lookups and exact semester lookups via leftmost prefixing.
semesterDataSchema.index(
  { userId: 1, branch: 1, semNumber: 1 },
  { unique: true }
);

// ── Validate SGPA before save / findOneAndUpdate ──────────────────────────────
function validateSgpa(sgpa) {
  if (sgpa !== null && sgpa !== undefined) {
    if (typeof sgpa !== "number" || sgpa < 0 || sgpa > 10) {
      throw new Error("SGPA must be between 0 and 10");
    }
  }
}

semesterDataSchema.pre("save", function (next) {
  try {
    validateSgpa(this.sgpa);
    next();
  } catch (err) {
    next(err);
  }
});

semesterDataSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update?.$set?.sgpa !== undefined) {
    try {
      validateSgpa(update.$set.sgpa);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

export default mongoose.model("SemesterData", semesterDataSchema);