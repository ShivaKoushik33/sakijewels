import mongoose from "mongoose";

/**
 * OTP Throttle
 *
 * Tracks how many OTPs have been sent to a phone within a rolling window,
 * so a single number can't drain SMS balance by spamming "Send OTP".
 *
 * The document is created on the first send of a window and auto-deleted by
 * the TTL index once `windowExpiresAt` passes — which naturally resets the
 * count for the next day.
 */
const otpThrottleSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },

    count: {
      type: Number,
      default: 0,
    },

    windowExpiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index: MongoDB removes the doc once windowExpiresAt is reached.
otpThrottleSchema.index({ windowExpiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OtpThrottle", otpThrottleSchema);
