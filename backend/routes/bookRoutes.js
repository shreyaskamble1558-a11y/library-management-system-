const express = require('express');
const { body } = require('express-validator');
const { getBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', protect, getBooks);
router.get('/:id', protect, getBookById);
router.post(
  '/',
  protect,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('isbn').notEmpty().withMessage('ISBN is required'),
    body('quantity').isFloat({ min: 1 }).withMessage('Quantity must be greater than 0'),
  ],
  handleValidationErrors,
  createBook
);
router.put(
  '/:id',
  protect,
  [
    body('title').optional().notEmpty().withMessage('Title is required'),
    body('author').optional().notEmpty().withMessage('Author is required'),
    body('category').optional().notEmpty().withMessage('Category is required'),
    body('quantity').optional().isFloat({ min: 1 }).withMessage('Quantity must be greater than 0'),
  ],
  handleValidationErrors,
  updateBook
);
router.delete('/:id', protect, deleteBook);

module.exports = router;
