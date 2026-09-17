import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const required = [
  "MONGO_URI",
  "JWT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required env vars: ${missing.join(", ")}`);
}

const isProduction = process.env.NODE_ENV === "production";

// A short signing secret can be brute-forced offline from any issued token,
// which would let an attacker mint their own ADMIN tokens.
if (process.env.JWT_SECRET.length < 32) {
  const msg =
    "JWT_SECRET is too short — use at least 32 characters of random data " +
    '(node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))").';
  if (isProduction) throw new Error(msg);
  console.warn(`WARNING: ${msg}`);
}

// Test keys accept cards and settle nothing — shipping goods against them is
// a straight loss.
if (isProduction && process.env.RAZORPAY_KEY_ID.startsWith("rzp_test")) {
  throw new Error("Refusing to start in production with Razorpay TEST keys.");
}

// Fail at startup, not at a customer's first login, when WhatsApp OTP is
// switched on but not configured.
const otpProviders = [process.env.SMS_PROVIDER, process.env.OTP_FALLBACK_PROVIDER];
if (otpProviders.includes("whatsapp")) {
  const missingWhatsapp = [
    "WHATSAPP_ACCESS_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_TEMPLATE_NAME",
  ].filter((key) => !process.env[key]);

  if (missingWhatsapp.length) {
    throw new Error(
      `WhatsApp OTP is enabled but these env vars are missing: ${missingWhatsapp.join(", ")}`
    );
  }
}

export {};
