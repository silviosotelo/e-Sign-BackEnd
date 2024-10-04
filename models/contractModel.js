const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }, // Contenido del contrato, puede ser un template
  signed: { type: Boolean, default: false },
  signature: { type: String }, // URL o base64 de la firma del usuario
  signedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contract', contractSchema);
