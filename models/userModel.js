const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String },
  googleId: { type: String },
  is2FAEnabled: { type: Boolean, default: false },
  twoFASecret: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  contracts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contract' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
