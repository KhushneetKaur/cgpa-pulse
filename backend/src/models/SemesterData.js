import mongoose from "mongoose";

const subjectMarksSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    int:  { type: Number, default: null, min: 0, max: 150 },
    ext:  { type: Number, default: null, min: 0, max: 150 },
  },
  { _id: false }
);

// Custom subject subdoc — flexible type for future programmes
const customSubjectSchema = new mongoose.Schema(
  {
    code:    { type: String, required: true },
    name:    { type: String, required: true },
    credits: { type: Number, min: 0, max: 30, required: true }, 
    type:    { type: String, default: "theory" }, 
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
    },

    semNumber: {
      type:     Number,
      required: true,
      min:      1,
      max:      12,
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
      min:     0,
      max:     300,
    },

    isPartial: {
      type:    Boolean,
      default: false,
    },

    mode: {
      type:    String,
      enum:    ["detailed", "quick"],
      default: "detailed",
    },

    electiveNames: {
      type:    Map,
      of:      String,
      default: {},
    },

    backlogs: {
      type:    [String],
      default: [],
    },

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
  { timestamps: true }
);

semesterDataSchema.index({ userId: 1, branch: 1, semNumber: 1 }, { unique: true });

export default mongoose.model("SemesterData", semesterDataSchema);