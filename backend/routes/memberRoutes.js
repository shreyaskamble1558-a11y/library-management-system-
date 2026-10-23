const express = require('express');
const { body } = require('express-validator');
const { getMembers, getMemberById, createMember, updateMember, deleteMember } = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', protect, getMembers);
router.get('/:id', protect, getMemberById);
router.post(
  '/',
  protect,
  [
    body('memberId').notEmpty().withMessage('Member ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('membershipDate').notEmpty().withMessage('Membership date is required'),
    body('password').isLength({ min: 8 }).withMessage('User password must be at least 8 characters'),
  ],
  handleValidationErrors,
  createMember
);
router.put(
  '/:id',
  protect,
  [
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('phone').optional().notEmpty().withMessage('Phone is required'),
    body('address').optional().notEmpty().withMessage('Address is required'),
    body('password').optional().isLength({ min: 8 }).withMessage('User password must be at least 8 characters'),
  ],
  handleValidationErrors,
  updateMember
);
router.delete('/:id', protect, deleteMember);

module.exports = router;
