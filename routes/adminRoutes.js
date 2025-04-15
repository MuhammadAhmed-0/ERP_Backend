
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.post('/users', auth, checkRole('admin'), adminController.addUser);
router.get('/users', auth, checkRole('admin'), adminController.getAllUsers);
router.get('/users/:role', auth, checkRole('admin'), adminController.getUsersByRole);
router.put('/permissions/:userId', auth, checkRole('admin'), adminController.updatePermissions);

router.post('/announcements', auth, checkRole('admin'), adminController.createAnnouncement);
router.get('/announcements', auth, checkRole('admin'), adminController.getAnnouncements);

router.post('/fees/challan/:studentId', auth, checkRole('admin'), adminController.generateFeeChallan);
router.post('/salary/:teacherId', auth, checkRole('admin'), adminController.generateSalaryInvoice);
router.post('/bonus/:teacherId', auth, checkRole('admin'), adminController.addTeacherBonus);

module.exports = router;
