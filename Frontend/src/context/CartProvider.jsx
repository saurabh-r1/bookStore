// Frontend/src/context/CartProvider.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthProvider";

const CartContext = createContext();

export default function CartProvider({ children }) {
  const [authUser] = useAuth();

  // Storage key is per user; guest fallback
  const storageKey = authUser?._id
    ? `cart_${authUser._id}`
    : "cart_guest";

  // Initial load
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Whenever storageKey changes (user login/logout), load that cart
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, [storageKey]);

  // When user logs in: merge guest cart → user cart (nice UX)
  useEffect(() => {
    if (!authUser?._id) return;

    try {
      const guestRaw = localStorage.getItem("cart_guest");
      if (!guestRaw) return;

      const guestItems = JSON.parse(guestRaw);
      if (!Array.isArray(guestItems) || !guestItems.length) return;

      const userKey = `cart_${authUser._id}`;
      const userRaw = localStorage.getItem(userKey);
      const userItems = userRaw ? JSON.parse(userRaw) : [];

      // Merge guest into user
      const merged = [...userItems];
      for (const g of guestItems) {
        if (!g?.bookId) continue;
        const existing = merged.find((it) => it.bookId === g.bookId);
        if (existing) {
          existing.qty = Math.min(10, (existing.qty || 0) + (g.qty || 1));
        } else {
          merged.push({
            bookId: g.bookId,
            book: g.book,
            qty: Math.min(10, g.qty || 1),
          });
        }
      }

      localStorage.setItem(userKey, JSON.stringify(merged));
      localStorage.removeItem("cart_guest");

      // If current storageKey is userKey, update state
      if (storageKey === userKey) {
        setItems(merged);
      }
    } catch (e) {
      console.warn("Failed to merge guest cart into user cart:", e);
    }
  }, [authUser?._id]); // runs when user logs in

  // Persist current cart to its storageKey
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to persist cart:", e);
    }
  }, [items, storageKey]);

  // Cart operations
  const addToCart = (book, qty = 1) => {
    if (!book) return;
    const id = book._id || book.id || book.name;
    if (!id) return;

    setItems((prev) => {
      const existing = prev.find((it) => it.bookId === id);
      if (existing) {
        return prev.map((it) =>
          it.bookId === id
            ? { ...it, qty: Math.min(10, it.qty + qty) }
            : it
        );
      }
      return [
        ...prev,
        {
          bookId: id,
          book,
          qty: Math.min(10, qty),
        },
      ];
    });
  };

  const updateQty = (bookId, qty) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.bookId === bookId
            ? { ...it, qty: Math.max(1, Math.min(10, qty)) }
            : it
        )
        .filter((it) => it.qty > 0)
    );
  };

  const removeFromCart = (bookId) => {
    setItems((prev) => prev.filter((it) => it.bookId !== bookId));
  };

  const clearCart = () => setItems([]);

  // Derived totals
  const { totalItems, totalPrice } = useMemo(() => {
    let count = 0;
    let sum = 0;
    for (const it of items) {
      const price = Number(it.book?.price || 0);
      count += it.qty;
      sum += price * it.qty;
    }
    return { totalItems: count, totalPrice: sum };
  }, [items]);

  const value = {
    items,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
