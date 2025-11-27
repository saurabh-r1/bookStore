// Frontend/src/App.jsx
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Home from "./home/Home";
import Courses from "./components/Course";
import About from "./components/About";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Contact from "./components/Contact";
import BookDetail from "./components/BookDetail";
import Cart from "./components/Cart";
import Profile from "./components/Profile";
import Orders from "./components/Orders";
import AdminOrders from "./components/AdminOrders";
import Payments from "./components/Payments";      // ⬅ NEW
import Analytics from "./components/Analytics";    // ⬅ NEW

import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";

export default function App() {
  const [authUser] = useAuth();
  const location = useLocation();

  // for modal-based login/signup
  const state = location.state;
  const background = state && state.background;

  const isAdmin = authUser?.role === "admin";

  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen">
      {/* Main routes */}
      <Routes location={background || location}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/course" element={<Courses />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />

        {/* Admin protected routes */}
        <Route
          path="/admin/orders"
          element={isAdmin ? <AdminOrders /> : <Navigate to="/" replace />}
        />
        <Route
          path="/admin/payments"
          element={isAdmin ? <Payments /> : <Navigate to="/" replace />}
        />
        <Route
          path="/admin/analytics"
          element={isAdmin ? <Analytics /> : <Navigate to="/" replace />}
        />

        {/* Auth */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      {/* Modal login/signup (if opened as overlay) */}
      {background && (
        <Routes>
          <Route path="/login" element={<Login isModal />} />
          <Route path="/signup" element={<Signup isModal />} />
        </Routes>
      )}

      <Toaster />
    </div>
  );
}
