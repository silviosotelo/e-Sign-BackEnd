const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, default: null },
  document: { type: String, default: null },
  password: { type: String, required: true },
  googleId: { type: String, default: null },
  is2FAEnabled: { type: Boolean, default: false },
  twoFASecret: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  contracts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contract' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
