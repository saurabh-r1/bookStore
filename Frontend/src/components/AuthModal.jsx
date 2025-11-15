import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import api from "../axiosInstance";

/**
 * Login-only modal.
 * - "Create one" button -> navigate to /signup
 * - On modal close (✕ or dialog close event) -> navigate to /
 */
export default function AuthModal() {
  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dialogRef = useRef(null);

  useEffect(() => {
    const dlg = document.getElementById("auth_modal");
    dialogRef.current = dlg;

    // If the dialog is closed by clicking outside or using ESC, navigate to home
    const onClose = () => {
      // only navigate if not already on home
      if (window.location.pathname !== "/") {
        navigate("/");
      }
    };

    if (dlg) {
      dlg.addEventListener("close", onClose);
    }

    return () => {
      if (dlg) dlg.removeEventListener("close", onClose);
    };
  }, [navigate]);

  const closeModalSafe = () => {
    const d = document.getElementById("auth_modal");
    if (d && typeof d.close === "function") d.close();
    // ensure redirect to home
    navigate("/");
  };

  const openSignupRoute = () => {
    // close modal and navigate to /signup
    const d = document.getElementById("auth_modal");
    if (d && typeof d.close === "function") d.close();
    navigate("/signup");
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/user/login", { email: data.email, password: data.password });
      if (res.data?.user) {
        const user = res.data.user;
        localStorage.setItem("Users", JSON.stringify(user));
        setAuthUser(user);
        toast.success("Logged in successfully");
        // close modal and navigate to 'from'
        const d = document.getElementById("auth_modal");
        if (d && typeof d.close === "function") d.close();
        navigate(from, { replace: true });
        reset();
      } else {
        toast.error("Unexpected server response");
        console.error("login response", res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Check credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id="auth_modal" className="modal">
      <div className="modal-box w-full max-w-md p-0 overflow-hidden">
        <div className="bg-pink-500 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Sign in</h3>
            <p className="text-xs opacity-90">Login to continue</p>
          </div>
          <button
            aria-label="Close"
            className="btn btn-ghost btn-sm text-white"
            onClick={closeModalSafe}
          >
            ✕
          </button>
        </div>

        <div className="p-6 bg-base-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label"><span className="label-text">Email</span></label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email" } })}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label"><span className="label-text">Password</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="input input-bordered w-full pr-12"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm"
                  onClick={() => setShowPassword(s => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" className={`btn btn-block bg-pink-500 text-white ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-sm mt-3">
              New here?{" "}
              <button type="button" className="text-pink-500 font-medium hover:underline" onClick={openSignupRoute}>
                Create one
              </button>
            </p>
          </form>
        </div>
      </div>
    </dialog>
  );
}
