// Called once on startup — crashes early with a clear message
// if any required variable is missing rather than failing silently later

const REQUIRED_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLIENT_URL",
  "NODE_ENV",
];

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `\n❌ Missing required environment variables:\n  ${missing.join("\n  ")}\n` +
      `Copy .env.example to .env and fill in all values.\n`
    );
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error("\n❌ JWT_SECRET must be at least 32 characters long.\n");
    process.exit(1);
  }

  console.log("✅ Environment variables validated");
}