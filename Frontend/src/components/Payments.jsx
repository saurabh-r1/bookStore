// Frontend/src/components/Payments.jsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Payments() {
  const [authUser] = useAuth();
  const isAdmin = authUser?.role === "admin";
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all orders (admin)
  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }
    if (!isAdmin) {
      setLoading(false);
      setError("Only admin can view payments.");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/orders/all");
        const data = Array.isArray(res.data) ? res.data : [];
        setOrders(data);
      } catch (err) {
        console.error("Payments / orders load error:", err?.message);
        const msg =
          err?.response?.data?.message || "Failed to load payments data.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authUser, isAdmin]);

  // Derived stats from orders
  const stats = useMemo(() => {
    if (!orders.length) {
      return {
        totalOrders: 0,
        paidOrders: 0,
        revenue: 0,
        avgOrderValue: 0,
        freeOrders: 0,
      };
    }

    let totalOrders = orders.length;
    let revenue = 0;
    let paidOrders = 0;
    let freeOrders = 0;

    for (const o of orders) {
      const t = Number(o.total || 0);
      if (t > 0) {
        revenue += t;
        paidOrders += 1;
      } else {
        freeOrders += 1;
      }
    }

    const avgOrderValue = paidOrders > 0 ? revenue / paidOrders : 0;

    return {
      totalOrders,
      paidOrders,
      revenue,
      avgOrderValue,
      freeOrders,
    };
  }, [orders]);

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

  const shortId = (id) => {
    if (!id) return "";
    if (id.length <= 8) return id;
    return `${id.slice(0, 4)}…${id.slice(-4)}`;
  };

  const formatAmount = (amt) => {
    const n = Number(amt || 0);
    if (!n) return "₹0";
    return "₹" + n.toLocaleString();
  };

  return (
    <>
      <Navbar />

      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-24 pb-16 dark:text-white">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              Payments overview
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-300 mt-1">
              View total revenue, paid orders and recent payment activity.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/orders")}
            className="hidden md:inline-flex px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            ↩ Back to orders
          </button>
        </div>

        {/* Not logged in or not admin */}
        {!authUser && !loading && (
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Please log in as admin to view payments.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              Go to login
            </button>
          </div>
        )}

        {authUser && !isAdmin && !loading && (
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Only admin can access the Payments dashboard.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              Go to home
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {authUser && isAdmin && loading && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-pulse"
                />
              ))}
            </div>
            <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-pulse" />
          </div>
        )}

        {/* Error banner */}
        {error && authUser && isAdmin && !loading && (
          <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-xs md:text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Main content */}
        {authUser && isAdmin && !loading && !error && (
          <>
            {/* Stats cards */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Total orders
                </div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {stats.totalOrders}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Includes free + paid.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Paid orders
                </div>
                <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                  {stats.paidOrders}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {stats.freeOrders} free order
                  {stats.freeOrders === 1 ? "" : "s"}.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Total revenue
                </div>
                <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatAmount(stats.revenue)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  From paid orders only.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Avg order value
                </div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {formatAmount(Math.round(stats.avgOrderValue))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Average of paid orders.
                </p>
              </div>
            </section>

            {/* Payments table */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-sm md:text-base font-semibold">
                  Recent payments
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {orders.length} order
                  {orders.length === 1 ? "" : "s"}
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-600 dark:text-slate-300">
                  No orders yet — payments will show up here once users start
                  checking out.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm md:table-md text-xs md:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                      <tr className="text-[11px] md:text-xs text-slate-500 dark:text-slate-300">
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th className="text-right">Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => {
                        const total = Number(o.total || 0);
                        const user = o.user || {};
                        return (
                          <tr key={o._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                            <td>
                              <div className="flex flex-col">
                                <span className="font-mono text-[11px] md:text-xs">
                                  {shortId(o._id)}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {o.items?.length || 0} item
                                  {(o.items?.length || 0) === 1 ? "" : "s"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex flex-col">
                                <span className="text-xs">
                                  {user.fullname || "Customer"}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {user.email || "—"}
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap">
                              {formatDateTime(o.createdAt)}
                            </td>
                            <td className="text-right">
                              <span
                                className={
                                  "font-semibold " +
                                  (total > 0
                                    ? "text-indigo-600 dark:text-indigo-300"
                                    : "text-slate-500 dark:text-slate-400")
                                }
                              >
                                {total > 0 ? formatAmount(total) : "Free"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={
                                  "px-2 py-0.5 rounded-full text-[10px] font-semibold " +
                                  statusBadgeClass(o.status)
                                }
                              >
                                {o.status || "placed"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
