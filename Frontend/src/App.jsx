// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./home/Home";
import Courses from "./courses/Courses";
import About from "./components/About";

import Signup from "./components/Signup";
import Login from "./components/Login";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import Contact from "./components/Contact";


export default function App() {
  const [authUser] = useAuth();

  // React Router "modal routes" pattern:
  // if location.state.background exists, then the current location is a modal opened over background.
  // otherwise background will be undefined and the modal route will render as a normal page.
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    <>
      <div className="dark:bg-slate-900 dark:text-white min-h-screen">
        {/* Primary routes render using background location when modal is open */}
        <Routes location={background || location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />


          <Route path="/course" element={authUser ? <Courses /> : <LoginRedirect />} />
          {/* If user navigates directly to /signup or /login, the same components render as pages */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        {/* When background is set, render modal routes over the current screen */}
        {background && (
          <Routes>
            <Route path="/login" element={<Login isModal />} />
            <Route path="/signup" element={<Signup isModal />} />
          </Routes>
        )}

        <Toaster />
      </div>
    </>
  );
}

// helper used when protected route requires login — send user to login modal over current page
function LoginRedirect() {
  // This component will navigate to /login preserving background; but to keep App simple we
  // will instead render a small redirect anchor. You may implement a Navigate() here if needed.
  return <div className="p-8">Please login to view courses. Use the Login button in the navbar.</div>;
}
