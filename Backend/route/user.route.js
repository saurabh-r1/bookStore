// Backend/route/user.route.js
import express from "express";
import multer from "multer";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
} from "../controller/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Multer config – files go into /uploads folder
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = file.originalname.includes(".")
      ? file.originalname.substring(file.originalname.lastIndexOf("."))
      : "";
    cb(null, `avatar_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Auth
router.post("/signup", signup);
router.post("/login", login);

// Forgot / reset password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Profile routes (protected)
router.get("/me", requireAuth, getProfile);
router.put("/me", requireAuth, updateProfile);

// Avatar upload (protected)
router.post("/avatar", requireAuth, upload.single("avatar"), uploadAvatar);

export default router;
