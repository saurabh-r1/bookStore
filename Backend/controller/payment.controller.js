// Backend/controller/payment.controller.js
import Payment from "../model/payment.model.js";
import Order from "../model/order.model.js"; // make sure this path is correct
import Razorpay from "razorpay";
import crypto from "crypto";

// ---------- DEMO PAYMENT ENDPOINTS (you already had) ----------

// POST /payments  (user) – demo "create payment"
export const createPayment = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orderId, amount, reference, notes } = req.body;

    if (amount == null) {
      return res.status(400).json({ message: "Amount is required" });
    }

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
    }

    const payment = new Payment({
      user: userId,
      order: order?._id,
      amount: Number(amount) || 0,
      currency: "INR",
      provider: "demo",
      status: "success", // in real integration this would be updated via webhook
      reference: reference || undefined,
      notes: notes || undefined,
    });

    await payment.save();

    return res.status(201).json({
      message: "Payment recorded (demo)",
      payment,
    });
  } catch (err) {
    console.error("Create payment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /payments  (user) – current user's payments
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payments = await Payment.find({ user: userId })
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (err) {
    console.error("Get my payments error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /payments/all  (admin) – all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "fullname email")
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (err) {
    console.error("Get all payments error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /payments/stats  (admin) – summary for Analytics/Payments dashboard
export const getPaymentStats = async (req, res) => {
  try {
    const [agg] = await Payment.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = agg?.totalRevenue || 0;
    const totalPayments = agg?.totalPayments || 0;

    const since = new Date();
    since.setDate(since.getDate() - 6); // last 7 days incl. today

    const daily = await Payment.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
          },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);

    res.status(200).json({
      totalRevenue,
      totalPayments,
      daily,
    });
  } catch (err) {
    console.error("Get payment stats error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------- RAZORPAY SETUP ----------

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;
if (razorpayKeyId && razorpayKeySecret) {
  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} else {
  console.warn(
    "⚠️ RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set. Razorpay routes will not work."
  );
}

// POST /payments/razorpay/create-order
export const createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(500).json({
        message: "Razorpay is not configured on server.",
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { amount, items } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Valid amount (in paise) is required" });
    }

    // 1) Create internal Order document (status: pending)
    const orderDoc = new Order({
      user: userId,
      items: (items || []).map((it) => ({
        book: it.bookId,
        qty: it.qty || 1,
      })),
      total: amount / 100, // store in rupees
      status: "pending", // you can rename based on your schema
    });

    await orderDoc.save();

    // 2) Create Razorpay order
    const options = {
      amount, // in paise
      currency: "INR",
      receipt: `order_${orderDoc._id}`,
      notes: {
        appOrderId: String(orderDoc._id),
        appUserId: String(userId),
      },
    };

    const rzpOrder = await razorpayInstance.orders.create(options);

    // 3) Store a Payment row with status "created"
    const payment = new Payment({
      user: userId,
      order: orderDoc._id,
      amount: amount / 100,
      currency: "INR",
      provider: "razorpay",
      status: "created",
      razorpayOrderId: rzpOrder.id,
    });

    await payment.save();

    return res.status(201).json({
      message: "Razorpay order created",
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      orderId: orderDoc._id,
    });
  } catch (err) {
    console.error("createRazorpayOrder error:", err);
    res
      .status(500)
      .json({ message: "Failed to create Razorpay order", error: err.message });
  }
};

// POST /payments/razorpay/verify
export const verifyRazorpayPayment = async (req, res) => {
  try {
    if (!razorpayKeySecret) {
      return res.status(500).json({
        message: "Razorpay is not configured on server.",
      });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Missing Razorpay payment details.",
      });
    }

    // 1) Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment signature mismatch." });
    }

    // 2) Update Payment
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      user: userId,
    });

    if (!payment) {
      console.warn("Payment doc not found for Razorpay order:", razorpay_order_id);
    } else {
      payment.status = "success";
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      await payment.save();
    }

    // 3) Update internal Order status
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        status: "paid", // adjust to your status naming
      });
    }

    return res.status(200).json({
      message: "Payment verified successfully.",
    });
  } catch (err) {
    console.error("verifyRazorpayPayment error:", err);
    res
      .status(500)
      .json({ message: "Failed to verify payment", error: err.message });
  }
};
