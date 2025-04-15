
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.post('/', auth, checkRole(['admin', 'supervisor_quran', 'supervisor_subjects']), scheduleController.createSchedule);
router.get('/', auth, scheduleController.getSchedules);
router.get('/:id', auth, scheduleController.getScheduleById);
router.put('/:id', auth, checkRole(['admin', 'supervisor_quran', 'supervisor_subjects']), scheduleController.updateSchedule);
router.delete('/:id', auth, checkRole(['admin', 'supervisor_quran', 'supervisor_subjects']), scheduleController.deleteSchedule);

module.exports = router;
