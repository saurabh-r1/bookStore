// Frontend/src/context/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);

  // Load user from storage on first render
  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("Users")) ||
      JSON.parse(sessionStorage.getItem("Users"));

    if (storedUser) {
      setAuthUser(storedUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
