// Frontend/src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./home/Home";
import Courses from "./components/Course";          // course listing
import About from "./components/About";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Contact from "./components/Contact";
import BookDetail from "./components/BookDetail";  // single book page
import Cart from "./components/Cart";              // 🛒 cart page
import { Toaster } from "react-hot-toast";

export default function App() {
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen">
      {/* MAIN ROUTES */}
      <Routes location={background || location}>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Books listing */}
        <Route path="/course" element={<Courses />} />

        {/* Book details page */}
        <Route path="/book/:id" element={<BookDetail />} />

        {/* Cart page */}
        <Route path="/cart" element={<Cart />} />

        {/* Auth as standalone pages */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      {/* If you ever open login/signup as modal over background */}
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
