import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },

    username: {
      type:     String,
      required: true,
      trim:     true,
    },

    branch: {
      type:     String,
      required: true,
      enum:     ["CSE", "AIML", "ECE", "EE", "ME", "CIVIL", "TE"],
    },

    cgpa: {
      type:     Number,
      required: true,
      min:      0,
      max:      10,
    },

    semCount: {
      type:    Number,
      default: 0,
      min:     0,
    },
  },
  {
    timestamps: true, 
  }
);

// Branch leaderboard with stable tie-breaking sort
leaderboardSchema.index({ branch: 1, cgpa: -1, updatedAt: 1 });

// Global leaderboard with stable tie-breaking sort
leaderboardSchema.index({ cgpa: -1, updatedAt: 1 });

export default mongoose.model("Leaderboard", leaderboardSchema);