import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    passwordHash: {
      type: String,
      required: false,
      default: null,
      select: false,
    },

    hasSetPassword: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    branch: {
      type: String,
      enum: ["CSE", "AIML", "ECE", "EE", "ME", "CIVIL", "TE", null],
      default: null,
    },

     currentSem: {
     type:    Number,
     default: null,
     min:     1,
     max:     8,
     },
    lbOptIn: {
      type: Boolean,
      default: false,
    },

    lbOptInDate: {
      type: Date,
      default: null,
    },

    // Google OAuth fields
    googleId: {
      type: String,
      default: null,
      select: false,
      sparse: true,
      unique: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    refreshTokenHash: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ branch: 1 }); // Added index for fast leaderboard branch lookups

// ── Pre-Validate Hook: Auto-generate fallback username if missing ────────────
userSchema.pre("validate", function (next) {
  if (!this.username && this.email) {
    // Generate a default username from email prefix (e.g. alex_8a3f)
    const prefix = this.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    this.username = `${prefix.slice(0, 20)}_${randomSuffix}`;
  }
  next();
});

// ── Instance method: safe public profile ──────────────────────────────────────
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    branch: this.branch,
    currentSem: this.currentSem,
    lbOptIn: this.lbOptIn,
    lbOptInDate: this.lbOptInDate,
    hasSetPassword: this.hasSetPassword,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);