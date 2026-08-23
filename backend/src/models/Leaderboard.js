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
    },

    faculty: {
      type:    String,
      default: null,
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
  { timestamps: true }
);

leaderboardSchema.index({ cgpa: -1, updatedAt: 1 });

leaderboardSchema.index({ branch: 1, cgpa: -1, updatedAt: 1 });

leaderboardSchema.index({ faculty: 1, cgpa: -1, updatedAt: 1 });

export default mongoose.model("Leaderboard", leaderboardSchema);