const express = require('express');
const { body } = require('express-validator');
const { loginAdmin, loginUser, getCurrentAdmin, getCurrentUser, updateProfile, changePassword } = require('../controllers/authController');
const { protect, protectUser } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const router = express.Router();

const adminLoginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post(
  '/admin/login',
  adminLoginValidation,
  handleValidationErrors,
  loginAdmin
);

router.post(
  '/user/login',
  [
    body('rollNo').trim().notEmpty().withMessage('Roll number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  loginUser
);

router.post('/login', adminLoginValidation, handleValidationErrors, loginAdmin);
router.get('/admin/me', protect, getCurrentAdmin);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/user/me', protectUser, getCurrentUser);

module.exports = router;
