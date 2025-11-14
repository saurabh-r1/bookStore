// src/context/AuthProvider.jsx
import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const initial = (() => {
    try {
      const raw = localStorage.getItem("Users");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("Failed to parse Users from localStorage:", e);
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
