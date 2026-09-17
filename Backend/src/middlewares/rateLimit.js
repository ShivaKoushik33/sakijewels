import rateLimit from "express-rate-limit";

/**
 * Rate limiters.
 *
 * Limits are deliberately generous — a real shopper never comes close to them.
 * They exist to stop credential stuffing, OTP/SMS-cost abuse and scripted
 * scraping, not to throttle normal browsing.
 *
 * These count per client IP, so `trust proxy` must be set correctly in app.js
 * once the API sits behind nginx / Cloudflare, otherwise every request looks
 * like it comes from the proxy.
 */

const common = {
  standardHeaders: true,
  legacyHeaders: false,
};

/** Whole API: catches scrapers and accidental request loops. */
export const apiLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  message: { message: "Too many requests. Please slow down and try again shortly." },
});

/** Password login / registration: brute-force protection. */
export const authLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

/**
 * OTP sending. The per-phone daily cap already lives in the controller; this
 * caps the *sender* instead, so a script cannot walk thousands of numbers and
 * bill us for the SMS (the standard SMS-pumping fraud pattern).
 */
export const otpSendLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: { message: "Too many OTP requests. Please try again later." },
});

/** OTP verification: stops offline-style guessing across many phone numbers. */
export const otpVerifyLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { message: "Too many attempts. Please request a new OTP shortly." },
});

/** Reviews: a customer rates the handful of items they bought, not hundreds. */
export const reviewLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: { message: "Too many reviews submitted. Please try again later." },
});

/** Checkout: one shopper does not need more than this in 15 minutes. */
export const checkoutLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 40,
  message: { message: "Too many checkout attempts. Please wait a moment and retry." },
});
