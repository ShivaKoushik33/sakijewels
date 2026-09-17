/**
 * Proxy for api.postalpincode.in
 *
 * The browser cannot call it directly, so we forward server-side. Certificate
 * verification stays ON: turning it off (the previous workaround for their
 * expired cert) makes the response — which populates a customer's city and
 * state — trivially tamperable in transit.
 */
const UPSTREAM = "https://api.postalpincode.in/pincode";
const TIMEOUT_MS = 6000;

export const lookupPincode = async (req, res) => {
  const { pin } = req.params;

  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    return res.status(400).json({ message: "Invalid pincode" });
  }

  // Without a timeout a slow upstream holds the socket open indefinitely.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${UPSTREAM}/${pin}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return res.status(502).json({ message: "Pincode lookup failed" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({ message: "Pincode lookup timed out" });
    }
    console.error("lookupPincode error:", error.message);
    return res.status(502).json({ message: "Pincode lookup failed" });
  } finally {
    clearTimeout(timer);
  }
};
