/**
 * OTP delivery — isolated provider layer.
 *
 * Only this file knows how an OTP reaches the user. The controller calls
 * sendOtpSms(phone, code) and never cares which channel was used.
 *
 * Providers (set SMS_PROVIDER in Backend/.env):
 *   "whatsapp" — WhatsApp Cloud API, using an approved Authentication template
 *   "2factor"  — 2Factor.in
 *   "console"  — prints the OTP to the backend terminal instead of sending it,
 *                so you can test the full flow locally at zero cost
 *
 * OTP_FALLBACK_PROVIDER (optional) is tried when the primary provider throws.
 * It only covers errors raised while *sending* — a provider outage, a bad
 * token, a rejected template. WhatsApp accepts messages for numbers that have
 * no WhatsApp account and reports that failure later, so a fallback cannot
 * rescue those users.
 *
 * ENV VARS (add to Backend/.env):
 *   WHATSAPP_ACCESS_TOKEN     permanent System User token (whatsapp_business_messaging)
 *   WHATSAPP_PHONE_NUMBER_ID  ID of the sending number, from the Meta dashboard
 *   WHATSAPP_TEMPLATE_NAME    approved Authentication template, e.g. sakhi_otp_template
 *   WHATSAPP_TEMPLATE_LANG    that template's language code, e.g. en_US
 *   WHATSAPP_API_VERSION      Graph API version (optional, defaults to v23.0)
 *   TWOFACTOR_API_KEY         your 2Factor.in API key
 *   TWOFACTOR_TEMPLATE        your approved DLT/OTP template name (optional; 2Factor
 *                             has a default OTP template that works out of the box)
 */

// A hung Meta request would otherwise hold the customer's "Send OTP" click open.
const WHATSAPP_TIMEOUT_MS = 10_000;

// --- Local / dev mode: just log the code, don't hit any provider ---
const sendViaConsole = async (phone, code) => {
  console.log(`\n📱 [DEV OTP] Code for +91${phone} is: ${code}\n`);
};

// --- WhatsApp Cloud API ---
const sendViaWhatsApp = async (phone, code) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  if (!token || !phoneNumberId || !templateName) {
    throw new Error("WhatsApp OTP is not configured (WHATSAPP_* env vars missing)");
  }

  const version = process.env.WHATSAPP_API_VERSION || "v23.0";
  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  // Copy-code authentication templates take the code twice: once for the
  // message body and once for the button. Meta calls that button's sub_type
  // "url" even though it copies the code.
  const payload = {
    messaging_product: "whatsapp",
    to: `91${phone}`,
    type: "template",
    template: {
      name: templateName,
      language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en_US" },
      components: [
        { type: "body", parameters: [{ type: "text", text: code }] },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: code }],
        },
      ],
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(WHATSAPP_TIMEOUT_MS),
  });
  const data = await res.json().catch(() => ({}));

  // A 200 only means Meta accepted the message; delivery is reported later.
  if (!res.ok || !data.messages?.[0]?.id) {
    const err = data.error || {};
    const parts = [err.message || res.statusText || "unknown error"];
    // The subcode says why, e.g. 190/463 is an expired access token.
    if (err.code) parts.push(`code ${err.code}${err.error_subcode ? `/${err.error_subcode}` : ""}`);
    if (err.error_data?.details) parts.push(err.error_data.details);
    throw new Error(`WhatsApp OTP failed: ${parts.join(" | ")}`);
  }
};

// --- 2Factor.in ---
const sendVia2Factor = async (phone, code) => {
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
};

const providers = {
  console: sendViaConsole,
  whatsapp: sendViaWhatsApp,
  "2factor": sendVia2Factor,
};

const sendWith = async (provider, phone, code) => {
  const send = providers[provider];
  if (!send) {
    throw new Error(`Unknown OTP provider: ${provider}`);
  }
  await send(phone, code);
  return provider;
};

/**
 * Send an OTP code to a phone number (10-digit Indian number, no country code).
 * Returns the provider that sent it; throws if every configured provider failed.
 */
export const sendOtpSms = async (phone, code) => {
  const primary = process.env.SMS_PROVIDER || "console";
  const fallback = process.env.OTP_FALLBACK_PROVIDER;

  try {
    return await sendWith(primary, phone, code);
  } catch (error) {
    if (!fallback || fallback === primary) throw error;
    console.error(`OTP via ${primary} failed, trying ${fallback}:`, error.message);
    return await sendWith(fallback, phone, code);
  }
};
