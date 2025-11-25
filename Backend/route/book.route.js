import express from "express";
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controller/book.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getBooks);
router.get("/:id", getBookById);

// ADMIN ONLY
router.post("/", requireAuth, requireAdmin, createBook);
router.put("/:id", requireAuth, requireAdmin, updateBook);
router.delete("/:id", requireAuth, requireAdmin, deleteBook);

export default router;
