const express = require('express');
const contractController = require('../controllers/contractController');

const router = express.Router();

// Create a new contract
router.post('/', contractController.createContract);

// Get all contracts
router.get('/', contractController.getContracts);

// Sign a contract
router.put('/:id/sign', contractController.signContract);

module.exports = router;
