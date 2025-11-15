// Frontend/src/components/About.jsx
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const FeatureCard = ({ icon, title, text }) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow hover:shadow-lg transform hover:-translate-y-1 transition">
    <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
  </div>
);

const TimelineStep = ({ step, title, text }) => (
  <div className="flex-1 min-w-[180px]">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">{step}</div>
      <div>
        <h5 className="font-semibold">{title}</h5>
        <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
      </div>
    </div>
  </div>
);

const Testimonial = ({ avatar, name, role, quote }) => (
  <div className="p-5 bg-white dark:bg-slate-800 rounded-xl shadow">
    <div className="flex items-center gap-3 mb-3">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-xs text-slate-500 dark:text-slate-300">{role}</div>
      </div>
    </div>
    <p className="text-sm text-slate-700 dark:text-slate-300">“{quote}”</p>
  </div>
);

export default function About() {
  return (
    <>
      <Navbar />

      <main className="max-w-screen-2xl container mx-auto px-5 md:px-20 pt-28 pb-24 dark:text-white">
        {/* HERO (kept simple and strong) */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
              We make learning & reading simple and enjoyable
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-xl">
              The Page Hub Bookstore curates practical books and short courses so learners focus on what matters —
              learning with clarity. Clean UI, friendly community, and resources you can trust.
            </p>

            <div className="flex gap-3">
              <a
                href="/course"
                className="inline-block px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:opacity-95"
              >
                Explore courses
              </a>
              <a
                href="/contact"
                className="inline-block px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Contact us
              </a>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80&auto=format&fit=crop"
              alt="Bookshelf"
              className="w-full h-64 object-cover"
            />
          </div>
        </section>

        {/* MIDDLE: Feature Highlights */}
        <section className="mb-10">
          <h3 className="text-2xl font-semibold mb-6">What we offer</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 7v9c0 1.1.9 2 2 2h6v-9l1-1 1 1v9h6c1.1 0 2-.9 2-2V7l-9-5z"/></svg>}
              title="Curated books"
              text="Handpicked content so you spend time learning, not searching."
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>}
              title="Free & premium"
              text="Most beginner materials are free; premium content for deep learners."
            />
            <FeatureCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>}
              title="Practical learning"
              text="Short projects and examples to quickly apply concepts."
            />
          </div>
        </section>

        {/* MIDDLE: Process / Timeline */}
        <section className="mb-10">
          <h3 className="text-2xl font-semibold mb-6">How it works</h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow">
            <div className="flex items-center gap-6 md:gap-10 overflow-x-auto">
              <TimelineStep step="1" title="Discover" text="Search courses/books for your goal." />
              <div className="w-8 h-0 border-t border-dashed border-slate-200 dark:border-slate-700" />
              <TimelineStep step="2" title="Learn" text="Follow focused lessons & mini projects." />
              <div className="w-8 h-0 border-t border-dashed border-slate-200 dark:border-slate-700" />
              <TimelineStep step="3" title="Apply" text="Build and show your small projects." />
            </div>
          </div>
        </section>

        {/* MIDDLE: Testimonials */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">What learners say</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Testimonial
              avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=60&auto=format&fit=crop"
              name="Anjali"
              role="Student"
              quote="Short, practical courses helped me land an internship much faster."
            />
            <Testimonial
              avatar="https://images.unsplash.com/photo-1545996124-4b2f0d4d7cdd?w=400&q=60&auto=format&fit=crop"
              name="Vikram"
              role="Developer"
              quote="Curated reading list saved me hours — great recommendations."
            />
            <Testimonial
              avatar="https://images.unsplash.com/photo-1544739313-6a5f4c7c69a7?w=400&q=60&auto=format&fit=crop"
              name="Maya"
              role="Designer"
              quote="Loved the friendly UI — very easy to follow and use daily."
            />
          </div>
        </section>

        {/* CTA (keeps it simple) */}
        <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 text-white p-6 shadow-lg">
          <div className="md:flex items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Ready to learn something new?</h3>
              <p className="text-slate-100">Join thousands of learners exploring curated books & courses.</p>
            </div>

            <div className="flex gap-3">
              <a href="/course" className="px-4 py-2 rounded-md bg-white text-indigo-600 font-semibold">Start learning</a>
              <a href="/signup" className="px-4 py-2 rounded-md border border-white/30">Create account</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
