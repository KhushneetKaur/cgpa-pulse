import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    // Stored directly for fast reads without joining User collection
    username: {
      type:     String,
      required: true,
    },

    branch: {
      type:     String,
      required: true,
      enum:     ["CSE", "ECE", "EE", "ME", "CIVIL", "TE"],
    },

    cgpa: {
      type:     Number,
      required: true,
      min:      0,
      max:      10,
    },

    // How many semesters contributed to this CGPA
    semCount: {
      type:    Number,
      default: 0,
    },

    updatedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// One entry per user per branch
leaderboardSchema.index(
  { userId: 1, branch: 1 },
  { unique: true }
);

// Fast sorted queries — get top CGPAs per branch
leaderboardSchema.index({ branch: 1, cgpa: -1 });

// Fast sorted queries — get top CGPAs overall
leaderboardSchema.index({ cgpa: -1 });

export default mongoose.model("Leaderboard", leaderboardSchema);