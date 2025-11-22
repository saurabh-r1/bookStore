// Frontend/src/components/Course.jsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Cards from "../components/Cards";
import { useAuth } from "../context/AuthProvider";
import api from "../api/axiosInstance";

/**
 * Courses page with:
 * - Filters, sorting, pagination
 * - Dummy data fallback if backend is not available
 * - Book details modal
 * - ROLE-BASED:
 *     - Admin: no Buy button, can Add / Edit / Delete courses
 *     - Normal user: can view and Buy/Enroll
 */

const DUMMY_BOOKS = [
  {
    id: "d1",
    name: "Intro to JavaScript",
    title: "Basics of JS — variables, functions, DOM.",
    price: 0,
    category: "Free",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=60&auto=format&fit=crop",
    description:
      "A short practical guide to JavaScript fundamentals. Build small scripts and manipulate the DOM.",
  },
  {
    id: "d2",
    name: "Advanced React Patterns",
    title: "Hooks, context, and performance optimizations.",
    price: 499,
    category: "Premium",
    image:
      "https://images.unsplash.com/photo-1526378723456-5e0f2c97f2c6?w=800&q=60&auto=format&fit=crop",
    description:
      "Deep dive into advanced React patterns used by production apps. Ideal after the basics.",
  },
  {
    id: "d3",
    name: "HTML & CSS Mastery",
    title: "Responsive layouts, modern CSS, flex & grid.",
    price: 0,
    category: "Free",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60&auto=format&fit=crop",
    description:
      "Practical approaches to layout and styling for modern web apps.",
  },
  {
    id: "d4",
    name: "Node.js Basics",
    title: "Backend fundamentals and APIs.",
    price: 299,
    category: "Premium",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60&auto=format&fit=crop",
    description: "Start building servers and REST APIs using Node.js and Express.",
  },
  {
    id: "d5",
    name: "Python for Beginners",
    title: "Syntax, data structures and mini projects.",
    price: 0,
    category: "Free",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=60&auto=format&fit=crop",
    description: "A friendly introduction to Python for total beginners.",
  },
  {
    id: "d6",
    name: "SQL Fundamentals",
    title: "Queries, joins and basic design.",
    price: 0,
    category: "Free",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60&auto=format&fit=crop",
    description: "Learn to read & write SQL for relational databases.",
  },
];

export default function Course() {
  const [authUser] = useAuth();
  const isAdmin = authUser?.role === "admin";

  // data
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [backendLive, setBackendLive] = useState(false);

  // UI state
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); // all | Free | Premium
  const [sort, setSort] = useState("default"); // default | price-asc | price-desc
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // modal: details
  const [selected, setSelected] = useState(null);

  // modal: admin create/edit form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = creating new
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Free",
    image: "",
    title: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  // try load from backend; fallback to dummy after short timeout
  useEffect(() => {
    let canceled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/book", { timeout: 3000 });
        if (canceled) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        if (data.length) {
          setBooks(data);
          setBackendLive(true);
        } else {
          setBooks(DUMMY_BOOKS);
          setBackendLive(false);
        }
      } catch (err) {
        console.warn("Backend not available — using dummy books.", err?.message);
        setBooks(DUMMY_BOOKS);
        setError("Showing example books (backend not connected).");
        setBackendLive(false);
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

    // if not logged in, show only Free
    if (!authUser) {
      arr = arr.filter((b) => (b.category || "").toLowerCase() === "free");
    }

    if (activeCategory !== "all") {
      arr = arr.filter(
        (b) => (b.category || "").toLowerCase() === activeCategory.toLowerCase()
      );
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

    if (sort === "price-asc")
      arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sort === "price-desc")
      arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));

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

  // helper to open login modal for normal users
  const openLoginModal = () => {
    const dlg = document.getElementById("login_modal") || document.getElementById("my_modal_3");
    if (dlg && typeof dlg.showModal === "function") dlg.showModal();
    else if (dlg) dlg.setAttribute("open", "true");
    else window.location.href = "/signup";
  };

  // ===== ADMIN: open form for create / edit =====
  const openCreateForm = () => {
    if (!backendLive) {
      alert("Backend not connected. Admin create/update works only when API is running.");
      return;
    }
    setEditing(null);
    setForm({
      name: "",
      price: "",
      category: "Free",
      image: "",
      title: "",
      description: "",
    });
    setShowForm(true);
  };

  const openEditForm = (book) => {
    if (!backendLive) {
      alert("Backend not connected. Admin edit works only when API is running.");
      return;
    }
    setEditing(book);
    setForm({
      name: book.name || "",
      price: book.price ?? "",
      category: book.category || "General",
      image: book.image || "",
      title: book.title || "",
      description: book.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (book) => {
    if (!backendLive) {
      alert("Backend not connected. Delete works only when API is running.");
      return;
    }
    const id = book._id || book.id;
    if (!id) {
      alert("Cannot delete this item (no id).");
      return;
    }
    if (!window.confirm(`Delete "${book.name}"?`)) return;

    try {
      await api.delete(`/book/${id}`);
      setBooks((prev) => prev.filter((b) => (b._id || b.id) !== id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete book.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!backendLive) {
      alert("Backend not connected. Save works only when API is running.");
      return;
    }

    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    setSaving(true);
    try {
      if (editing && (editing._id || editing.id)) {
        // UPDATE
        const id = editing._id || editing.id;
        const res = await api.put(`/book/${id}`, {
          ...form,
          price: Number(form.price) || 0,
        });
        const updated = res.data.book;
        setBooks((prev) =>
          prev.map((b) =>
            (b._id || b.id) === (updated._id || updated.id) ? updated : b
          )
        );
      } else {
        // CREATE
        const res = await api.post("/book", {
          ...form,
          price: Number(form.price) || 0,
        });
        const created = res.data.book;
        setBooks((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save book.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-24">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Discover courses & books
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              {authUser
                ? isAdmin
                  ? "You are logged in as Admin — manage catalog below."
                  : "Full catalog available — explore and enroll."
                : "Showing free resources. Log in to unlock the full catalog."}
            </p>
            {!backendLive && (
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                Backend not reachable — using sample data. Admin actions need backend running.
              </p>
            )}
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
              <button
                onClick={openLoginModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Log in
              </button>
            )}

            {/* ADMIN: Add course button */}
            {isAdmin && (
              <button
                onClick={openCreateForm}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
              >
                + Add Course
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
              <div
                key={i}
                className="animate-pulse bg-white dark:bg-slate-800 rounded-lg h-72 p-4"
              />
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
                    <Cards
                      item={item}
                      onEdit={isAdmin ? openEditForm : undefined}
                      onDelete={isAdmin ? handleDelete : undefined}
                    />
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
                {Math.min(page * PAGE_SIZE, processed.length || books.length)} of{" "}
                {processed.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-sm"
                >
                  Prev
                </button>
                <div className="px-3">
                  Page {page} / {totalPages}
                </div>
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

        {/* Book Details Modal (for all users) */}
        {selected && (
          <dialog id="book_detail" open className="modal">
            <div className="modal-box max-w-3xl rounded-2xl p-0 overflow-hidden bg-white text-slate-900">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={
                      selected.image ||
                      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=60&auto=format&fit=crop"
                    }
                    alt={selected.name}
                    className="w-full h-full object-cover max-h-[420px]"
                  />
                </div>

                <div className="md:w-1/2 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{selected.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {selected.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-indigo-600">
                        ${selected.price ?? 0}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selected.category}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-slate-700">
                    {selected.description}
                  </p>

                  <div className="mt-6 flex gap-3">
                    {/* If normal user: buy/enroll; if admin: just info */}
                    {!isAdmin && (
                      <button
                        onClick={() => {
                          if (!authUser) {
                            openLoginModal();
                          } else {
                            alert(
                              `Enrolled/purchased '${selected.name}' (dummy action).`
                            );
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                      >
                        {selected.price && Number(selected.price) > 0
                          ? `Buy - $${selected.price}`
                          : "Enroll (Free)"}
                      </button>
                    )}

                    <button
                      onClick={() => setSelected(null)}
                      className="px-4 py-2 border rounded-md border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </dialog>
        )}

        {/* ADMIN: Add/Edit form modal */}
        {isAdmin && showForm && (
          <dialog id="book_form_modal" open className="modal">
            <div className="modal-box max-w-lg rounded-2xl p-6 bg-white text-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {editing ? "Edit Course" : "Add New Course"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    className="input input-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Price
                    </label>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleFormChange}
                      className="input input-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Category
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      className="select select-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                    >
                      <option value="Free">Free</option>
                      <option value="Premium">Premium</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Image URL
                  </label>
                  <input
                    name="image"
                    value={form.image}
                    onChange={handleFormChange}
                    className="input input-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Short title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    className="input input-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    className="textarea textarea-bordered w-full mt-1 min-h-[90px] bg-white text-slate-900 border-slate-300"
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                    }}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-primary ${saving ? "loading" : ""}`}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editing
                      ? "Save changes"
                      : "Create course"}
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        )}
      </div>
    </>
  );
}
