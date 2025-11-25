import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // pricing / category
    price: { type: Number, default: 0 }, // 0 means Free
    category: { type: String, default: "General" }, // e.g. Free / Premium / General

    // basic display fields
    image: { type: String },
    title: { type: String }, // short subtitle/tagline
    description: { type: String },

    // book metadata
    author: { type: String, trim: true },
    genre: { type: String, trim: true },
    publisher: { type: String, trim: true },

    // optional – for future use if you like
    language: { type: String, trim: true, default: "English" },
    pages: { type: Number, min: 0 },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
