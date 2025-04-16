
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.post('/', auth, checkRole('admin'), teacherController.addTeacher);
router.get('/', auth, teacherController.getAllTeachers);
router.get('/:id', auth, teacherController.getTeacherById);
router.put('/:id', auth, checkRole(['admin', 'teacher']), teacherController.updateTeacher);
router.delete('/:id', auth, checkRole('admin'), teacherController.deleteTeacher);

router.get('/:id/schedule', auth, teacherController.getTeacherSchedule);
router.get('/:id/attendance', auth, teacherController.getTeacherAttendance);
router.post('/:id/attendance', auth, checkRole(['admin', 'supervisor_quran', 'supervisor_subjects']), teacherController.markAttendance);
router.get('/:id/salary', auth, checkRole(['admin', 'teacher']), teacherController.getSalaryHistory);

module.exports = router;
