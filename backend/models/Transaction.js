const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    issueDate: { type: Date, required: true },
    expectedReturnDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: { type: String, enum: ['Issued', 'Returned', 'Overdue'], default: 'Issued' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
