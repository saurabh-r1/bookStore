// Frontend/src/components/Profile.jsx
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Profile() {
  const [authUser, setAuthUser] = useAuth();
  const [profile, setProfile] = useState(authUser || null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(authUser?.fullname || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get("/user/me");
        setProfile(res.data);
        setEditingName(res.data.fullname || "");
      } catch (err) {
        console.error("Failed to load profile:", err?.message);
        if (err?.response?.status === 401) {
          toast("Please log in again.", { icon: "🔒" });
          navigate("/login");
        } else {
          toast.error("Could not load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser, navigate]);

  const syncUserToStorage = (updatedUser) => {
    // update context
    setAuthUser(updatedUser);

    // update localStorage / sessionStorage if user is stored there
    const storedLocal = localStorage.getItem("Users");
    const storedSession = sessionStorage.getItem("Users");

    if (storedLocal) {
      localStorage.setItem("Users", JSON.stringify(updatedUser));
    }
    if (storedSession) {
      sessionStorage.setItem("Users", JSON.stringify(updatedUser));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put("/user/me", {
        fullname: editingName.trim(),
      });

      const updatedUser = res.data.user;
      setProfile(updatedUser);
      syncUserToStorage(updatedUser);

      toast.success("Profile updated.");
    } catch (err) {
      console.error("Profile update error:", err?.message);
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max file size is 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const res = await api.post("/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data.user;
      setProfile(updatedUser);
      syncUserToStorage(updatedUser);
      toast.success("Profile picture updated.");
    } catch (err) {
      console.error("Avatar upload error:", err?.message);
      toast.error(err?.response?.data?.message || "Failed to upload avatar.");
    } finally {
      setUploading(false);
      // reset file input value
      e.target.value = "";
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  // Avatar initials
  const initials = (profile?.fullname || authUser?.fullname || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  return (
    <>
      <Navbar />

      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-24 pb-16 dark:text-white">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6">
          Your profile
        </h1>

        {/* Not logged in */}
        {!authUser && !loading && (
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You are not logged in.
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
        {loading && authUser && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-700 animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-2 flex-1">
                <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-1/3 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="w-2/3 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        )}

        {/* Profile content */}
        {!loading && authUser && profile && (
          <section className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow border border-slate-200 dark:border-slate-700">
            <div className="grid md:grid-cols-[220px,1fr] gap-8">
              {/* Left: avatar + summary */}
              <div className="border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-6 md:pb-0 md:pr-6 flex flex-col items-center md:items-start gap-4">
                <div className="relative">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullname}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "";
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                      {initials}
                    </div>
                  )}

                  {/* small circular upload button */}
                  <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[11px] cursor-pointer shadow">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    {uploading ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <span>✎</span>
                    )}
                  </label>
                </div>

                <div className="text-center md:text-left">
                  <h2 className="text-xl font-semibold">
                    {profile.fullname || authUser.fullname}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    {profile.email}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {profile.role === "admin" ? "Admin" : "Customer"}
                    </span>

                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Member since {formatDate(profile.createdAt)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center md:text-left">
                  Profile picture is only stored for this demo project.
                </p>
              </div>

              {/* Right: editable form */}
              <form
                onSubmit={handleSave}
                className="space-y-4 md:pl-2"
              >
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="mt-1 input input-bordered w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="mt-1 input input-bordered w-full bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Email changes and password reset can be added later.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-500 dark:text-slate-400 pt-2">
                  <div>
                    <span className="block text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">
                      Role
                    </span>
                    <span>{profile.role}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">
                      Last updated
                    </span>
                    <span>{formatDate(profile.updatedAt)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 ${
                      saving ? "opacity-80 cursor-wait" : ""
                    }`}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
