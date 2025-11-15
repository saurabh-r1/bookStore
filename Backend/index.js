// Backend/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bookRoute from "./route/book.route.js";
import userRoute from "./route/user.route.js";

dotenv.config();

const app = express();

// Basic request logger (prints method + path)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// CORS - allow your frontend origin (Vite default 5173)
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/book", bookRoute);
app.use("/user", userRoute);

// Simple healthcheck
app.get("/", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Global error handler - returns stack in dev
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    // show stack in dev mode
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
});

const PORT = process.env.PORT || 4001;
const URI = process.env.MongoDBURI || "mongodb://127.0.0.1:27017/bookstore";

async function start() {
  try {
    await mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to mongoDB");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

start();
