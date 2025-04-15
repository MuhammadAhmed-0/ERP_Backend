const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// @route   POST /api/auth/register
// @desc    Register a user (admin only)
// @access  Private/Admin
router.post(
  '/register',
  [
    auth,
    checkRole('admin'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
      check('role', 'Role is required').isIn(['student', 'teacher', 'supervisor_quran', 'supervisor_subjects', 'admin'])
    ]
  ],
  authController.registerUser
);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.loginUser
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put(
  '/change-password',
  [
    auth,
    [
      check('currentPassword', 'Current password is required').exists(),
      check('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 })
    ]
  ],
  authController.changePassword
);

module.exports = router;