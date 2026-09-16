import "./src/config/env.js"; // MUST be first import

import dns from "node:dns/promises";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import connectToCloudinary from "./src/config/cloudinary.js";

// Some networks block the SRV lookups that mongodb+srv:// needs.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

connectDB();
connectToCloudinary();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});

// Never let an unhandled rejection take the process down silently.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const shutdown = (signal) => () => {
  console.log(`${signal} received, shutting down.`);
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown("SIGTERM"));
process.on("SIGINT", shutdown("SIGINT"));
