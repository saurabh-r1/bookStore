// Frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./home/Home";
import Course from "./components/Course";
import About from "./components/About";
import Contact from "./components/Contact";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";

export default function App() {
  const [authUser] = useAuth();

  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected route: show message if not logged in */}
        <Route
          path="/course"
          element={authUser ? <Course /> : <LoginRedirect />}
        />

        {/* Fallback: any unknown route -> Home */}
        <Route path="*" element={<Home />} />
      </Routes>

      <Toaster />
    </div>
  );
}

// Shown when user tries to open /course without logging in
function LoginRedirect() {
  return (
    <div className="pt-24 max-w-screen-md mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Login required</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-4">
        Please use the <strong>Login</strong> button in the top navbar to sign
        in and access all courses and books.
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        You can still explore free resources from the home page.
      </p>
    </div>
  );
}
