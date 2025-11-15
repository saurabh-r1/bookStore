import React from "react";
import { useAuth } from "../context/AuthProvider";

export default function Banner() {
  const [authUser] = useAuth();

  const openLogin = () => {
    const possibleIds = ["login_modal", "my_modal_3", "auth_modal"];
    for (const id of possibleIds) {
      const dialog = document.getElementById(id);
      if (dialog) {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
          return;
        } else {
          dialog.setAttribute("open", "true");
          return;
        }
      }
    }
  };

  const handleExploreClick = (e) => {
    if (!authUser) {
      e.preventDefault();
      openLogin();
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>

      {/* Decorative blur shapes */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

      {/* Main content */}
      <div className="relative max-w-screen-2xl container mx-auto px-5 md:px-20 py-24 text-white grid md:grid-cols-2 items-center gap-10">
        
        {/* Left Text Content */}
        <div>
          <p className="text-sm uppercase tracking-wide opacity-90 mb-2">
            Welcome to The Page Hub
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            A New Chapter of Learning Begins Here.
          </h1>

          <p className="text-base md:text-lg opacity-90 max-w-lg mb-8">
            Discover handpicked books, insightful resources, and practical learning materials 
            crafted to help you grow, improve, and explore something new every day.
          </p>

          <div className="flex items-center gap-4">

            {/* EXPLORE COURSES (login check) */}
            <a
              href="/course"
              onClick={handleExploreClick}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-slate-100 transition"
            >
              Explore Courses
            </a>

            {/* Free Books — always allowed */}
            <a
              href="#free"
              className="px-6 py-3 border border-white/60 rounded-lg font-semibold hover:bg-white/20 transition"
            >
              Free Books
            </a>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80&auto=format&fit=crop"
            alt="Learning Illustration"
            className="w-full h-[350px] md:h-[420px] object-cover rounded-xl shadow-2xl"
          />
        </div>

      </div>
    </section>
  );
}
