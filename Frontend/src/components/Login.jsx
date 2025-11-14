// src/components/Login.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider"; // <- important

function Login() {
  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const userInfo = { email: data.email, password: data.password };
      const res = await axios.post("http://localhost:4001/user/login", userInfo);

      console.log("login response:", res.data);

      if (res.data?.user) {
        // store to localStorage and update context immediately
        localStorage.setItem("Users", JSON.stringify(res.data.user));
        setAuthUser(res.data.user);

        toast.success("Logged in successfully");

        // close modal safely if exists
        const dialog = document.getElementById("my_modal_3");
        if (dialog && typeof dialog.close === "function") dialog.close();

        // optional: navigate to saved 'from' or homepage
        navigate("/", { replace: true });
      } else {
        toast.error("Login failed: invalid response from server");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        toast.error("Error: " + err.response.data.message);
      } else {
        toast.error("Login failed. Check console/network.");
      }
    }
  };

  return (
    <div>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form onSubmit={handleSubmit(onSubmit)} method="dialog">
            <Link
              to="/"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                const d = document.getElementById("my_modal_3");
                if (d && typeof d.close === "function") d.close();
              }}
            >
              ✕
            </Link>

            <h3 className="font-bold text-lg">Login</h3>

            <div className="mt-4 space-y-2">
              <span>Email</span>
              <br />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-80 px-3 py-1 border rounded-md outline-none"
                {...register("email", { required: true })}
              />
              {errors.email && (
                <div className="text-sm text-red-500">This field is required</div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <span>Password</span>
              <br />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-80 px-3 py-1 border rounded-md outline-none"
                {...register("password", { required: true })}
              />
              {errors.password && (
                <div className="text-sm text-red-500">This field is required</div>
              )}
            </div>

            <div className="flex justify-around mt-6">
              <button className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200">
                Login
              </button>
              <p>
                Not registered?{" "}
                <Link to="/signup" className="underline text-blue-500 cursor-pointer">
                  Signup
                </Link>
              </p>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}

export default Login;
