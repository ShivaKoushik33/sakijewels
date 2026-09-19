/**
 * Proxy for api.postalpincode.in
 *
 * The browser cannot call it directly, so we forward server-side. Certificate
 * verification stays ON: turning it off (the previous workaround for their
 * expired cert) makes the response — which populates a customer's city and
 * state — trivially tamperable in transit.
 */
const UPSTREAM = "https://api.postalpincode.in/pincode";

// Measured against the live service: the same pincode answers in anything
// from 2 to 30 seconds. Six seconds failed often enough that the form kept
// asking customers to type a city the post office could have filled in.
const TIMEOUT_MS = 12000;

// ...and because of that, answers are kept. A pincode's post offices are a
// public directory that changes about never, and one pincode serves a whole
// town, so the second customer from that town gets the form filled instantly
// and the upstream is spared the call. Nothing personal is stored.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_LIMIT = 2000;
const cache = new Map();

const readCache = (pin) => {
  const hit = cache.get(pin);
  if (!hit) return null;

  if (Date.now() - hit.storedAt > CACHE_TTL_MS) {
    cache.delete(pin);
    return null;
  }
  return hit.data;
};

const writeCache = (pin, data) => {
  // A Map keeps insertion order, so the oldest entry goes first.
  if (cache.size >= CACHE_LIMIT) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(pin, { storedAt: Date.now(), data });
};

export const lookupPincode = async (req, res) => {
  const { pin } = req.params;

  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    return res.status(400).json({ message: "Invalid pincode" });
  }

  const cached = readCache(pin);
  if (cached) {
    return res.status(200).json(cached);
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

    // Only a real answer is worth keeping; "no records" may mean the
    // upstream is having a bad day rather than that the pincode is wrong.
    if (data?.[0]?.Status === "Success") {
      writeCache(pin, data);
    }

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
