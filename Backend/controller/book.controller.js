// Backend/controller/book.controller.js
import Book from "../model/book.model.js";

/**
 * GET /book
 * Get all books
 */
export const getBook = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    console.error("getBook error:", error);
    res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
};

/**
 * GET /book/:id
 * Get a single book by id
 */
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("getBookById error:", error);
    res.status(500).json({ message: "Failed to fetch book", error: error.message });
  }
};

/**
 * POST /book
 * Create a new book
 * Expected body: { name, price, category, image, title }
 */
export const createBook = async (req, res) => {
  try {
    const { name, price, category, image, title } = req.body;

    if (!name || price == null || !category || !title) {
      return res.status(400).json({ message: "name, price, category and title are required" });
    }

    const book = new Book({
      name,
      price,
      category,
      image,
      title,
    });

    const saved = await book.save();
    res.status(201).json({
      message: "Book created successfully",
      book: saved,
    });
  } catch (error) {
    console.error("createBook error:", error);
    res.status(500).json({ message: "Failed to create book", error: error.message });
  }
};

/**
 * PUT /book/:id
 * Update an existing book
 */
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, image, title } = req.body;

    const updated = await Book.findByIdAndUpdate(
      id,
      { name, price, category, image, title },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book updated successfully",
      book: updated,
    });
  } catch (error) {
    console.error("updateBook error:", error);
    res.status(500).json({ message: "Failed to update book", error: error.message });
  }
};

/**
 * DELETE /book/:id
 * Delete a book
 */
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Book.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book deleted successfully",
      book: deleted,
    });
  } catch (error) {
    console.error("deleteBook error:", error);
    res.status(500).json({ message: "Failed to delete book", error: error.message });
  }
};
