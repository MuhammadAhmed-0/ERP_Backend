
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.get('/fees/history/:studentId', auth, checkRole(['admin', 'student']), paymentController.getStudentFeeHistory);
router.get('/salary/history/:teacherId', auth, checkRole(['admin', 'teacher']), paymentController.getTeacherSalaryHistory);
router.post('/fees/pay/:challanId', auth, checkRole(['admin', 'student']), paymentController.payFeeChallan);
router.post('/salary/pay/:invoiceId', auth, checkRole('admin'), paymentController.paySalaryInvoice);

module.exports = router;
