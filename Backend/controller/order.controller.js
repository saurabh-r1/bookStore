// Backend/controller/order.controller.js
import Order from "../model/order.model.js";
import PDFDocument from "pdfkit";

// CREATE order (user)
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
      message: "Order placed successfully ",
      order,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET current user's orders
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

// ADMIN: GET all orders
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

// ADMIN: update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["placed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("user", "fullname email")
      .populate("items.book");

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated",
      order: updated,
    });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ NEW: Generate & stream invoice PDF for a specific order
export const getOrderInvoice = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Load order with user + books
    const order = await Order.findById(id)
      .populate("user", "fullname email")
      .populate("items.book");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only the owner or admin can download
    const isOwner = order.user._id.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Setup headers for file download
    const filename = `invoice-${order._id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Pipe directly to response
    doc.pipe(res);

    // === Invoice content ===
    // Header
    doc
      .fontSize(20)
      .text("The Page Hub", { align: "left" })
      .moveDown(0.2);
    doc
      .fontSize(10)
      .fillColor("#555555")
      .text("Online Bookstore ", { align: "left" })
      .moveDown(1);

    // Invoice info
    doc
      .fillColor("#000000")
      .fontSize(14)
      .text("Invoice", { align: "right" })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .text(`Invoice ID: ${order._id}`, { align: "right" })
      .text(
        `Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`,
        { align: "right" }
      )
      .moveDown(1);

    // Billing info
    doc
      .fontSize(11)
      .text("Billed To:", { underline: true })
      .moveDown(0.3);
    doc
      .fontSize(10)
      .text(order.user.fullname)
      .text(order.user.email)
      .moveDown(1);

    // Table header
    doc
      .fontSize(11)
      .text("Items", 50, doc.y, { underline: true })
      .moveDown(0.5);

    // Table columns
    const tableTop = doc.y;
    const colX = {
      name: 50,
      qty: 300,
      price: 360,
      total: 430,
    };

    doc.fontSize(10).text("Book", colX.name, tableTop);
    doc.text("Qty", colX.qty, tableTop);
    doc.text("Price", colX.price, tableTop);
    doc.text("Total", colX.total, tableTop);

    doc
      .moveTo(50, tableTop + 12)
      .lineTo(550, tableTop + 12)
      .strokeColor("#cccccc")
      .stroke();

    let position = tableTop + 20;

    order.items.forEach((item) => {
      const book = item.book || {};
      const price = Number(item.priceAtPurchase || 0);
      const lineTotal = price * (item.qty || 0);

      doc
        .fontSize(10)
        .fillColor("#000000")
        .text(book.name || "Book", colX.name, position, {
          width: 240,
        });
      doc.text(item.qty || 0, colX.qty, position);
      doc.text(
        price === 0 ? "Free" : `₹${price.toLocaleString()}`,
        colX.price,
        position
      );
      doc.text(
        price === 0 ? "-" : `₹${lineTotal.toLocaleString()}`,
        colX.total,
        position
      );

      position += 18;
    });

    // Summary
    doc.moveDown(2);
    doc
      .fontSize(11)
      .text("Order Summary", 50, position + 10, { underline: true });

    const totalAmount = Number(order.total || 0);

    doc
      .fontSize(10)
      .text(
        `Subtotal: ${
          totalAmount === 0 ? "Free" : `₹${totalAmount.toLocaleString()}`
        }`,
        50,
        position + 30
      );
    doc.text("Taxes: Included ", 50, position + 45);
    doc.text(
      `Grand Total: ${
        totalAmount === 0 ? "Free" : `₹${totalAmount.toLocaleString()}`
      }`,
      50,
      position + 60
    );

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#666666")
      .text(
        "This invoice is generated as part of the Page Hub BookStore project and is not a real tax invoice.",
        { align: "center" }
      );

    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error("Invoice generation error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  }
};
