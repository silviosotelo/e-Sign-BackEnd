const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// User registration
router.post('/register', authController.registerUser);

// User login
router.post('/login', authController.loginUser);

// Google OAuth login
router.post('/google', authController.googleLogin);

module.exports = router;
