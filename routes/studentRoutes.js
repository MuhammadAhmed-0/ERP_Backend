const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// @route   POST /api/students
// @desc    Add a new student
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    checkRole('admin'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
      check('guardianName', 'Guardian name is required').not().isEmpty(),
      check('guardianContact', 'Guardian contact is required').not().isEmpty()
    ]
  ],
  studentController.addStudent
);

// @route   GET /api/students
// @desc    Get all students
// @access  Private (with role-based filtering)
router.get(
  '/',
  auth,
  studentController.getStudents
);

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private (with role-based checks)
router.get(
  '/:id',
  auth,
  studentController.getStudentById
);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (admin or self)
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Name is required').optional().not().isEmpty(),
      check('email', 'Please include a valid email').optional().isEmail(),
      check('guardianContact', 'Guardian contact is required').optional().not().isEmpty()
    ]
  ],
  studentController.updateStudent
);

// @route   GET /api/students/:id/attendance
// @desc    Get student attendance
// @access  Private (with role-based checks)
router.get(
  '/:id/attendance',
  auth,
  studentController.getStudentAttendance
);

// @route   GET /api/students/:id/fees
// @desc    Get student fee history
// @access  Private (admin or self)
router.get(
  '/:id/fees',
  auth,
  studentController.getStudentFeeHistory
);

module.exports = router;