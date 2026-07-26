import mongoose from "mongoose";

const tokenRecordSchema = new mongoose.Schema({
  // Shared unique ID returned to frontend / embedded in reset links
  tokenId: { type: String, required: true, unique: true, index: true },

  // "otp" | "reset"
  type: { type: String, enum: ["otp", "reset"], required: true },

  // For OTP records: the hashed 6-digit code
  otpHash: { type: String, default: null, select: false },

  // For OTP: intent "signup" | "login"
  intent: { type: String, enum: ["signup", "login", null], default: null },

  // Payload: for signup OTPs — store pending user data
  // For reset — store userId
  payload: { type: mongoose.Schema.Types.Mixed, default: null },

  // TTL: MongoDB auto-deletes documents 15 min after createdAt
  createdAt: { type: Date, default: Date.now, expires: 900 }, // 900s = 15min
});

export default mongoose.model("TokenRecord", tokenRecordSchema);
