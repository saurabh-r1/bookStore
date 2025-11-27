// Backend/model/order.model.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    // Final charged amount (after discounts, etc.)
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Order lifecycle
    status: {
      type: String,
      enum: ["placed", "cancelled", "shipped", "delivered"],
      default: "placed",
    },

    // 💳 Payment info (for structure only)
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "free"],
      default: "pending",
    },
    paymentMethod: {
      type: String, // e.g. "razorpay", "stripe", "cod", etc.
    },
    paymentId: {
      type: String, // e.g. gateway payment id / reference
    },
    paymentMeta: {
      type: Object, // any gateway response you want to store (optional)
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
