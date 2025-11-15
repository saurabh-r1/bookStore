// Frontend/src/components/Signup.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ fullname: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const nameRef = useRef(null);

  useEffect(() => {
    const dialog = document.getElementById("signup_modal");
    if (!dialog) return;
    const onShow = () => setTimeout(() => nameRef.current?.focus(), 60);
    dialog.addEventListener("show", onShow);
    return () => dialog.removeEventListener("show", onShow);
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullname) e.fullname = "Full name required";
    if (!form.email) e.email = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password required";
    else if (form.password.length < 6) e.password = "Password must be 6+ characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const closeModal = () => {
    const dialog = document.getElementById("signup_modal");
    dialog?.close();
  };

  const openLogin = () => {
    closeModal();
    const dialog = document.getElementById("login_modal");
    dialog?.showModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4001/user/signup", form);

      setAuthUser(res.data.user);
      localStorage.setItem("Users", JSON.stringify(res.data.user));

      toast.success(res.data.message || "Account created");
      closeModal();
      navigate("/course");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id="signup_modal" className="modal">
      <form className="modal-box max-w-sm rounded-2xl p-0 overflow-hidden shadow-2xl" onSubmit={handleSubmit}>

        {/* header stripe */}
        <div className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-pink-500 to-pink-400">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white text-lg font-semibold">Create account</h3>
              <p className="text-indigo-100 text-sm mt-1">Get started in seconds</p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              aria-label="Close signup"
              className="text-white opacity-90 hover:opacity-100 rounded-full p-1 -mr-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800">
          <div className="space-y-4">

            {/* FULL NAME */}
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Full name</span>
              <input
                ref={nameRef}
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                placeholder="Your name"
                className="mt-2 input input-bordered w-full rounded-lg h-11 
                  bg-white dark:bg-slate-900 
                  text-slate-800 dark:text-slate-100
                  border-slate-300 dark:border-slate-700
                  focus:ring-4 focus:ring-indigo-200"
                aria-invalid={!!errors.fullname}
              />
              {errors.fullname && <p className="text-xs text-red-500 mt-1">{errors.fullname}</p>}
            </label>

            {/* EMAIL */}
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-2 input input-bordered w-full rounded-lg h-11 
                  bg-white dark:bg-slate-900 
                  text-slate-800 dark:text-slate-100
                  border-slate-300 dark:border-slate-700
                  focus:ring-4 focus:ring-indigo-200"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </label>

            {/* PASSWORD */}
            <label className="block">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
                <small className="text-xs text-slate-400">Use 6+ characters</small>
              </div>

              <PasswordInputSignup
                name="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
              />
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="mt-6 w-full py-3 rounded-lg font-medium 
              bg-gradient-to-r from-indigo-600 to-pink-500 
              text-white shadow hover:scale-[1.01] 
              transition transform focus:outline-none focus:ring-4 focus:ring-pink-200"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>

          {/* FOOTER LINK */}
          <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
            Already have an account?{" "}
            <button onClick={openLogin} type="button" className="text-pink-500 font-medium hover:underline">
              Log in
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

function PasswordInputSignup({ name, value, onChange, error }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="Create a password"
          className="mt-2 input input-bordered w-full rounded-lg h-11
            bg-white dark:bg-slate-900 
            text-slate-800 dark:text-slate-100
            border-slate-300 dark:border-slate-700
            focus:ring-4 focus:ring-indigo-200"
          aria-invalid={!!error}
        />
        <button
          type="button"
          className="absolute right-3 top-3 text-sm 
            text-slate-500 dark:text-slate-300 
            hover:text-slate-700 dark:hover:text-white"
          onClick={() => setShow((s) => !s)}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
  );
}
