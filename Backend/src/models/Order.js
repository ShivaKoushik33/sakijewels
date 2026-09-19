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
      enum: ["PENDING", "ACCEPTED", "CONFIRMED", "REJECTED", "DELIVERED","REFUNDED"],
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

// "My orders" and the admin list both sort by date within a scope.
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
