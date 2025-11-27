// Backend/controller/order.controller.js
import Order from "../model/order.model.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id; // from requireAuth middleware
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
        book: it.bookId, // comes from frontend cart
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
