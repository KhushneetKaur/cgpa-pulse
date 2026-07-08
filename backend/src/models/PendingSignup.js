import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const pendingSignupSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    emailOTP: {
      type: String,
      required: true,
      select: false,
    },
    emailOTPExpiry: {
      type: Date,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

pendingSignupSchema.index({ username: 1 }, { unique: true });
pendingSignupSchema.index({ email: 1 }, { unique: true });
pendingSignupSchema.index({ emailOTPExpiry: 1 }, { expireAfterSeconds: 0 });

pendingSignupSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  if (this.passwordHash.startsWith("$2a$") || this.passwordHash.startsWith("$2b$") || this.passwordHash.startsWith("$2y$")) {
    return next();
  }
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

pendingSignupSchema.methods.compareOTP = async function (candidateOTP) {
  return bcrypt.compare(candidateOTP, this.emailOTP);
};

pendingSignupSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    expiresAt: this.emailOTPExpiry,
  };
};

export default mongoose.model("PendingSignup", pendingSignupSchema);
