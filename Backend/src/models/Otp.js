import mongoose from "mongoose";

/**
 * OTP Schema
 *
 * Stores a hashed OTP against a phone number with a short expiry.
 * A TTL index on `expiresAt` lets MongoDB auto-delete expired documents,
 * so we never accumulate stale codes.
 */
const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },

    // We store a hash of the OTP, never the plain code.
    codeHash: {
      type: String,
      required: true,
    },

    // How many verify attempts have been made for this code.
    attempts: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index: MongoDB removes the doc once expiresAt is reached.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);
