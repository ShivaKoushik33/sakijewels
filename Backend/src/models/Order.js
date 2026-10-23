import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  name: String,
  image: String,

  price: {
    type: Number,
    required: true
  },

  quantity: {
    type: Number,
    required: true
  }
});

const addressSchema = new mongoose.Schema({
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
});

const orderSchema = new mongoose.Schema(
  {
    // What the customer and the admin see, e.g. "TSJ-261003-C-0042".
    // See utils/orderNumber.js. _id stays the key for links and lookups.
    orderNumber: {
      type: String
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [orderItemSchema],

    shippingAddress: addressSchema,

    subtotal: {
      type: Number,
      default: 0
    },

    discount: {
      type: Number,
      default: 0
    },

    deliveryFee: {
      type: Number,
      default: 0
    },

    codCharge: {
      type: Number,
      default: 0
    },

    coupon: {
      type: String,
      default: null
    },

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "CONFIRMED", "REJECTED", "CANCELLED", "DELIVERED", "REFUNDED"],
      default: "PENDING"
    },

    adminRemark: {
      type: String
    },
    paymentId: {
    type: String
  },
  paymentMethod:
  {
    type: String,
      enum: ["COD","ONLINE"],
      default: "ONLINE"
  },
  isPaid: {
    type: Boolean,
    default: false
  }
  },
  {
    timestamps: true
  }
);

/**
 * A captured Razorpay payment must map to exactly one order. Partial so the
 * many COD orders (paymentId: null) do not collide with each other.
 */
orderSchema.index(
  { paymentId: 1 },
  { unique: true, partialFilterExpression: { paymentId: { $type: "string" } } }
);

// No two orders share a number. Partial so orders placed before order numbers
// existed (no orderNumber) do not collide with each other.
orderSchema.index(
  { orderNumber: 1 },
  { unique: true, partialFilterExpression: { orderNumber: { $type: "string" } } }
);

// "My orders" and the admin list both sort by date within a scope.
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
