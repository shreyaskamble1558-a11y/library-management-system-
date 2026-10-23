const express = require('express');
const { body } = require('express-validator');
const { issueBook, getTransactions, getTransactionById, returnBook } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', protect, getTransactions);
router.get('/:id', protect, getTransactionById);
router.post(
  '/issue',
  protect,
  [
    body('memberId').notEmpty().withMessage('Member is required'),
    body('bookId').notEmpty().withMessage('Book is required'),
    body('issueDate').notEmpty().withMessage('Issue date is required'),
    body('expectedReturnDate').notEmpty().withMessage('Expected return date is required'),
  ],
  handleValidationErrors,
  issueBook
);
router.put('/:id/return', protect, returnBook);

module.exports = router;
