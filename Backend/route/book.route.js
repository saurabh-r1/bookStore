// Backend/route/book.route.js
import express from "express";
import {
  getBook,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controller/book.controller.js";

const router = express.Router();

// GET all books
router.get("/", getBook);

// GET single book by id
router.get("/:id", getBookById);

// CREATE book
router.post("/", createBook);

// UPDATE book
router.put("/:id", updateBook);

// DELETE book
router.delete("/:id", deleteBook);

export default router;
