
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/:id', auth, checkRole('admin'), userController.getUserById);
router.get('/', auth, checkRole('admin'), userController.getAllUsers);
router.delete('/:id', auth, checkRole('admin'), userController.deleteUser);

module.exports = router;
