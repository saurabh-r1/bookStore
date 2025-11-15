import React from "react";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Logout() {
  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      setAuthUser(null);
      localStorage.removeItem("Users");
      sessionStorage.removeItem("Users");
      localStorage.removeItem("remember");
      localStorage.removeItem("rememberEmail");
      toast.success("Logged out");
      // client-side navigate (no full reload)
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <div>
      <button className="px-3 py-2 bg-red-500 text-white rounded-md cursor-pointer" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Logout;
