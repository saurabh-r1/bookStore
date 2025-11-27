// Backend/model/payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false, // optional: some payments may not be linked to an order in this demo
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    provider: {
      type: String,
      default: "demo", // razorpay/stripe/etc in real life
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "success", // demo: mark as success
    },
    reference: {
      type: String, // e.g. transaction id from gateway
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
