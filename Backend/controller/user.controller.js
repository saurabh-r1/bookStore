// Backend/controller/user.controller.js
import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

// helper: create auth token
const createToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
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
      // role: "user" by default
    });

    await createdUser.save();

    const token = createToken(createdUser);

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: createdUser._id,
        fullname: createdUser.fullname,
        email: createdUser.email,
        role: createdUser.role,
        createdAt: createdUser.createdAt,
        avatarUrl: createdUser.avatarUrl,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid email or password" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid email or password" });
    }

    const token = createToken(user);

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get current user's profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// update basic profile info (currently only fullname)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { fullname } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!fullname || !fullname.trim()) {
      return res.status(400).json({ message: "Full name is required" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { fullname: fullname.trim() },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated",
      user: {
        _id: updated._id,
        fullname: updated.fullname,
        email: updated.email,
        role: updated.role,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        avatarUrl: updated.avatarUrl,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Avatar upload
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const updated = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Avatar updated",
      user: {
        _id: updated._id,
        fullname: updated.fullname,
        email: updated.email,
        role: updated.role,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        avatarUrl: updated.avatarUrl,
      },
    });
  } catch (err) {
    console.error("Upload avatar error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ========== FORGOT PASSWORD ========== */

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("🔹 Forgot password request for:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists
      return res.status(200).json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    console.log("   → User found:", user._id.toString());

    // Create a short-lived reset token
    const resetToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    console.log("   → Reset URL:", resetUrl);

    // If there is no SMTP config, or in dev, just return the link in response
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(
        "   ⚠ No EMAIL_USER/PASS set – returning resetUrl in response (dev mode)."
      );
      return res.status(200).json({
        message:
          "Password reset link (dev mode). Configure email to send real emails.",
        resetUrl,
      });
    }

    // Try to send the email. If it fails (like Gmail auth), still return resetUrl.
    try {
      const html = `
        <div style="background-color:#f3f4f6;padding:24px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="max-width:480px;margin:0 auto;background:white;border-radius:12px;padding:24px 24px 28px;border:1px solid #e5e7eb;">
            <div style="text-align:center;margin-bottom:18px;">
              <div style="font-size:22px;font-weight:800;letter-spacing:0.12em;color:#111827;text-transform:uppercase;">
                The <span style="color:#4f46e5;">Page</span> <span style="color:#22c55e;">Hub</span>
              </div>
              <div style="font-size:11px;letter-spacing:0.2em;color:#6b7280;margin-top:4px;">BOOKSTORE</div>
            </div>

            <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:8px;">
              Reset your password
            </h2>
            
            <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 10px;">
              Hi <strong>${user.fullname || ""}</strong>,
            </p>
            
            <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 16px;">
              We received a request to reset the password for your account on <strong>The Page Hub</strong>.
              Click the button below to choose a new password. This link will be valid for 1 hour.
            </p>

            <div style="text-align:center;margin:24px 0;">
              <a href="${resetUrl}"
                style="
                  display:inline-block;
                  padding:10px 24px;
                  background:linear-gradient(135deg,#4f46e5,#ec4899);
                  color:white;
                  font-size:14px;
                  font-weight:600;
                  border-radius:999px;
                  text-decoration:none;
                "
              >
                Reset password
              </a>
            </div>

            <p style="font-size:12px;color:#6b7280;line-height:1.6;margin:0 0 10px;">
              Or copy and paste this link into your browser:
            </p>

            <p style="font-size:11px;color:#4b5563;word-break:break-all;margin:0 0 18px;">
              <a href="${resetUrl}" style="color:#4f46e5;text-decoration:underline;">${resetUrl}</a>
            </p>

            <p style="font-size:12px;color:#6b7280;line-height:1.6;margin:0 0 8px;">
              If you did not request a password reset, you can safely ignore this email. 
              Your password will remain unchanged.
            </p>

            <p style="font-size:12px;color:#9ca3af;margin-top:16px;">
              — The Page Hub Team
            </p>
          </div>
          <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px;">
            You received this email because a password reset was requested for your account.
          </p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: "Reset your password – The Page Hub",
        html,
        text: `Reset your password: ${resetUrl}`,
      });

      return res.status(200).json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    } catch (emailErr) {
      console.error(
        "   ⚠ Email sending failed, returning resetUrl in response (dev mode):",
        emailErr
      );
      return res.status(200).json({
        message:
          "Email could not be sent (dev mode). Use this link to reset your password.",
        resetUrl,
      });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Failed to send reset email." });
  }
};

/* ========== RESET PASSWORD ========== */

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or expired." });
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be at least 6 characters." });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    user.password = hashPassword;
    await user.save();

    return res.status(200).json({
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Failed to reset password." });
  }
};
