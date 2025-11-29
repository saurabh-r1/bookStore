// Frontend/src/components/ForgotPassword.jsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    setSending(true);
    try {
      const res = await api.post("/user/forgot-password", { email });
      const msg =
        res?.data?.message ||
        "If an account exists with this email, a reset link has been sent.";
      setSent(true);
      toast.success("Check your email for the reset link.");
      console.log("Forgot password:", msg);
    } catch (err) {
      console.error("Forgot password error:", err?.message);
      toast.error(
        err?.response?.data?.message || "Failed to send reset email."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-24 pb-16 dark:text-white">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow border border-slate-200 dark:border-slate-700 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            Forgot password
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Enter the email address associated with your account. If it exists,
            we&apos;ll send you a secure link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 input input-bordered w-full h-11 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              />
            </label>

            {sent && (
              <p className="text-xs text-green-600 dark:text-green-300">
                If an account exists with this email, a reset link has been
                sent. Please check your inbox (and spam folder).
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className={`mt-2 w-full py-2.5 rounded-lg font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow 
              ${sending ? "opacity-80 cursor-wait" : ""}`}
            >
              {sending ? "Sending link..." : "Send reset link"}
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 text-center">
            Remembered your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-pink-500 hover:underline font-medium"
            >
              Back to login
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
