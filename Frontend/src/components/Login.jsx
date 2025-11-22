import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";


export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [remember, setRemember] = useState(
    localStorage.getItem("remember") === "true"
  );

  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef(null);

  useEffect(() => {
    const dialog = document.getElementById("login_modal");
    if (!dialog) return;
    const onShow = () => setTimeout(() => emailRef.current?.focus(), 60);
    dialog.addEventListener("show", onShow);

    const remEmail = localStorage.getItem("rememberEmail");
    if (remEmail) {
      setForm((p) => ({ ...p, email: remEmail }));
    }

    return () => dialog.removeEventListener("show", onShow);
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const closeModal = () => {
    const dialog = document.getElementById("login_modal");
    dialog?.close();
  };

  const openSignup = () => {
    closeModal();
    const dialog = document.getElementById("signup_modal");
    dialog?.showModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post("/user/login", form);
      const { user, token, message } = res.data;

      setAuthUser(user);

      if (remember) {
        localStorage.setItem("Users", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("remember", "true");
        localStorage.setItem("rememberEmail", user.email || form.email);
        sessionStorage.removeItem("Users");
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("Users", JSON.stringify(user));
        sessionStorage.setItem("token", token);
        localStorage.removeItem("Users");
        localStorage.removeItem("token");
        localStorage.removeItem("remember");
        localStorage.removeItem("rememberEmail");
      }

      toast.success(message || "Logged in");
      closeModal();
      navigate("/course");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id="login_modal" className="modal">
      <form
        className="modal-box max-w-sm rounded-2xl p-0 overflow-hidden shadow-2xl transition-all"
        onSubmit={handleSubmit}
        role="dialog"
        aria-labelledby="login-modal-title"
      >
        <div className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-pink-500 to-pink-400">
          <div className="flex items-start justify-between">
            <div>
              <h3
                id="login-modal-title"
                className="text-white text-lg font-semibold"
              >
                Welcome back
              </h3>
              <p className="text-indigo-100 text-sm mt-1">
                Sign in to continue
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close login"
              className="text-white opacity-90 hover:opacity-100 rounded-full p-1 -mr-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Email
              </span>
              <input
                ref={emailRef}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-2 input input-bordered w-full rounded-lg h-11 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:ring-4 focus:ring-indigo-200"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </label>

            <label className="block">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Password
                </span>
                <small className="text-xs text-slate-400">
                  min 6 characters
                </small>
              </div>

              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
              />
            </label>

            <div className="flex items-center justify-between text-sm mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRemember(checked);
                    if (checked) localStorage.setItem("remember", "true");
                    else localStorage.removeItem("remember");
                  }}
                  className="checkbox checkbox-sm border-slate-400 dark:border-slate-600"
                />
                <span className="text-slate-600 dark:text-slate-300">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() =>
                  toast("Password reset is not configured yet.")
                }
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full py-3 rounded-lg font-medium bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow hover:scale-[1.01] transition transform focus:outline-none focus:ring-4 focus:ring-pink-200"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
            Don't have an account?{" "}
            <button
              onClick={openSignup}
              type="button"
              className="text-pink-500 font-medium hover:underline"
            >
              Create one
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

function PasswordInput({ name, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="Your password"
          className="mt-2 input input-bordered w-full rounded-lg h-11 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:ring-4 focus:ring-indigo-200"
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-3 text-sm text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
  );
}
