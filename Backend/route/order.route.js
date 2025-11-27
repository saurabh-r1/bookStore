// Backend/route/order.route.js
import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderInvoice, // ⬅ NEW
} from "../controller/order.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// USER
// POST /orders       -> place order
router.post("/", requireAuth, createOrder);

// GET /orders        -> current user's orders
router.get("/", requireAuth, getMyOrders);

// ✅ NEW: GET /orders/:id/invoice  -> download invoice PDF
router.get("/:id/invoice", requireAuth, getOrderInvoice);

// ADMIN
// GET /orders/all    -> all users' orders
router.get("/all", requireAuth, requireAdmin, getAllOrders);

// PUT /orders/:id/status  -> update status
router.put("/:id/status", requireAuth, requireAdmin, updateOrderStatus);

export default router;
