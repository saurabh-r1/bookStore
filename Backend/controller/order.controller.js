// Backend/controller/order.controller.js
import Order from "../model/order.model.js";

// USER: place order (current demo: "instant paid" / free)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { items, total } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items to order" });
    }

    const numericTotal = Number(total || 0);

    // In real world: here you would create a payment (Razorpay/Stripe/etc.)
    // and return client secret / order id to frontend.
    // For now we just mark as "paid" or "free" directly.
    const paymentStatus =
      numericTotal <= 0 ? "free" : "paid";

    const order = new Order({
      user: userId,
      items: items.map((it) => ({
        book: it.bookId,
        qty: it.qty,
        priceAtPurchase: Number(it.book?.price || 0),
      })),
      total: numericTotal,
      status: "placed",

      // demo payment info
      paymentStatus,
      paymentMethod: numericTotal <= 0 ? "free" : "demo",
      paymentId: numericTotal <= 0 ? undefined : `DEMO_${Date.now()}`,
    });

    await order.save();

    return res.status(201).json({
      message: "Order placed successfully (demo)",
      order,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// USER: get own orders
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await Order.find({ user: userId })
      .populate("items.book")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ADMIN: get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullname email")
      .populate("items.book")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ADMIN: update order status (e.g. shipped, delivered, cancelled)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const updated = await Order.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      },
      { new: true }
    )
      .populate("user", "fullname email")
      .populate("items.book");

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order updated",
      order: updated,
    });
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
