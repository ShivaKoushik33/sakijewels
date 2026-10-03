import mongoose from "mongoose";

/**
 * A named running number. Order numbers keep one per day, e.g. the document
 * "order-261003" holds how many orders were numbered on 3 Oct 2026.
 */
const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },

  seq: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Counter", counterSchema);
