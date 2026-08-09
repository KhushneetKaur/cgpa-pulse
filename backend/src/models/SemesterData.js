import mongoose from "mongoose";

const subjectMarksSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    int:  { type: Number, default: null, min: 0, max: 60 },
    ext:  { type: Number, default: null, min: 0, max: 60 },
  },
  { _id: false }
);

const customSubjectSchema = new mongoose.Schema(
  {
    code:    { type: String, required: true },
    name:    { type: String, required: true },
    credits: { type: Number, min: 0, max: 10, required: true },
    type:    { type: String, enum: ["theory", "lab"], default: "theory" },
  },
  { _id: false } 
);

const semesterDataSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    branch: {
      type:     String,
      required: true,
      enum:     ["CSE", "AIML", "ECE", "EE", "ME", "CIVIL", "TE"],
    },

    semNumber: {
      type:     Number,
      required: true,
      min:      1,
      max:      8,
    },

    marks: {
      type:    [subjectMarksSchema],
      default: [],
    },

    sgpa: {
      type:    Number,
      default: null,
      min:     0,
      max:     10,
    },

    credits: {
      type:    Number,
      default: 0,
    },

    isPartial: {
      type:    Boolean,
      default: false,
    },

    // "detailed" = marks entered, "quick" = SGPA entered directly
    mode: {
      type:    String,
      enum:    ["detailed", "quick"],
      default: "detailed",
    },

    // Elective name overrides — { "BCSED1-51X": "Machine Learning" }
    electiveNames: {
      type:    Map,
      of:      String,
      default: {},
    },

    backlogs: {
      type:    [String],
      default: [],
    },

    // Explicit save timestamp — distinct from updatedAt which changes on any write
    savedAt: {
      type:    Date,
      default: Date.now,
    },

    customSubjects: {
      type:    [customSubjectSchema],
      default: [],
    },

    hiddenSubjects: {
      type:    [String],   
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index 
semesterDataSchema.index({ userId: 1, branch: 1, semNumber: 1 }, { unique: true });

export default mongoose.model("SemesterData", semesterDataSchema);