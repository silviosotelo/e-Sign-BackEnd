const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Register a new user
exports.registerUser = async (email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword); // Asegúrate de que la contraseña está siendo hasheada
    const user = new User({ email, password: hashedPassword });
    return user.save();
};


// Find user by email
exports.findUserByEmail = async (email) => {
    return User.findOne({ email });
};

// Find user by ID
exports.findUserById = async (id) => {
    return User.findById(id);
};

// Update user
exports.updateUser = async (user, updateFields) => {
    Object.assign(user, updateFields);
    return user.save();
};
