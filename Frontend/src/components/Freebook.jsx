// Frontend/src/components/Freebook.jsx
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import Cards from "./Cards";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Freebook() {
  const [book, setBook] = useState([]);

  // sample fallback books (replace images later)
  const sampleBooks = [
    {
      id: "s1",
      name: "Intro to JavaScript",
      title: "Learn JS fundamentals — variables, functions, DOM and more.",
      price: 0,
      category: "Free",
      image:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=60&auto=format&fit=crop",
    },
    {
      id: "s2",
      name: "HTML & CSS Basics",
      title: "Build responsive pages with modern CSS techniques.",
      price: 0,
      category: "Free",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60&auto=format&fit=crop",
    },
    {
      id: "s3",
      name: "Git & GitHub",
      title: "Version control essentials and collaboration workflows.",
      price: 0,
      category: "Free",
      image:
        "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&q=60&auto=format&fit=crop",
    },
    {
      id: "s4",
      name: "SQL Fundamentals",
      title: "Basics of SQL queries, joins and database design.",
      price: 0,
      category: "Free",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60&auto=format&fit=crop",
    },
    {
      id: "s5",
      name: "Python for Beginners",
      title: "Start with Python syntax, data structures and small projects.",
      price: 0,
      category: "Free",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=60&auto=format&fit=crop",
    },
    {
      id: "s6",
      name: "Quick UX Tips",
      title: "Design patterns and practical UX improvements for web apps.",
      price: 0,
      category: "Free",
      image:
        "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800&q=60&auto=format&fit=crop",
    },
  ];

  useEffect(() => {
    let mounted = true;
    const getBook = async () => {
      try {
        const res = await axios.get("http://localhost:4001/book", { timeout: 3000 });
        if (!mounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          // filter free category, fallback to all if none
          const free = res.data.filter((d) => d.category === "Free");
          setBook(free.length ? free : res.data);
        } else {
          setBook(sampleBooks);
        }
      } catch (error) {
        console.warn("Could not load books from backend — using sample books.", error?.message);
        if (mounted) setBook(sampleBooks);
      }
    };
    getBook();
    return () => {
      mounted = false;
    };
  }, []); // run once

  const settings = {
    dots: true,
    infinite: book.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, book.length || 3),
    slidesToScroll: Math.min(3, book.length || 3),
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(3, book.length || 3), slidesToScroll: 1, dots: true } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <section id="free" className="py-16">
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
            Free Offered Courses
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Explore our collection of free learning materials designed to help you build strong foundations and upgrade your skills—without spending a penny.
          </p>
        </div>

        {/* If no books (should not happen), show fallback message */}
        {book.length === 0 ? (
          <div className="text-center py-20 text-slate-600 dark:text-slate-300">
            No courses to display.
          </div>
        ) : (
          <Slider {...settings}>
            {book.map((item) => (
              <div key={item.id || item._id || item.name} className="p-3">
                <Cards item={item} />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </section>
  );
}
