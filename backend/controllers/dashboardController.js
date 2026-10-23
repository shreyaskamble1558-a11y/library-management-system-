const Book = require('../models/Book');
const Member = require('../models/Member');
const Transaction = require('../models/Transaction');
const { recalculateOverdueTransactions } = require('./transactionController');

const getDashboardStats = async (req, res, next) => {
  try {
    await recalculateOverdueTransactions();

    const [totalBooks, totalMembers, transactions, books] = await Promise.all([
      Book.countDocuments(),
      Member.countDocuments(),
      Transaction.find().lean(),
      Book.find().lean(),
    ]);

    const activeMembers = await Member.countDocuments({ status: 'Active' });
    const availableBooks = books.reduce((total, book) => total + (book.availableQuantity || 0), 0);
    const issuedBooks = books.reduce((total, book) => total + (Math.max(0, book.quantity - (book.availableQuantity || 0))), 0);
    const returnedBooks = transactions.filter((transaction) => transaction.status === 'Returned').length;
    const overdueBooks = transactions.filter((transaction) => transaction.status === 'Overdue').length;

    return res.json({
      stats: {
        totalBooks,
        availableBooks,
        issuedBooks,
        totalMembers,
        activeMembers,
        returnedBooks,
        overdueBooks,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecentTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate('book')
      .populate('member')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({ transactions });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getRecentTransactions };
