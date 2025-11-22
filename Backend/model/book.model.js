import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    category: { type: String, default: "General" },
    image: { type: String },
    title: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
