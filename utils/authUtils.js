const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
require('dotenv').config();

// Generate JWT token
exports.generateToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
};

// Generate Refresh Token (long-lived)
exports.generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.REFRESH_SECRET, { expiresIn: '1h' });
};

// Verify JWT token
exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
};

// Generate 2FA secret
exports.generate2FASecret = () => {
    return speakeasy.generateSecret({ length: 20 });
};

// Verify 2FA token
exports.verify2FAToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token
    });
};
