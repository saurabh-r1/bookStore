// Frontend/src/components/BookDetail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../api/axiosInstance";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=60&auto=format&fit=crop";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [authUser] = useAuth();
  const isAdmin = authUser?.role === "admin";

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);

  // Fetch book by id
  useEffect(() => {
    let cancelled = false;

    const fetchBook = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/book/${id}`, { timeout: 3000 });
        if (cancelled) return;
        setBook(res.data);
      } catch (err) {
        console.error("Failed to load book", err?.message);
        setError("Unable to load this book. It may have been removed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) fetchBook();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isFree = (b) => {
    if (!b) return false;
    const price = Number(b.price) || 0;
    const cat = (b.category || "").toLowerCase();
    return price === 0 || cat === "free";
  };

  const price = Number(book?.price) || 0;
  const total = price * qty;

  const decQty = () => setQty((q) => Math.max(1, q - 1));
  const incQty = () => setQty((q) => Math.min(10, q + 1));

  const handleAddToCart = () => {
    if (!book) return;
    addToCart(book, qty);
    toast.success(`Added ${qty} × "${book.name}" to your cart`, {
      icon: "🛒",
    });
  };

  const handleBuyNow = () => {
    if (!book) return;
    addToCart(book, qty);
    toast.success(`"${book.name}" added to your cart`, {
      icon: isFree(book) ? "📚" : "✅",
    });
    navigate("/cart");
  };

  const MetaItem = ({ label, value }) =>
    !value ? null : (
      <div className="flex flex-col text-sm">
        <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </span>
        <span className="text-slate-800 dark:text-slate-100 font-medium">
          {value}
        </span>
      </div>
    );

  return (
    <>
      <Navbar />

      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-24 pb-16 dark:text-white">
        {/* Breadcrumb */}
        <div className="text-xs md:text-sm text-slate-500 dark:text-slate-300 mb-4 flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="hover:underline flex items-center gap-1"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <span className="mx-1">/</span>
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/course")}
          >
            Books
          </span>
          {book && (
            <>
              <span className="mx-1">/</span>
              <span className="font-medium text-slate-700 dark:text-slate-100 line-clamp-1">
                {book.name}
              </span>
            </>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid md:grid-cols-2 gap-10">
            <div className="h-80 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
              <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {/* MAIN CONTENT */}
        {!loading && book && (
          <section className="grid md:grid-cols-2 gap-10 items-start">
            {/* LEFT: Cover image */}
            <div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4 flex items-center justify-center">
                <img
                  src={book.image || FALLBACK_IMAGE}
                  alt={book.name}
                  className="max-h-[420px] w-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              {/* Mobile meta info */}
              <div className="mt-4 md:hidden grid grid-cols-2 gap-4 text-xs">
                <MetaItem label="Author" value={book.author} />
                <MetaItem label="Publisher" value={book.publisher} />
                <MetaItem
                  label="Genre"
                  value={book.genre || book.category}
                />
                <MetaItem label="Language" value={book.language} />
                <MetaItem
                  label="Pages"
                  value={
                    typeof book.pages === "number" && book.pages > 0
                      ? `${book.pages} pages`
                      : ""
                  }
                />
              </div>
            </div>

            {/* RIGHT: Info & actions */}
            <div>
              {/* Title & subtitle */}
              <h1 className="text-2xl md:text-3xl font-extrabold mb-1 leading-snug">
                {book.name}
              </h1>
              {book.title && (
                <p className="text-sm text-slate-500 dark:text-slate-300 mb-2">
                  {book.title}
                </p>
              )}

              {/* Author / publisher line */}
              {(book.author || book.publisher) && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  {book.author && (
                    <>
                      by{" "}
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {book.author}
                      </span>
                    </>
                  )}
                  {book.publisher && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="text-slate-500 dark:text-slate-300">
                        {book.publisher}
                      </span>
                    </>
                  )}
                </p>
              )}

              {/* Tags row */}
              <div className="flex flex-wrap gap-2 mb-5">
                {(book.genre || book.category) && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                    {book.genre || book.category}
                  </span>
                )}
                {book.language && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {book.language}
                  </span>
                )}
                {isFree(book) && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200">
                    Free
                  </span>
                )}
              </div>

              {/* PRICE + QUANTITY CARD */}
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Price block */}
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Price
                    </div>

                    <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {isFree(book) ? "Free" : `₹${price}`}
                    </div>

                    {!isFree(book) && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Inclusive of all taxes
                      </div>
                    )}
                  </div>

                  {/* Quantity (hidden for admin) */}
                  {!isAdmin && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Quantity
                      </div>
                      <div className="inline-flex items-center border rounded-full overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
                        <button
                          type="button"
                          onClick={decQty}
                          className="px-3 py-1 text-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-sm font-medium">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={incQty}
                          className="px-3 py-1 text-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        Max 10 per order 
                      </div>
                    </div>
                  )}
                </div>

                {!isFree(book) && !isAdmin && (
                  <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Total (₹)
                    </span>
                    <span className="text-xl font-semibold text-slate-900 dark:text-white">
                      ₹{total}
                    </span>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS (hidden for admin) */}
              {!isAdmin && (
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="px-5 py-3 rounded-lg font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 flex items-center gap-2"
                  >
                    {isFree(book) ? "Get for Free" : "Buy Now"}
                  </button>

                  {!isFree(book) && (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="px-5 py-3 rounded-lg font-semibold text-sm border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              )}

              {/* META GRID (desktop only) */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-sm">
                <MetaItem label="Author" value={book.author} />
                <MetaItem label="Publisher" value={book.publisher} />
                <MetaItem label="Genre" value={book.genre || book.category} />
                <MetaItem label="Language" value={book.language} />
                <MetaItem
                  label="Pages"
                  value={
                    typeof book.pages === "number" && book.pages > 0
                      ? `${book.pages} pages`
                      : ""
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                <h2 className="text-base md:text-lg font-semibold mb-2">
                  Book description
                </h2>
                <p className="text-sm md:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {book.description ||
                    "No detailed description is available yet for this book."}
                </p>
              </section>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
