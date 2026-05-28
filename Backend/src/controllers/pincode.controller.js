import https from "https";

/**
 * Proxy for api.postalpincode.in
 * Their SSL cert is currently expired, so the browser refuses to call it
 * directly. We fetch server-side with a tolerant agent and forward JSON.
 */
export const lookupPincode = async (req, res) => {
  const { pin } = req.params;

  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ message: "Invalid pincode" });
  }

  const options = {
    hostname: "api.postalpincode.in",
    path: `/pincode/${pin}`,
    method: "GET",
    agent: new https.Agent({ rejectUnauthorized: false }),
  };

  const upstream = https.request(options, (upRes) => {
    let body = "";
    upRes.on("data", (chunk) => (body += chunk));
    upRes.on("end", () => {
      try {
        const data = JSON.parse(body);
        res.status(200).json(data);
      } catch (err) {
        res.status(502).json({ message: "Invalid upstream response" });
      }
    });
  });

  upstream.on("error", (err) => {
    res.status(502).json({ message: "Pincode lookup failed", error: err.message });
  });

  upstream.end();
};
