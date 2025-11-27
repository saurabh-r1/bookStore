// Frontend/src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

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

import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";

export default function App() {
  const [authUser] = useAuth();
  const location = useLocation();

  // for supporting login/signup as modal (optional)
  const state = location.state;
  const background = state && state.background;

  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen">
      {/* Main routes (normal pages) */}
      <Routes location={background || location}>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/course" element={<Courses />} />
        <Route path="/book/:id" element={<BookDetail />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />

        {/* Admin orders page */}
        <Route path="/admin/orders" element={<AdminOrders />} />

        {/* Full-page auth routes (if user navigates directly) */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      {/* Modal-style login/signup (when opened as dialog from background) */}
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
