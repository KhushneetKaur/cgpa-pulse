import mongoose from "mongoose";
import dotenv from "dotenv";
import Leaderboard from "../src/models/Leaderboard.js";
import SemesterData from "../src/models/SemesterData.js";
import User from "../src/models/User.js";

// Load environment variables (.env file from root)
dotenv.config();

async function runMigration() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing from environment variables.");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const userIds = await SemesterData.distinct("userId");
    console.log(`Found ${userIds.length} users with saved semester records.`);

    let syncedCount = 0;

    for (const userId of userIds) {
      const user = await User.findById(userId).lean();
      if (!user) continue;

      const userSemesters = await SemesterData.find({ userId }).lean();
      if (!userSemesters.length) continue;

      let totalCredits = 0;
      let totalPoints = 0;

      for (const sem of userSemesters) {
        const sgpa = Number(sem.sgpa);
        const credits = Number(sem.credits || sem.totalCredits || 0);

        if (!isNaN(sgpa) && credits > 0) {
          totalPoints += sgpa * credits;
          totalCredits += credits;
        }
      }

      if (totalCredits > 0) {
        const calculatedCgpa = Number((totalPoints / totalCredits).toFixed(2));

        await Leaderboard.findOneAndUpdate(
          { userId: user._id },
          {
            $set: {
              username: user.username || user.name || "Student",
              branch: user.branch || userSemesters[0]?.branch || "OTHER",
              faculty: user.faculty || null,
              cgpa: calculatedCgpa,
              semCount: userSemesters.length,
            },
          },
          { upsert: true, new: true }
        );
        syncedCount++;
      }
    }

    console.log(`✅ Successfully synced ${syncedCount} users to the leaderboard!`);
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runMigration();