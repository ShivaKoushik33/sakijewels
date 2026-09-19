import mongoose from "mongoose";

/**
 * Payment Intent
 *
 * Written when we create a Razorpay order, read back when the browser returns
 * with a payment id. It is what makes the amount verifiable: without a stored
 * record of *what we asked the customer to pay*, the verify step had nothing to
 * compare the captured payment against and simply re-priced the cart as it
 * stood at that moment — which let a cart be inflated after payment.
 *
 * `status` also gives us single-use semantics: the document is claimed inside
 * the checkout transaction, so the same payment cannot create two orders.
 */

const intentItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    house: String,
    street: String,
    landmark: String,
    city: String,
    district: String,
    state: String,
    pincode: String,
    country: String,
  },
  { _id: false }
);

const paymentIntentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    // Amount in paise, exactly as handed to Razorpay.
    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["CREATED", "CONSUMED"],
      default: "CREATED",
      index: true,
    },

    paymentId: {
      type: String,
      default: null,
    },

    items: [intentItemSchema],
    shippingAddress: addressSnapshotSchema,

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    coupon: { type: String, default: null },

    // Abandoned intents clean themselves up.
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

paymentIntentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PaymentIntent", paymentIntentSchema);
