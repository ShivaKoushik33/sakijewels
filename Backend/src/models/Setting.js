import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ORDER_EMAIL_KEY = "orderNotificationEmail";

export default mongoose.model("Setting", settingSchema);
