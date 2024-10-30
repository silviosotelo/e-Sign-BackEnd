const express = require('express');
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middlewares/authMiddleware');


const router = express.Router();

// Create a new contract
router.post('/', contractController.createContract);

// Get all contracts
router.get('/', contractController.getContracts);

// Get contracts by id
router.get('/:id', authMiddleware, contractController.getContractsById); 

// Get contracts by users
router.get('/user-contracts', authMiddleware, contractController.getUserContracts);
// Get contracts by users
router.get('/user-contracts/:id', authMiddleware, contractController.getUserIdContracts);

// Sign a contract
router.put('/:id/sign', contractController.signContract);
router.post('/:id/sign', contractController.signContract);


module.exports = router;
