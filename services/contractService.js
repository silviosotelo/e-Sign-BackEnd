const Contract = require('../models/contractModel');
const User = require('../models/userModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Crear un nuevo contrato para un usuario específico por email
exports.createContractForUser = async (email, contractData) => {
  try {
    // Buscar al usuario por correo electrónico
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    // Crear el contrato con el `userId` asociado al usuario encontrado
    const contract = new Contract({
      ...contractData,
      userId: user._id
    });

    return await contract.save();
  } catch (error) {
    throw new Error(error.message);
  }
};


// Crear un nuevo contrato
exports.createContract = async (contractData) => {
  const contract = new Contract(contractData);
  return await contract.save();
};

// Obtener todos los contratos
exports.getContracts = async () => {
  return await Contract.find();
};

// Obtener todos los contratos del usuario
exports.getUserContracts = async (userId) => {
  return await Contract.find(userId);
};

// Firmar un contrato
exports.signContract = async (contractId, signature) => {
  const contract = await Contract.findById(contractId);

  if (!contract) {
    throw new Error('Contract not found');
  }

  if (contract.signed) {
    throw new Error('Contract already signed');
  }

  // Actualizar el contrato con la firma
  contract.signed = true;
  contract.signature = signature;
  contract.signedAt = new Date();
  await contract.save();

  // Generar PDF firmado opcionalmente
  await generateSignedPDF(contract);

  return contract;
};

// Generar un PDF firmado del contrato
const generateSignedPDF = async (contract) => {
  const doc = new PDFDocument();
  const fileName = `signed_contract_${contract._id}.pdf`;

  doc.pipe(fs.createWriteStream(fileName));

  doc.fontSize(16).text(contract.content, {
    align: 'left'
  });

  if (contract.signature) {
    // Convertir la firma base64 a buffer para incrustarla en el PDF
    const imgBuffer = Buffer.from(contract.signature.split(',')[1], 'base64');
    doc.image(imgBuffer, {
      fit: [200, 100],
      align: 'center',
      valign: 'bottom'
    });
  }

  doc.end();
};
