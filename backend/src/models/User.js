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

    // Optional password field in case you want to allow password setup later
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
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // Refresh token session hash
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

// ── Instance method: safe public profile ──────────────────────────────────────
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    branch: this.branch,
    lbOptIn: this.lbOptIn,
    lbOptInDate: this.lbOptInDate,
    hasSetPassword: this.hasSetPassword,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);