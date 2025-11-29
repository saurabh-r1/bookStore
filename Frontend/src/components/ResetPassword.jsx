// Frontend/src/components/ResetPassword.jsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Reset link is invalid or missing.");
      return;
    }

    if (!password || !confirm) {
      toast.error("Please fill both password fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/user/reset-password", {
        token,
        password,
      });

      toast.success(
        res?.data?.message ||
          "Password reset successful. Please log in with your new password."
      );
      navigate("/login");
    } catch (err) {
      console.error("Reset password error:", err?.message);
      toast.error(
        err?.response?.data?.message || "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  const disabledToken = !token;

  return (
    <>
      <Navbar />

      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-24 pb-16 dark:text-white">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow border border-slate-200 dark:border-slate-700 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            Set a new password
          </h1>

          {disabledToken && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">
              This reset link is invalid or expired. Please request a new one
              from the forgot password page.
            </p>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Choose a strong password that you don&apos;t use anywhere else.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                New password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-2 input input-bordered w-full h-11 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
                disabled={disabledToken}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Confirm new password
              </span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it again"
                className="mt-2 input input-bordered w-full h-11 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
                disabled={disabledToken}
              />
            </label>

            <button
              type="submit"
              disabled={loading || disabledToken}
              className={`mt-2 w-full py-2.5 rounded-lg font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow 
              ${(loading || disabledToken) ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Updating password..." : "Update password"}
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 text-center">
            Back to{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-pink-500 hover:underline font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
