import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Analytics() {
  const [authUser] = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders (ADMIN only)
  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    if (authUser.role !== "admin") {
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get("/orders/all");
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Analytics load orders error:", err?.message);
        const msg =
          err?.response?.data?.message ||
          "Failed to load analytics data (orders).";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [authUser]);

  // Helpers
  const parseNumber = (val) => {
    const n = Number(val);
    return Number.isNaN(n) ? 0 : n;
  };

  const formatCurrency = (val) =>
    `₹${parseNumber(val).toLocaleString("en-IN")}`;

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

  // Derived analytics
  const {
    totalOrders,
    paidOrders,
    freeOrders,
    totalRevenue,
    avgOrderValue,
    last7DaysRevenue,
    last7DaysOrders,
    topBooks,
    topGenres,
  } = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return {
        totalOrders: 0,
        paidOrders: 0,
        freeOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        last7DaysRevenue: 0,
        last7DaysOrders: 0,
        topBooks: [],
        topGenres: [],
      };
    }

    let totalOrders = orders.length;
    let paidOrders = 0;
    let freeOrders = 0;
    let totalRevenue = 0;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let last7DaysRevenue = 0;
    let last7DaysOrders = 0;

    // For top books & genres
    const bookMap = new Map(); // key: bookId, value: { name, count, revenue, author }
    const genreMap = new Map(); // key: genre/category, value: { label, count, revenue }

    for (const order of orders) {
      const orderTotal = parseNumber(order.total);
      if (orderTotal > 0) paidOrders++;
      else freeOrders++;

      totalRevenue += orderTotal;

      const created = order.createdAt ? new Date(order.createdAt) : null;
      const inLast7Days = created && created >= sevenDaysAgo;

      if (inLast7Days) {
        last7DaysRevenue += orderTotal;
        last7DaysOrders++;
      }

      // Items for top books & genres
      if (Array.isArray(order.items)) {
        for (const it of order.items) {
          const qty = parseNumber(it.qty || 0);
          const priceAtPurchase = parseNumber(it.priceAtPurchase || 0);
          const lineRevenue = qty * priceAtPurchase;

          const b = it.book || {};
          const bookId = b._id || b.id || b.name;
          if (bookId) {
            const key = String(bookId);
            if (!bookMap.has(key)) {
              bookMap.set(key, {
                id: key,
                name: b.name || "Untitled",
                author: b.author || "",
                count: 0,
                revenue: 0,
              });
            }
            const entry = bookMap.get(key);
            entry.count += qty;
            entry.revenue += lineRevenue;
          }

          const genreLabel =
            (b.genre || b.category || "General").trim() || "General";
          if (genreLabel) {
            const gKey = genreLabel.toLowerCase();
            if (!genreMap.has(gKey)) {
              genreMap.set(gKey, {
                label: genreLabel,
                count: 0,
                revenue: 0,
              });
            }
            const gEntry = genreMap.get(gKey);
            gEntry.count += qty;
            gEntry.revenue += lineRevenue;
          }
        }
      }
    }

    const avgOrderValue =
      totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

    const topBooks = Array.from(bookMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topGenres = Array.from(genreMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrders,
      paidOrders,
      freeOrders,
      totalRevenue,
      avgOrderValue,
      last7DaysRevenue,
      last7DaysOrders,
      topBooks,
      topGenres,
    };
  }, [orders]);

  const StatCard = ({ label, value, subLabel }) => (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 md:p-5 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-50">
        {value}
      </div>
      {subLabel && (
        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {subLabel}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Navbar />

      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-24 pb-16 dark:text-white">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
          Analytics &amp; Sales
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-6">
          High-level overview of orders and revenue for{" "}
          <span className="font-semibold">The Page Hub</span>.
        </p>

        {/* NOT LOGGED IN */}
        {!authUser && !loading && (
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Please log in as admin to view analytics.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              Go to login
            </button>
          </div>
        )}

        {/* NOT ADMIN */}
        {authUser && authUser.role !== "admin" && !loading && (
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Analytics dashboard is only available for admin accounts.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              Go to homepage
            </button>
          </div>
        )}

        {/* LOADING SKELETON */}
        {authUser && authUser.role === "admin" && loading && (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              ))}
            </div>
            <div className="h-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
          </div>
        )}

        {/* ANALYTICS CONTENT */}
        {authUser &&
          authUser.role === "admin" &&
          !loading && (
            <>
              {orders.length === 0 ? (
                <div className="mt-8 text-center text-slate-600 dark:text-slate-300">
                  <p>No orders yet, so nothing to analyze.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Once users start placing orders, analytics will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="space-y-8 mt-4">
                  {/* Summary stats */}
                  <section>
                    <h2 className="text-base md:text-lg font-semibold mb-3">
                      Overview
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      <StatCard
                        label="Total orders"
                        value={totalOrders}
                        subLabel={`${paidOrders} paid • ${freeOrders} free`}
                      />
                      <StatCard
                        label="Total revenue"
                        value={formatCurrency(totalRevenue)}
                        subLabel="All-time revenue from paid orders"
                      />
                      <StatCard
                        label="Avg. order value"
                        value={
                          avgOrderValue > 0
                            ? formatCurrency(avgOrderValue)
                            : "₹0"
                        }
                        subLabel="Total revenue ÷ total orders"
                      />
                      <StatCard
                        label="Last 7 days"
                        value={formatCurrency(last7DaysRevenue)}
                        subLabel={`${last7DaysOrders} order${
                          last7DaysOrders !== 1 ? "s" : ""
                        } in last 7 days`}
                      />
                    </div>
                  </section>

                  {/* Top books & genres */}
                  <section className="grid md:grid-cols-2 gap-4 md:gap-6">
                    {/* Top books */}
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 md:p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-base font-semibold">
                          Top books (by copies sold)
                        </h2>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          Based on order items
                        </span>
                      </div>

                      {topBooks.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          No paid orders yet.
                        </p>
                      ) : (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                          {topBooks.map((b) => (
                            <li
                              key={b.id}
                              className="flex items-center justify-between py-2"
                            >
                              <div className="max-w-[70%]">
                                <div className="font-medium line-clamp-1">
                                  {b.name}
                                </div>
                                {b.author && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                    by {b.author}
                                  </div>
                                )}
                              </div>
                              <div className="text-right text-[11px]">
                                <div className="text-slate-500 dark:text-slate-400">
                                  {b.count} copy
                                  {b.count !== 1 ? "ies" : ""}
                                </div>
                                <div className="font-semibold text-indigo-600 dark:text-indigo-300">
                                  {b.revenue > 0
                                    ? formatCurrency(b.revenue)
                                    : "Free"}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Top genres */}
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 md:p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-base font-semibold">
                          Top genres / categories
                        </h2>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          From ordered books
                        </span>
                      </div>

                      {topGenres.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          No genre data yet.
                        </p>
                      ) : (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                          {topGenres.map((g) => (
                            <li
                              key={g.label}
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className="font-medium">
                                  {g.label}
                                </span>
                              </div>
                              <div className="text-right text-[11px]">
                                <div className="text-slate-500 dark:text-slate-400">
                                  {g.count} item
                                  {g.count !== 1 ? "s" : ""}
                                </div>
                                <div className="font-semibold text-indigo-600 dark:text-indigo-300">
                                  {g.revenue > 0
                                    ? formatCurrency(g.revenue)
                                    : "Mostly free"}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>

                  {/* Recent orders table */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base md:text-lg font-semibold">
                        Recent orders
                      </h2>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Showing latest{" "}
                        {Math.min(orders.length, 8)} order
                        {Math.min(orders.length, 8) !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                      <table className="table table-sm text-xs md:text-sm">
                        <thead>
                          <tr className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Placed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 8).map((order) => {
                            const user = order.user || {};
                            const itemsCount = Array.isArray(order.items)
                              ? order.items.reduce(
                                  (sum, it) => sum + (parseNumber(it.qty) || 0),
                                  0
                                )
                              : 0;

                            return (
                              <tr key={order._id}>
                                <td className="font-mono text-[11px]">
                                  {order._id}
                                </td>
                                <td>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {user.fullname || "—"}
                                    </span>
                                    {user.email && (
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {user.email}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td>{itemsCount}</td>
                                <td className="font-semibold text-indigo-600 dark:text-indigo-300">
                                  {parseNumber(order.total) === 0
                                    ? "Free"
                                    : formatCurrency(order.total)}
                                </td>
                                <td>
                                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                                    {order.status || "placed"}
                                  </span>
                                </td>
                                <td>{formatDateTime(order.createdAt)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}
            </>
          )}
      </main>

      <Footer />
    </>
  );
}
