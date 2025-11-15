// Backend/route/book.route.js
import express from "express";
import { getBook, seedBooks } from "../controller/book.controller.js";

const router = express.Router();

router.get("/", getBook);
// dev-only endpoint to populate DB quickly
router.post("/seed", seedBooks);

export default router;
