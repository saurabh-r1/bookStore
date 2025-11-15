import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

/**
 * AuthProvider
 * - Reads user from localStorage (long-term) OR sessionStorage (short-term).
 * - Exposes [authUser, setAuthUser] via useAuth hook.
 */
export default function AuthProvider({ children }) {
  const initial = (() => {
    try {
      // prefer localStorage but fallback to sessionStorage
      const raw = localStorage.getItem("Users") || sessionStorage.getItem("Users");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("Failed to parse Users from storage:", e);
      return null;
    }
  })();

  const [authUser, setAuthUser] = useState(initial);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
