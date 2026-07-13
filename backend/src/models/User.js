import mongoose from "mongoose";
import bcrypt   from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type:      String,
      required:  [true, "Username is required"],
      unique:    true,
      trim:      true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match:     [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ],
    },

    email: {
      type:     String,
      required: [true, "Email is required"],
      unique:   true,
      trim:     true,
      lowercase: true,
      match:    [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    passwordHash: {
      type:     String,
      required: true,
      select:   false,  // never returned in queries by default
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

    lbOptIn: {
  type:    Boolean,
  default: false,
},
lbOptInDate: {
  type:    Date,
  default: null,
},

    // For future Google OAuth
    googleId: {
      type:    String,
      default: null,
      select:  false,
    },

    isActive: {
      type:    Boolean,
      default: true,
    },

    lastLogin: {
      type:    Date,
      default: null,
    },
    // Email verification
isEmailVerified:   { type: Boolean, default: false },


// Password reset
passwordResetToken:  { type: String, select: false, default: null },
passwordResetExpiry: { type: Date,   select: false, default: null },

// Refresh token
refreshTokenHash: { type: String, select: false, default: null },
  },
  {
    timestamps: true,  // adds createdAt and updatedAt automatically
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ role:     1 });
userSchema.index({ createdAt: -1 });

// ── Hash password before saving ───────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  // Only hash plain passwords. PendingSignup already stores a bcrypt hash.
  if (!this.isModified("passwordHash")) return next();
  if (
    this.passwordHash.startsWith("$2a$") ||
    this.passwordHash.startsWith("$2b$") ||
    this.passwordHash.startsWith("$2y$")
  ) {
    return next();
  }
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ── Instance method: safe public profile (no sensitive fields) ────────────────
userSchema.methods.toPublicJSON = function () {
  return {
    id:        this._id,
    username:  this.username,
    email:     this.email,
    role:      this.role,
    branch:    this.branch,
    lbOptIn:   this.lbOptIn,
    lbOptInDate:     this.lbOptInDate,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};
// Auto-delete unverified users after 24 hours
// Only applies if emailOTPExpiry is set
userSchema.index(
  { emailOTPExpiry: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      isEmailVerified: false,
    },
  }
);
export default mongoose.model("User", userSchema);

