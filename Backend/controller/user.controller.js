// Backend/controller/user.controller.js
import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";

export const signup = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "fullname, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    const createdUser = new User({
      fullname,
      email,
      password: hashPassword,
    });

    await createdUser.save();

    const userSafe = { _id: createdUser._id, fullname: createdUser.fullname, email: createdUser.email };
    return res.status(201).json({ message: "User created successfully", user: userSafe });
  } catch (error) {
    console.error("signup error:", error && error.stack ? error.stack : error);
    // if it's a mongoose duplicate key error (just in case)
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Email already registered (duplicate key)" });
    }
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    // safe check: user might be null
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const userSafe = { _id: user._id, fullname: user.fullname, email: user.email };
    return res.status(200).json({ message: "Login successful", user: userSafe });
  } catch (error) {
    console.error("login error:", error && error.stack ? error.stack : error);
    return next(error);
  }
};
