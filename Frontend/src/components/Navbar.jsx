// Frontend/src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Logout from "./Logout";
import { useAuth } from "../context/AuthProvider";

function Navbar() {
  const [authUser] = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // apply theme
  useEffect(() => {
    const element = document.documentElement;
    if (theme === "dark") {
      element.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      element.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // open login modal helper (only login_modal now)
  const openLogin = () => {
    const dialog = document.getElementById("login_modal");
    if (!dialog) {
      console.warn(
        'Login dialog not found. Ensure <Login /> renders <dialog id="login_modal">.'
      );
      return;
    }

    try {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "true");
      }
    } catch (err) {
      console.error("Failed to open login dialog:", err);
      dialog.setAttribute("open", "true");
    }
  };

  // Broadcast search value to the app
  const broadcastSearch = (q) => {
    const ev = new CustomEvent("navbar-search", { detail: q });
    window.dispatchEvent(ev);
  };

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearch(v);
    broadcastSearch(v);
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter") {
      const q = search.trim();
      broadcastSearch(q);
      navigate("/course");
    }
  };

  // active link helper
  const linkClass = (path) => {
    const base = "px-2 py-1 rounded-md";
    const active =
      location.pathname === path ||
      (path === "/course" && location.pathname.startsWith("/course"))
        ? "font-semibold text-indigo-600 dark:text-indigo-400"
        : "text-slate-700 dark:text-slate-300";
    return `${base} ${active}`;
  };

  const navItems = (
    <>
      <li>
        <Link to="/" className={linkClass("/")}>
          Home
        </Link>
      </li>

      <li>
        {authUser ? (
          <Link to="/course" className={linkClass("/course")}>
            Course
          </Link>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              openLogin();
            }}
            className={`${linkClass(
              "/course"
            )} cursor-pointer bg-transparent border-0`}
          >
            Course
          </button>
        )}
      </li>

      <li>
        <Link to="/contact" className={linkClass("/contact")}>
          Contact
        </Link>
      </li>

      <li>
        <Link to="/about" className={linkClass("/about")}>
          About
        </Link>
      </li>
    </>
  );

  return (
    <>
      <div
        className={`max-w-screen-2xl container mx-auto md:px-20 px-4 fixed top-0 left-0 right-0 z-50
        bg-white/95 dark:bg-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700
        ${
          sticky ? "shadow-md transition-all duration-300 ease-in-out" : ""
        }`}
      >
        <div className="navbar">
          <div className="navbar-start">
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                {navItems}
              </ul>
            </div>

            <Link to="/" className="flex flex-col leading-snug">
              <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                The <span className="text-indigo-600">Page</span>{" "}
                <span className="text-green-500">Hub</span>
              </span>

              <span className="text-[11px] tracking-[0.15em] text-slate-500 dark:text-slate-300">
                BOOKSTORE
              </span>
            </Link>
          </div>

          <div className="navbar-end space-x-3">
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1">{navItems}</ul>
            </div>

            <div className="hidden md:block">
              <label className="px-3 py-2 border rounded-md flex items-center gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKey}
                  className="grow outline-none rounded-md px-3 dark:bg-slate-900 dark:text-white bg-white text-slate-800"
                  placeholder="Search title, topic or category"
                  aria-label="Site search"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
            </div>

            <label className="swap swap-rotate">
              {/* controlled checkbox */}
              <input
                type="checkbox"
                className="theme-controller"
                checked={theme === "dark"}
                onChange={() =>
                  setTheme((t) => (t === "dark" ? "light" : "dark"))
                }
              />

              {/* sun (shown when NOT checked = light mode) */}
              <svg
                className="swap-off fill-current w-7 h-7 cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>

              {/* moon (shown when checked = dark mode) */}
              <svg
                className="swap-on fill-current w-7 h-7 cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
            </label>

            {authUser ? (
              <Logout />
            ) : (
              <div>
                <button
                  className="bg-black text-white px-3 py-2 rounded-md hover:bg-slate-800 duration-300 cursor-pointer"
                  onClick={openLogin}
                >
                  Login
                </button>
                <Login />
                <Signup />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
