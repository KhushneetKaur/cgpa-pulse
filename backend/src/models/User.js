import mongoose from "mongoose";

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

    // Placeholder hash for Google users — app is Google-only so never a real password
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

    branch: {
      type:    String,
      enum:    ["CSE", "AIML", "ECE", "EE", "ME", "CIVIL", "TE", null],
      default: null,
    },

    currentSem: {
      type:    Number,
      default: null,
      min:     1,
      max:     8,
    },

    usernameSetAt: {
      type:    Date,
      default: null,
    },

    lbOptIn: {
      type:    Boolean,
      default: false,
    },

    lbOptInDate: {
      type:    Date,
      default: null,
    },

    googleId: {
      type:   String,
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
      type:    String, // "android" | "ios" | "desktop"
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
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// branch index supports leaderboard branch-filtered queries
userSchema.index({ branch: 1 });

// ── Instance method: safe public profile ──────────────────────────────────────
userSchema.methods.toPublicJSON = function () {
  return {
    id:             this._id,
    username:       this.username,
    email:          this.email,
    role:           this.role,
    branch:         this.branch,
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