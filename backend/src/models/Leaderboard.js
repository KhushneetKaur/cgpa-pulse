import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true, // Ensures one leaderboard record per user
    },

    // Stored directly for fast reads without joining the User collection
    username: {
      type:     String,
      required: true,
      trim:     true,
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
      min:     0,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Compound index for branch leaderboards with tie-breaking for stable sorting
leaderboardSchema.index({ branch: 1, cgpa: -1, updatedAt: 1 });

// Compound index for global leaderboards with tie-breaking
leaderboardSchema.index({ cgpa: -1, updatedAt: 1 });

export default mongoose.model("Leaderboard", leaderboardSchema);