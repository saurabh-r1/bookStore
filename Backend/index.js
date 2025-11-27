// Backend/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import bookRoute from "./route/book.route.js";
import userRoute from "./route/user.route.js";
import orderRoute from "./route/order.route.js";
import paymentRoute from "./route/payment.route.js";

dotenv.config();

const app = express();

// Simple logger
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`${now} ${req.method} ${req.url}`);
  next();
});

// CORS for Vite frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// static uploads (for avatar etc.)
app.use("/uploads", express.static("uploads"));

// API routes
app.use("/book", bookRoute);
app.use("/user", userRoute);
app.use("/orders", orderRoute);
app.use("/payments", paymentRoute);

// DB connect
const PORT = process.env.PORT || 4001;
const URI = process.env.MongoDBURI;

mongoose
  .connect(URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
  });
