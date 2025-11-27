// Backend/route/payment.route.js
import express from "express";
import {
  createPayment,
  getMyPayments,
  getAllPayments,
  getPaymentStats,
} from "../controller/payment.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// USER
// POST /payments       -> create a demo payment
router.post("/", requireAuth, createPayment);

// GET /payments        -> current user's payments
router.get("/", requireAuth, getMyPayments);

// ADMIN
// GET /payments/all    -> all payments across users
router.get("/all", requireAuth, requireAdmin, getAllPayments);

// GET /payments/stats  -> aggregate stats for dashboard
router.get("/stats", requireAuth, requireAdmin, getPaymentStats);

export default router;
