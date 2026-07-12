/**
 * SMS sending — isolated provider layer.
 *
 * Only this file knows which SMS provider we use. If you switch providers
 * later (Fast2SMS, MSG91, etc.), you only change this file.
 *
 * Current provider: 2Factor.in
 *
 * ENV VARS (add to Backend/.env):
 *   SMS_PROVIDER          = "2factor"   (or "console" during local dev)
 *   TWOFACTOR_API_KEY     = your 2Factor.in API key
 *   TWOFACTOR_TEMPLATE    = your approved DLT/OTP template name (optional; 2Factor
 *                           has a default OTP template that works out of the box)
 *
 * During development set SMS_PROVIDER=console — the OTP is printed to the
 * backend terminal instead of being sent, so you can test the full flow
 * with zero cost and before any provider/DLT setup.
 */

/**
 * Send an OTP code to a phone number (10-digit Indian number, no country code).
 * Returns nothing on success; throws on failure.
 */
export const sendOtpSms = async (phone, code) => {
  const provider = process.env.SMS_PROVIDER || "console";

  // --- Local / dev mode: just log the code, don't hit any provider ---
  if (provider === "console") {
    console.log(`\n📱 [DEV OTP] Code for +91${phone} is: ${code}\n`);
    return;
  }

  // --- 2Factor.in ---
  if (provider === "2factor") {
    const apiKey = process.env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      throw new Error("TWOFACTOR_API_KEY is not set");
    }

    const template = process.env.TWOFACTOR_TEMPLATE;

    // 2Factor "SMS" endpoint with an explicit OTP value:
    //   /API/V1/{api_key}/SMS/{phone}/{otp}/{template_name}
    // Template segment is optional; 2Factor uses its default OTP template when omitted.
    const base = `https://2factor.in/API/V1/${apiKey}/SMS/+91${phone}/${code}`;
    const url = template ? `${base}/${encodeURIComponent(template)}` : base;

    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.Status !== "Success") {
      throw new Error(
        `2Factor SMS failed: ${data.Details || res.statusText || "unknown error"}`
      );
    }
    return;
  }

  throw new Error(`Unknown SMS_PROVIDER: ${provider}`);
};
