/**
 * One-off migration: give order numbers to orders placed before order
 * numbers existed.
 *
 * Each order is numbered from its own order date and payment type, oldest
 * first, through the same daily counter new orders use — so numbers stay
 * unique even if new orders were placed on the same day. Orders that already
 * have a number are left alone, so the script is safe to run again.
 *
 * Run once:  node src/scripts/backfillOrderNumbers.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import Order from "../models/Order.js";
import { nextOrderNumber } from "../utils/orderNumber.js";

dotenv.config();

// Some networks block the SRV DNS records that `mongodb+srv://` needs
// (querySrv ECONNREFUSED). Force a public DNS resolver that supports SRV.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const orders = await Order.find({ orderNumber: { $exists: false } })
    .sort({ createdAt: 1 })
    .select("_id createdAt paymentMethod");

  console.log(`Orders without a number: ${orders.length}`);

  for (const order of orders) {
    const orderNumber = await nextOrderNumber(order.paymentMethod, order.createdAt);
    // updateOne, not save: leaves updatedAt and everything else untouched.
    await Order.updateOne(
      { _id: order._id },
      { $set: { orderNumber } },
      { timestamps: false }
    );
    console.log(`${order._id} -> ${orderNumber}`);
  }

  console.log("Done.");
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("backfillOrderNumbers failed:", error);
  process.exit(1);
});
