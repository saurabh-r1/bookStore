// Frontend/src/components/Orders.jsx
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=60&auto=format&fit=crop";

export default function Orders() {
  const [authUser] = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get("/orders");
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Get orders error:", err?.message);
        const msg =
          err?.response?.data?.message || "Failed to load your orders.";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [authUser]);

  const formatDateTime = (d) => {
    if (!d) return "—";
    try {
      const date = new Date(d);
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case "placed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200";
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  // ✅ NEW – download invoice
  const handleDownloadInvoice = async (orderId, total) => {
    if (!orderId) return;

    setDownloadingId(orderId);
    try {
      const res = await api.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        total === 0
          ? "Free order invoice downloaded."
          : "Invoice downloaded."
      );
    } catch (err) {
      console.error("Invoice download error:", err?.message);
      const msg =
        err?.response?.data?.message || "Failed to download invoice.";
      toast.error(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-24 pb-16 dark:text-white">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4">
          My orders
        </h1>

        {/* Not logged in */}
        {!authUser && !loading && (
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Please log in to see your orders.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              Go to login
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {authUser && loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 h-28"
              />
            ))}
          </div>
        )}

        {/* Orders list */}
        {authUser && !loading && (
          <>
            {orders.length === 0 ? (
              <div className="mt-8 text-center text-slate-600 dark:text-slate-300">
                <p>You don&apos;t have any orders yet.</p>
                <button
                  onClick={() => navigate("/course")}
                  className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
                >
                  Browse books
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {orders.map((order) => {
                  const total = Number(order.total || 0);

                  return (
                    <div
                      key={order._id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
                    >
                      {/* Order header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-slate-200 dark:border-slate-700 pb-3 mb-3">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Order ID
                          </div>
                          <div className="text-xs md:text-sm font-mono text-slate-800 dark:text-slate-100 break-all">
                            {order._id}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Placed on
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-200">
                            {formatDateTime(order.createdAt)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Total
                          </div>
                          <div className="text-base font-semibold text-indigo-600 dark:text-indigo-300">
                            {total === 0
                              ? "Free"
                              : `₹${total.toLocaleString()}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={
                              "px-3 py-1 rounded-full text-[11px] font-semibold " +
                              statusBadgeClass(order.status)
                            }
                          >
                            {order.status || "placed"}
                          </span>

                          {/* ✅ Download invoice button */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadInvoice(order._id, total)
                            }
                            className="px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 text-[11px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                            disabled={downloadingId === order._id}
                          >
                            {downloadingId === order._id
                              ? "Downloading..."
                              : "Download invoice"}
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {order.items?.map((it, idx) => {
                          const b = it.book || {};
                          const priceAtPurchase = Number(
                            it.priceAtPurchase || 0
                          );
                          const lineTotal =
                            priceAtPurchase * (it.qty || 0);

                          return (
                            <div
                              key={idx}
                              className="flex gap-3 items-start text-sm"
                            >
                              <div className="w-14 h-18 rounded-md overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-slate-800">
                                <img
                                  src={b.image || FALLBACK_IMAGE}
                                  alt={b.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = FALLBACK_IMAGE;
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between gap-2">
                                  <div>
                                    <div className="font-medium line-clamp-2">
                                      {b.name || "Book"}
                                    </div>
                                    {b.author && (
                                      <div className="text-xs text-slate-500 dark:text-slate-400">
                                        by {b.author}
                                      </div>
                                    )}
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      Qty: {it.qty || 0}
                                    </div>
                                  </div>
                                  <div className="text-right text-xs">
                                    <div className="text-slate-500 dark:text-slate-400">
                                      Price
                                    </div>
                                    <div className="font-semibold">
                                      {priceAtPurchase === 0
                                        ? "Free"
                                        : `₹${priceAtPurchase}`}
                                    </div>
                                    {priceAtPurchase > 0 && (
                                      <div className="mt-1 text-slate-500 dark:text-slate-400">
                                        Total:{" "}
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                                          ₹{lineTotal}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
