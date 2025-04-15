
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.post('/', auth, checkRole('admin'), announcementController.createAnnouncement);
router.get('/', auth, announcementController.getAnnouncements);
router.get('/:id', auth, announcementController.getAnnouncementById);
router.put('/:id', auth, checkRole('admin'), announcementController.updateAnnouncement);
router.delete('/:id', auth, checkRole('admin'), announcementController.deleteAnnouncement);

module.exports = router;
