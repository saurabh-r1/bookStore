// Backend/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import bookRoute from "./route/book.route.js";
import userRoute from "./route/user.route.js";
import orderRoute from "./route/order.route.js"; // ✅ add this

dotenv.config();

const app = express();

// basic logger (optional)
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`${now} ${req.method} ${req.url}`);
  next();
});

// CORS
app.use(
  cors({
    origin: "http://localhost:5173", // your Vite frontend
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// serve uploaded files
app.use("/uploads", express.static("uploads"));

// routes
app.use("/book", bookRoute);
app.use("/user", userRoute);
app.use("/orders", orderRoute); // ✅ mount orders

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
