// Backend/controller/order.controller.js
import Order from "../model/order.model.js";

// USER: create order
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

    const order = new Order({
      user: userId,
      items: items.map((it) => ({
        book: it.bookId,
        qty: it.qty,
        priceAtPurchase: Number(it.book?.price || 0),
      })),
      total: Number(total || 0),
      status: "placed",
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

// 🚩 ADMIN: get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullname email")
      .populate("items.book")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Get ALL orders error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🚩 ADMIN: update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["placed", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(id)
      .populate("user", "fullname email")
      .populate("items.book");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      message: "Order status updated",
      order,
    });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
