
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.post('/', auth, checkRole('admin'), clientController.createClient);
router.get('/', auth, checkRole('admin'), clientController.getAllClients);
router.get('/:id', auth, checkRole('admin'), clientController.getClientById);
router.put('/:id', auth, checkRole('admin'), clientController.updateClient);
router.delete('/:id', auth, checkRole('admin'), clientController.deleteClient);

module.exports = router;
