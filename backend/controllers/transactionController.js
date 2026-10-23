const Book = require('../models/Book');
const Member = require('../models/Member');
const Transaction = require('../models/Transaction');

const generateTransactionId = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const recalculateOverdueTransactions = async () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  await Transaction.updateMany(
    { status: 'Issued', expectedReturnDate: { $lt: today } },
    { $set: { status: 'Overdue' } }
  );
};

const issueBook = async (req, res, next) => {
  try {
    await recalculateOverdueTransactions();

    const { memberId, bookId, issueDate, expectedReturnDate } = req.body;

    if (!memberId || !bookId || !issueDate || !expectedReturnDate) {
      return res.status(400).json({ message: 'Member, book, issue date and expected return date are required' });
    }

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.status !== 'Active') return res.status(400).json({ message: 'Member is inactive' });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableQuantity <= 0) return res.status(400).json({ message: 'Book is currently unavailable.' });

    const issueDateValue = new Date(issueDate);
    const expectedDateValue = new Date(expectedReturnDate);
    if (Number.isNaN(issueDateValue.getTime()) || Number.isNaN(expectedDateValue.getTime())) {
      return res.status(400).json({ message: 'Invalid dates provided' });
    }

    if (expectedDateValue <= issueDateValue) {
      return res.status(400).json({ message: 'Expected return date must be after issue date' });
    }

    const reservedBook = await Book.findOneAndUpdate(
      { _id: book._id, availableQuantity: { $gt: 0 } },
      { $inc: { availableQuantity: -1 } },
      { new: true }
    );
    if (!reservedBook) return res.status(400).json({ message: 'Book is currently unavailable.' });

    let transaction;
    try {
      transaction = await Transaction.create({
        transactionId: generateTransactionId(),
        user: member._id,
        book: book._id,
        member: member._id,
        issueDate: issueDateValue,
        expectedReturnDate: expectedDateValue,
        status: 'Issued',
      });
    } catch (error) {
      await Book.updateOne({ _id: book._id }, { $inc: { availableQuantity: 1 } });
      throw error;
    }

    const fullTransaction = await Transaction.findById(transaction._id).populate('book').populate('member');
    return res.status(201).json({ message: 'Book issued successfully', transaction: fullTransaction });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    await recalculateOverdueTransactions();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search || '';
    const filter = {};

    if (status) filter.status = status;

    if (search) {
      const matchingBookIds = await Book.find({ title: { $regex: search, $options: 'i' } }).select('_id');
      const matchingMemberIds = await Member.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { book: { $in: matchingBookIds.map((book) => book._id) } },
        { member: { $in: matchingMemberIds.map((member) => member._id) } },
      ];
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('book')
      .populate('member')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      transactions,
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

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('book').populate('member');
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

const returnBook = async (req, res, next) => {
  try {
    const existingTransaction = await Transaction.findById(req.params.id);
    if (!existingTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (existingTransaction.status === 'Returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: existingTransaction._id, status: { $in: ['Issued', 'Overdue'] } },
      { $set: { returnDate: new Date(), status: 'Returned' } },
      { new: true }
    );
    if (!transaction) return res.status(400).json({ message: 'This transaction is already closed.' });

    const book = await Book.findOneAndUpdate(
      { _id: transaction.book, $expr: { $lt: ['$availableQuantity', '$quantity'] } },
      { $inc: { availableQuantity: 1 } },
      { new: true }
    );
    if (!book) {
      await Transaction.updateOne(
        { _id: transaction._id, status: 'Returned' },
        { $set: { returnDate: null, status: existingTransaction.status } }
      );
      return res.status(409).json({ message: 'Book inventory could not be restored. The return was not recorded.' });
    }

    const updatedTransaction = await Transaction.findById(transaction._id).populate('book').populate('member');
    return res.json({ message: 'Book returned successfully', transaction: updatedTransaction });
  } catch (error) {
    next(error);
  }
};

module.exports = { issueBook, getTransactions, getTransactionById, returnBook, recalculateOverdueTransactions };
