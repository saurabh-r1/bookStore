// Backend/model/book.model.js
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  image: String,
  title: String,
  description: String,
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
