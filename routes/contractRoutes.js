const express = require('express');
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middlewares/authMiddleware');


const router = express.Router();

// Create a new contract
router.post('/', contractController.createContract);

// Get all contracts
router.get('/', contractController.getContracts);

// Get contracts by users
router.get('/user-contracts', authMiddleware, contractController.getUserContracts);

// Sign a contract
router.put('/:id/sign', contractController.signContract);

module.exports = router;
