// Backend/controller/book.controller.js
import Book from "../model/book.model.js";

export const getBook = async (req, res) => {
  try {
    const books = await Book.find().lean();
    return res.status(200).json(books);
  } catch (err) {
    console.error("getBook error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Seed sample books (call once in dev)
export const seedBooks = async (req, res) => {
  try {
    const existing = await Book.countDocuments();
    if (existing > 0) {
      return res.status(200).json({ message: "DB already seeded", count: existing });
    }

    const sample = [
      {
        name: "Intro to JavaScript",
        title: "Basics of JS — variables, functions, DOM.",
        price: 0,
        category: "Free",
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=60&auto=format&fit=crop",
        description: "A short practical guide to JavaScript fundamentals.",
      },
      {
        name: "Advanced React Patterns",
        title: "Hooks, context, performance.",
        price: 499,
        category: "Premium",
        image: "https://images.unsplash.com/photo-1526378723456-5e0f2c97f2c6?w=800&q=60&auto=format&fit=crop",
        description: "Deep dive into advanced React patterns used by production apps.",
      },
      {
        name: "HTML & CSS Mastery",
        title: "Responsive layouts, modern CSS.",
        price: 0,
        category: "Free",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60&auto=format&fit=crop",
        description: "Practical approaches to layout and styling.",
      },
    ];

    const created = await Book.insertMany(sample);
    return res.status(201).json({ message: "Seeded sample books", inserted: created.length });
  } catch (err) {
    console.error("seedBooks error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
