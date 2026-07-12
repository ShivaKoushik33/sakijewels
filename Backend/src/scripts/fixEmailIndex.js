/**
 * One-off migration: fix the users.email unique index.
 *
 * Problem: the existing `email_1` index is a plain unique index, so every
 * user without an email is stored as `email: null` and only ONE such doc is
 * allowed. Phone-only (OTP) users have no email, so the 2nd one fails with
 * E11000 duplicate key { email: null }.
 *
 * Fix: drop `email_1` and recreate it as a PARTIAL unique index that only
 * applies when email is a string — null / missing emails are ignored.
 *
 * Run once:  node src/scripts/fixEmailIndex.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Some networks block the SRV DNS records that `mongodb+srv://` needs
// (querySrv ECONNREFUSED). Force a public DNS resolver that supports SRV.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = mongoose.connection.collection("users");

  const indexes = await users.indexes();
  console.log("Current indexes:", indexes.map((i) => i.name));

  // Drop the old email index if it exists (name may be email_1).
  const emailIndex = indexes.find(
    (i) => i.key && i.key.email === 1
  );
  if (emailIndex) {
    await users.dropIndex(emailIndex.name);
    console.log(`Dropped index: ${emailIndex.name}`);
  } else {
    console.log("No email index found to drop.");
  }

  // Recreate as a partial unique index (only enforced when email is a string).
  await users.createIndex(
    { email: 1 },
    {
      unique: true,
      partialFilterExpression: { email: { $type: "string" } },
      name: "email_1",
    }
  );
  console.log("Created partial unique index on email.");

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
