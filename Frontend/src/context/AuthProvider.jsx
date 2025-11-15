import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

/**
 * AuthProvider
 * Keeps authUser state synced with localStorage key "Users".
 * authUser is either null or an object { _id, fullname, email }
 */
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
