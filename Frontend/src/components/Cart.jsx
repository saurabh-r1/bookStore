// Frontend/src/components/Cart.jsx
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useCart } from "../context/CartProvider";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=60&auto=format&fit=crop";

export default function Cart() {
  const { items, updateQty, removeFromCart, clearCart, totalItems, totalPrice } =
    useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!items.length) return;
    alert(
      `Demo checkout: ${totalItems} item(s), total ₹${totalPrice}. Implement real payment later.`
    );
  };

  return (
    <>
      <Navbar />
      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-24 pb-16 dark:text-white">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4">Your cart</h1>

        {!items.length ? (
          <div className="mt-10 text-center text-slate-600 dark:text-slate-300">
            <p>Your cart is empty.</p>
            <button
              onClick={() => navigate("/course")}
              className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
            >
              Browse books
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 mt-6">
            {/* Items */}
            <section className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const book = item.book || {};
                const id = item.bookId;
                const price = Number(book.price || 0);
                const lineTotal = price * item.qty;

                return (
                  <div
                    key={id}
                    className="flex gap-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={book.image || FALLBACK_IMAGE}
                        alt={book.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-sm md:text-base font-semibold line-clamp-2">
                          {book.name}
                        </h2>
                        {book.author && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            by {book.author}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {book.title}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center border rounded-full overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => updateQty(id, item.qty - 1)}
                            className="px-3 py-1 text-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 text-sm font-medium">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(id, item.qty + 1)}
                            className="px-3 py-1 text-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Price
                            </div>
                            <div className="text-sm font-semibold">
                              {price === 0 ? "Free" : `₹${price}`}
                            </div>
                          </div>
                          {price > 0 && (
                            <div className="text-right">
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Total
                              </div>
                              <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                ₹{lineTotal}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(id)}
                      className="self-start text-xs text-red-500 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </section>

            {/* Summary */}
            <aside className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-fit">
              <h2 className="text-lg font-semibold mb-3">Order summary</h2>
              <div className="flex justify-between text-sm mb-1">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span>Subtotal</span>
                <span>
                  {totalPrice === 0 ? "Free" : `₹${totalPrice.toFixed(2)}`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full mt-2 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
              >
                Proceed to checkout (demo)
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Clear cart
              </button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
