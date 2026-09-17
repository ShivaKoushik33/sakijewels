import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import orderRoutes from "./routes/order.routes.js";
import addressRoutes from "./routes/address.routes.js";
import pincodeRoutes from "./routes/pincode.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import { apiLimiter } from "./middlewares/rateLimit.js";

const app = express();

/**
 * Behind nginx / Cloudflare the client IP arrives in X-Forwarded-For. Without
 * this, every request looks like it came from the proxy and the rate limiters
 * below would throttle all users as one. Set TRUST_PROXY to the number of
 * proxies in front of the app (0 when it is exposed directly).
 */
app.set("trust proxy", Number(process.env.TRUST_PROXY ?? 1));

// Security headers (HSTS, nosniff, frame protection, referrer policy...).
// CORP is relaxed because the browser reaches this API cross-origin.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/**
 * Allowed browser origins. Override in production with a comma-separated
 * CORS_ORIGINS env var; the defaults cover local dev and both apex/www forms
 * of the live domains.
 */
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5100",
  "https://thesakhijewels.com",
  "https://www.thesakhijewels.com",
  "https://adminsakhi.thesakhijewels.com",
];

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : defaultOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/pincode", pincodeRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Saki Jewels API is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Unknown route → JSON 404 instead of Express's default HTML page.
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/**
 * Central error handler. Logs the real error server-side and returns a generic
 * message with a reference id, so driver/stack details never reach a client.
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const ref = Math.random().toString(36).slice(2, 10);
  console.error(`[error ${ref}] ${req.method} ${req.originalUrl}`, err);

  if (res.headersSent) return;

  res.status(err.status || 500).json({
    message: "Something went wrong. Please try again.",
    ref,
  });
});

export default app;
