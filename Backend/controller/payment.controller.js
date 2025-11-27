// Backend/controller/payment.controller.js
import Payment from "../model/payment.model.js";
import Order from "../model/order.model.js";

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
    // total revenue & count (only success)
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

    // last 7 days daily chart (success only)
    const since = new Date();
    since.setDate(since.getDate() - 6); // includes today

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
      daily, // array for chart
    });
  } catch (err) {
    console.error("Get payment stats error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
