// Frontend/src/components/Course.jsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Cards from "../components/Cards";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";

/**
 * Polished Courses page (frontend-first)
 * - Better UI (filters as chips, nice header, skeleton loader)
 * - Dummy data fallback (so page works without backend)
 * - Book details modal (client-side)
 * - Shows Free items to anonymous users, full list to logged-in users
 * - No duplicate footer (Navbar only)
 */

const DUMMY_BOOKS = [
  {
    id: "d1",
    name: "Intro to JavaScript",
    title: "Basics of JS — variables, functions, DOM.",
    price: 0,
    category: "Free",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=60&auto=format&fit=crop",
    description:
      "A short practical guide to JavaScript fundamentals. Build small scripts and manipulate the DOM.",
  },
  {
    id: "d2",
    name: "Advanced React Patterns",
    title: "Hooks, context, and performance optimizations.",
    price: 499,
    category: "Premium",
    image: "https://images.unsplash.com/photo-1526378723456-5e0f2c97f2c6?w=800&q=60&auto=format&fit=crop",
    description:
      "Deep dive into advanced React patterns used by production apps. Ideal after the basics.",
  },
  {
    id: "d3",
    name: "HTML & CSS Mastery",
    title: "Responsive layouts, modern CSS, flex & grid.",
    price: 0,
    category: "Free",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60&auto=format&fit=crop",
    description: "Practical approaches to layout and styling for modern web apps.",
  },
  {
    id: "d4",
    name: "Node.js Basics",
    title: "Backend fundamentals and APIs.",
    price: 299,
    category: "Premium",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60&auto=format&fit=crop",
    description: "Start building servers and REST APIs using Node.js and Express.",
  },
  {
    id: "d5",
    name: "Python for Beginners",
    title: "Syntax, data structures and mini projects.",
    price: 0,
    category: "Free",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=60&auto=format&fit=crop",
    description: "A friendly introduction to Python for total beginners.",
  },
  {
    id: "d6",
    name: "SQL Fundamentals",
    title: "Queries, joins and basic design.",
    price: 0,
    category: "Free",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60&auto=format&fit=crop",
    description: "Learn to read & write SQL for relational databases.",
  },
];

export default function Course() {
  const [authUser] = useAuth();

  // data
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); // all | Free | Premium
  const [sort, setSort] = useState("default"); // default | price-asc | price-desc
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // modal
  const [selected, setSelected] = useState(null);

  // try load from backend; fallback to dummy after short timeout
  useEffect(() => {
    let canceled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:4001/book", { timeout: 3000 });
        if (canceled) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setBooks(data.length ? data : DUMMY_BOOKS);
      } catch (err) {
        console.warn("Backend not available — using dummy books.", err?.message);
        setBooks(DUMMY_BOOKS);
        setError("Showing example books (backend not connected).");
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    load();
    return () => (canceled = true);
  }, []);

  // Listen to search from Navbar
  useEffect(() => {
    const handler = (e) => {
      setQ(e?.detail ?? "");
      setPage(1);
    };
    window.addEventListener("navbar-search", handler);
    return () => window.removeEventListener("navbar-search", handler);
  }, []);

  // derived filtered + sorted
  const processed = useMemo(() => {
    let arr = [...books];

    // auth: if not logged in, show only free
    if (!authUser) arr = arr.filter((b) => (b.category || "").toLowerCase() === "free");

    if (activeCategory !== "all") {
      arr = arr.filter((b) => (b.category || "").toLowerCase() === activeCategory.toLowerCase());
    }

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      arr = arr.filter(
        (b) =>
          (b.name || "").toLowerCase().includes(s) ||
          (b.title || "").toLowerCase().includes(s) ||
          (b.category || "").toLowerCase().includes(s)
      );
    }

    if (sort === "price-asc") arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sort === "price-desc") arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));

    return arr;
  }, [books, q, activeCategory, sort, authUser]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]); // reset page if filtering reduces pages

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return processed.slice(start, start + PAGE_SIZE);
  }, [processed, page]);

  // helper to open login modal
  const openLoginModal = () => {
    const dlg = document.getElementById("login_modal") || document.getElementById("my_modal_3");
    if (dlg && typeof dlg.showModal === "function") dlg.showModal();
    else if (dlg) dlg.setAttribute("open", "true");
    else window.location.href = "/signup";
  };

  return (
    <>
      <Navbar />

      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-24">

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Discover courses & books</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              {authUser
                ? "Full catalog available — explore and enroll."
                : "Showing free resources. Log in to unlock the full catalog."}
            </p>
          </div>

          <div className="flex items-center gap-3">

            {/* Category chips */}
            <div className="hidden md:flex items-center gap-2">
              {["all", "Free", "Premium"].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setActiveCategory(c);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeCategory === c
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border"
                  }`}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="select select-bordered h-10 dark:bg-slate-800 dark:text-white"
            >
              <option value="default">Sort</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>

            {!authUser && (
              <button onClick={openLoginModal} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                Log in
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 text-sm">
            {error}
          </div>
        )}

        {/* Books grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-lg h-72 p-4" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pageItems.length ? (
                pageItems.map((item) => (
                  <div
                    key={item._id || item.id || item.name}
                    className="cursor-pointer"
                    onClick={() => setSelected(item)}
                  >
                    <Cards item={item} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-300">
                  No books found for current filter.
                </div>
              )}
            </div>

            {/* pagination controls */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Showing {(page - 1) * PAGE_SIZE + 1} —{" "}
                {Math.min(page * PAGE_SIZE, processed.length || books.length)} of {processed.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-sm"
                >
                  Prev
                </button>
                <div className="px-3">Page {page} / {totalPages}</div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* Book Details Modal (simple) */}
        {selected && (
          <dialog id="book_detail" open className="modal">
            <div className="modal-box max-w-3xl rounded-2xl p-0 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={selected.image || "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=60&auto=format&fit=crop"}
                    alt={selected.name}
                    className="w-full h-full object-cover max-h-[420px]"
                  />
                </div>

                <div className="md:w-1/2 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{selected.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{selected.title}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-indigo-600">${selected.price ?? 0}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{selected.category}</div>
                    </div>
                  </div>

                  <p className="mt-4 text-slate-700 dark:text-slate-300">{selected.description}</p>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        // Buy or enroll: if user not logged in prompt login
                        if (!authUser) {
                          openLoginModal();
                        } else {
                          // placeholder action
                          alert(`Enrolled/purchased '${selected.name}' (dummy action).`);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                    >
                      {selected.price && Number(selected.price) > 0 ? `Buy - $${selected.price}` : "Enroll (Free)"}
                    </button>

                    <button
                      onClick={() => setSelected(null)}
                      className="px-4 py-2 border rounded-md"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </dialog>
        )}
      </div>
      {/* NO Footer here - single Footer appears site-wide */}
    </>
  );
}
