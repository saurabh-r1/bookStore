// Frontend/src/context/AuthProvider.jsx
import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

/**
 * AuthProvider
 * Reads auth from localStorage or sessionStorage "Users".
 */
export default function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const rawLocal = localStorage.getItem("Users");
      const rawSession = sessionStorage.getItem("Users");
      if (rawLocal) return JSON.parse(rawLocal);
      if (rawSession) return JSON.parse(rawSession);
      return null;
    } catch (e) {
      console.error("Failed to parse Users from storage:", e);
      return null;
    }
  });

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
