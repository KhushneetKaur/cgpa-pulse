import mongoose from "mongoose";

const VALID_BRANCHES = [
  // Engineering
  "CSE", "AIML", "ECE", "EE", "ME", "CIVIL", "TE",
  // Pharmacy
  "BPHARM", "PHARMD", "MPHARM",
  // Future programmes — add here
];

const VALID_FACULTIES = ["engineering", "pharmacy"];
// Future: "science", "bca" etc.

const userSchema = new mongoose.Schema(
  {
    username: {
      type:      String,
      required:  [true, "Username is required"],
      unique:    true,
      trim:      true,
      minlength: [4,  "Username must be at least 4 characters"],
      maxlength: [15, "Username cannot exceed 15 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },

    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      trim:      true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    passwordHash: {
      type:     String,
      required: false,
      default:  null,
      select:   false,
    },

    hasSetPassword: {
      type:    Boolean,
      default: false,
    },

    role: {
      type:    String,
      enum:    ["student", "admin"],
      default: "student",
    },

    // No enum — validated at Joi layer (validators.js VALID_BRANCHES)
    // Keeping flexible so adding new programmes only requires validators.js change
    branch: {
      type:    String,
      default: null,
    },

    // "engineering" | "pharmacy" | future faculties
    // Persisted so inferFaculty() is never needed after first login
    faculty: {
      type:    String,
      enum:    [...VALID_FACULTIES, null],
      default: null,
    },

    // max 12 — covers 8-sem B.Tech, 5-year Pharm.D, future programmes
    currentSem: {
      type:    Number,
      default: null,
      min:     1,
      max:     12,
    },

    usernameSetAt: {
      type:    Date,
      default: null,
    },

    lbOptIn: {
      type:    Boolean,
      default: true,
    },

    lbOptInDate: {
      type:    Date,
      default: null,
    },

    googleId: {
      type:    String,
      default: null,
      select:  false,
      sparse:  true,
      unique:  true,
    },

    appInstalled: {
      type:    Boolean,
      default: false,
    },

    appInstalledAt: {
      type:    Date,
      default: null,
    },

    appInstalledOn: {
      type:    String,
      default: null,
    },

    isActive: {
      type:    Boolean,
      default: true,
    },

    lastLogin: {
      type:    Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Branch + faculty index — covers leaderboard branch filter queries
userSchema.index({ branch: 1, faculty: 1, isActive: 1 });

userSchema.methods.toPublicJSON = function () {
  return {
    id:             this._id,
    username:       this.username,
    email:          this.email,
    role:           this.role,
    branch:         this.branch,
    faculty:        this.faculty,
    joiningYear:    this.joiningYear,
    currentSem:     this.currentSem,
    usernameSetAt:  this.usernameSetAt,
    appInstalled:   this.appInstalled,
    appInstalledAt: this.appInstalledAt,
    appInstalledOn: this.appInstalledOn,
    lbOptIn:        this.lbOptIn,
    lbOptInDate:    this.lbOptInDate,
    hasSetPassword: this.hasSetPassword,
    lastLogin:      this.lastLogin,
    createdAt:      this.createdAt,
  };
};

export default mongoose.model("User", userSchema);