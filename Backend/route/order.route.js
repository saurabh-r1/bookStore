// Backend/route/order.route.js
import express from "express";
import { createOrder, getMyOrders } from "../controller/order.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /orders  -> place order
router.post("/", requireAuth, createOrder);

// GET /orders   -> current user's orders
router.get("/", requireAuth, getMyOrders);

export default router;
