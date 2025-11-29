// Backend/route/payment.route.js
import express from "express";
import {
  createPayment,
  getMyPayments,
  getAllPayments,
  getPaymentStats,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controller/payment.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// USER – demo payment
router.post("/", requireAuth, createPayment);
router.get("/", requireAuth, getMyPayments);

// ADMIN – view payments & stats
router.get("/all", requireAuth, requireAdmin, getAllPayments);
router.get("/stats", requireAuth, requireAdmin, getPaymentStats);

// RAZORPAY
router.post(
  "/razorpay/create-order",
  requireAuth,
  createRazorpayOrder
);

router.post(
  "/razorpay/verify",
  requireAuth,
  verifyRazorpayPayment
);

export default router;
