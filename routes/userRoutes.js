const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// User data
router.get('/:id', userController.getUserData);

module.exports = router;
