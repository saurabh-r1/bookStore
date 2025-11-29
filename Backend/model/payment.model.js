// Backend/model/payment.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    amount: {
      type: Number, // in rupees
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    provider: {
      type: String,
      enum: ["demo", "razorpay"],
      default: "demo",
    },
    status: {
      type: String,
      enum: ["created", "success", "failed"],
      default: "created",
    },
    reference: {
      type: String,
    },
    notes: {
      type: Schema.Types.Mixed,
    },

    // Razorpay specific fields
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
