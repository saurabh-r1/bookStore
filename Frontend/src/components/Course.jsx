// Frontend/src/components/Course.jsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import Cards from "./Cards";
import { useAuth } from "../context/AuthProvider";
import api from "../api/axiosInstance";

/**
 * Book listing (shop page)
 * - Admin: Add / Edit / Delete (uses backend only)
 * - Dummy data fallback when backend is down
 * - Clicking a book card → /book/:id (handled in Cards)
 */

const DUMMY_BOOKS = [
  {
    id: "d1",
    name: "Intro to JavaScript",
    title: "Basics of JS — variables, functions, DOM.",
    price: 0,
    category: "Free",
    genre: "Programming",
    author: "John Doe",
    publisher: "CodePress",
    language: "English",
    pages: 220,
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
    genre: "Web Development",
    author: "Sarah Lee",
    publisher: "Reactify",
    language: "English",
    pages: 320,
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
    genre: "Design",
    author: "Emily Clark",
    publisher: "Layout Labs",
    language: "English",
    pages: 260,
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60&auto=format&fit=crop",
    description: "Practical approaches to layout and styling for modern web apps.",
  },
  {
    id: "d4",
    name: "Node.js Basics",
    title: "Backend fundamentals and APIs.",
    price: 299,
    category: "Premium",
    genre: "Backend",
    author: "Alex Kumar",
    publisher: "ServerSide",
    language: "English",
    pages: 280,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60&auto=format&fit=crop",
    description: "Start building servers and REST APIs using Node.js and Express.",
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
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // Admin form modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Free",
    genre: "",
    author: "",
    publisher: "",
    language: "English",
    pages: "",
    image: "",
    title: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  // Load from backend / dummy
  useEffect(() => {
    let canceled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/book", { timeout: 3000 });
        if (canceled) return;

        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setBackendLive(true);
        setBooks(data);

        if (data.length === 0) {
          setError("No books in catalog yet. Use 'Add Book' to create one.");
        } else {
          setError("");
        }
      } catch (err) {
        console.warn("Backend not available — using dummy books.", err?.message);
        if (canceled) return;
        setBackendLive(false);
        setBooks(DUMMY_BOOKS);
        setError(
          "Showing example books (backend not connected). Admin actions need backend running."
        );
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    load();
    return () => {
      canceled = true;
    };
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

  const isFreeBook = (b) => {
    const price = Number(b?.price) || 0;
    const cat = (b?.category || "").toLowerCase();
    return price === 0 || cat === "free";
  };

  // Filter + sort
  const processed = useMemo(() => {
    let arr = [...books];

    if (activeCategory !== "all") {
      if (activeCategory === "Free") {
        arr = arr.filter(isFreeBook);
      } else if (activeCategory === "Premium") {
        arr = arr.filter((b) => {
          const price = Number(b?.price) || 0;
          const cat = (b?.category || "").toLowerCase();
          return price > 0 || cat === "premium";
        });
      }
    }

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      arr = arr.filter(
        (b) =>
          (b.name || "").toLowerCase().includes(s) ||
          (b.title || "").toLowerCase().includes(s) ||
          (b.genre || b.category || "").toLowerCase().includes(s) ||
          (b.author || "").toLowerCase().includes(s)
      );
    }

    if (sort === "price-asc")
      arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sort === "price-desc")
      arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));

    return arr;
  }, [books, q, activeCategory, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return processed.slice(start, start + PAGE_SIZE);
  }, [processed, page]);

  // ADMIN HELPERS
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
      genre: "",
      author: "",
      publisher: "",
      language: "English",
      pages: "",
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
    const numericPrice = Number(book.price) || 0;
    setEditing(book);
    setForm({
      name: book.name || "",
      price: numericPrice,
      category: numericPrice === 0 ? "Free" : book.category || "Premium",
      genre: book.genre || "",
      author: book.author || "",
      publisher: book.publisher || "",
      language: book.language || "English",
      pages: book.pages || "",
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

    const numericPrice = Number(form.price) || 0;
    const pagesNum =
      form.pages === "" ? undefined : Math.max(0, Number(form.pages) || 0);

    const categoryToSend =
      numericPrice === 0 ? "Free" : form.category || "Premium";

    const payload = {
      ...form,
      price: numericPrice,
      category: categoryToSend,
      pages: pagesNum,
    };

    setSaving(true);
    try {
      if (editing && (editing._id || editing.id)) {
        const id = editing._id || editing.id;
        const res = await api.put(`/book/${id}`, payload);
        const updated = res.data.book;
        setBooks((prev) =>
          prev.map((b) =>
            (b._id || b.id) === (updated._id || updated.id) ? updated : b
          )
        );
      } else {
        const res = await api.post("/book", payload);
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
            <h1 className="text-3xl md:text-4xl font-extrabold">Browse books</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              {authUser
                ? isAdmin
                  ? "You are logged in as Admin — manage your catalog below."
                  : "Discover free and premium books to buy and read."
                : "Discover free and premium books. Log in when you're ready to buy."}
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

            {/* ADMIN: Add book */}
            {isAdmin && (
              <button
                onClick={openCreateForm}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
              >
                + Add Book
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
                pageItems.map((item) => {
                  const id = item._id || item.id || item.name;
                  return (
                    <Cards
                      key={id}
                      item={item}
                      onEdit={isAdmin ? openEditForm : undefined}
                      onDelete={isAdmin ? handleDelete : undefined}
                    />
                  );
                })
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
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page >= totalPages}
                  className="btn btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* ADMIN: Add/Edit form modal */}
        {isAdmin && showForm && (
          <dialog id="book_form_modal" open className="modal">
            <div className="modal-box max-w-xl rounded-2xl p-6 bg-white text-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {editing ? "Edit Book" : "Add New Book"}
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
                      Price (₹)
                    </label>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleFormChange}
                      className="input input-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                      min="0"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Set 0 to make this book Free.
                    </p>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Genre
                    </label>
                    <input
                      name="genre"
                      value={form.genre}
                      onChange={handleFormChange}
                      placeholder="e.g. Programming"
                      className="input input-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Author
                    </label>
                    <input
                      name="author"
                      value={form.author}
                      onChange={handleFormChange}
                      placeholder="Writer name"
                      className="input input-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Publisher
                    </label>
                    <input
                      name="publisher"
                      value={form.publisher}
                      onChange={handleFormChange}
                      placeholder="Publisher name"
                      className="input input-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Language
                    </label>
                    <input
                      name="language"
                      value={form.language}
                      onChange={handleFormChange}
                      placeholder="e.g. English"
                      className="input input-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Pages
                    </label>
                    <input
                      name="pages"
                      type="number"
                      value={form.pages}
                      onChange={handleFormChange}
                      placeholder="e.g. 250"
                      min="0"
                      className="input input-bordered w-full mt-1 bg-white text-slate-900 border-slate-300"
                    />
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
                      : "Create book"}
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
