const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

const withBookFilters = (query = {}) => {
  const filter = {};
  const { search, category, availability } = query;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (availability === 'available') {
    filter.availableQuantity = { $gt: 0 };
  }

  if (availability === 'out') {
    filter.availableQuantity = 0;
  }

  return filter;
};

const getBooks = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const filter = withBookFilters(req.query);

    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.json({ book });
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { title, author, category, isbn, quantity, description, publishedYear, coverImage } = req.body;

    const existingBook = await Book.findOne({ isbn: String(isbn).trim() });
    if (existingBook) {
      return res.status(409).json({ message: 'Book ISBN already exists' });
    }

    const newBook = await Book.create({
      title,
      author,
      category,
      isbn: String(isbn).trim(),
      quantity: Number(quantity),
      availableQuantity: Number(quantity),
      description: description || '',
      publishedYear: publishedYear ? Number(publishedYear) : null,
      coverImage: coverImage || '',
    });

    return res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const { title, author, category, isbn, quantity, description, publishedYear, coverImage } = req.body;
    const currentAvailable = Number(book.availableQuantity || 0);
    const nextQuantity = quantity === undefined ? Number(book.quantity) : Number(quantity);
    const quantityDelta = nextQuantity - Number(book.quantity);
    const checkedOutCopies = Number(book.quantity) - currentAvailable;

    if (!Number.isFinite(nextQuantity) || nextQuantity < checkedOutCopies) {
      return res.status(400).json({ message: `Total quantity cannot be lower than the ${checkedOutCopies} copies currently on loan.` });
    }

    if (isbn && String(isbn).trim() !== book.isbn) {
      const duplicate = await Book.findOne({ isbn: String(isbn).trim() });
      if (duplicate && duplicate._id.toString() !== book._id.toString()) {
        return res.status(409).json({ message: 'Book ISBN already exists' });
      }
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.category = category || book.category;
    book.isbn = isbn ? String(isbn).trim() : book.isbn;
    book.quantity = nextQuantity || book.quantity;
    book.description = description ?? book.description;
    book.publishedYear = publishedYear ? Number(publishedYear) : book.publishedYear;
    book.coverImage = coverImage || book.coverImage;
    book.availableQuantity = Math.max(0, Math.min(currentAvailable + quantityDelta, book.quantity));

    await book.save();
    return res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const activeLoan = await Transaction.exists({
      book: book._id,
      status: { $in: ['Issued', 'Overdue'] },
    });
    if (activeLoan) {
      return res.status(409).json({ message: 'This book has an active loan and cannot be deleted yet.' });
    }

    await Book.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
