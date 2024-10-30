const Contract = require('../models/contractModel');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const PDFKitDocument = require('pdfkit');
const { PDFDocument: PDFLibDocument, rgb } = require('pdf-lib');


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
  return await Contract.find().sort({ createdAt: -1 });;
};

// Obtener contrato por Id
exports.getContractsById = async (contractId) => {
  return await Contract.findById(contractId);
};

// Obtener todos los contratos del usuario ordenados por fecha descendente
exports.getUserContracts = async (userId) => {
  try {  
    return await Contract.find({ userId }).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching contracts for user ${userId}: ${error.message}`);
  }
};

// Firmar un contrato
exports.signContract = async (contractId, signatureData) => {
  const contract = await Contract.findById(contractId);

  if (!contract) {
    throw new Error('Contract not found');
  }

  if (contract.signed) {
    throw new Error('Contract already signed');
  }

  // Desestructuramos el objeto `signatureData`
  const { signature, publicKey, signedAt, userId, email, ip } = signatureData;

  // Verificar que todos los valores necesarios estén presentes
  if (!userId || !email || !ip || !signedAt || !signature || !publicKey) {
    throw new Error('Incomplete signature data');
  }

  // Actualizar el contrato con la firma
  contract.signed = true;
  contract.signature = signature; // Firma digital del contrato
  contract.publicKey = publicKey; // Guardar la clave pública para la verificación futura
  contract.signedAt = signedAt;
  contract.signedBy = {
    userId: userId,
    email: email,
    ip: ip,
  };

  // Generar un PDF firmado del contrato
  try {
    const pdfPath = await generateSignedPDF(contract);

    // Verificar si el archivo fue generado correctamente
    if (!fs.existsSync(pdfPath)) {
      throw new Error('Error generating signed PDF: File does not exist');
    }

    // Leer el PDF firmado y convertirlo a base64
    const pdfContent = fs.readFileSync(pdfPath).toString('base64');
    contract.content = `data:application/pdf;base64,${pdfContent}`;
  } catch (error) {
    console.error('Error while generating signed PDF or reading file:', error.message);
    throw new Error('Error generating signed PDF');
  }

  // Guardar el contrato actualizado
  try {
    await contract.save();
  } catch (saveError) {
    console.error('Error while saving contract:', saveError.message);
    throw new Error('Error saving signed contract');
  }

  return contract;
};



// Generar un PDF inicial a partir del contenido en base64 del contrato
const generateInitialPDF = async (contract) => {
  const fileName = path.join(__dirname, `../signed_contracts/signed_contract_${contract._id}.pdf`);

  // Crear el directorio si no existe
  const dirPath = path.dirname(fileName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  try {
    // Decodificar el contenido base64 y guardarlo como archivo PDF
    const pdfBase64 = contract.content.split(',')[1];
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    fs.writeFileSync(fileName, pdfBuffer);

    return fileName;
  } catch (error) {
    console.error('Error al generar el PDF inicial:', error.message);
    throw new Error('Error al generar el PDF inicial');
  }
};

// Generar un PDF firmado del contrato
const generateSignedPDF = async (contract) => {
  const filePath = path.join(__dirname, `../signed_contracts/signed_contract_${contract._id}.pdf`);

  // Verificar si el archivo existe, si no, crear el archivo inicial
  if (!fs.existsSync(filePath)) {
    console.log('El archivo PDF no existe. Generando PDF inicial...');
    await generateInitialPDF(contract);
  }

  try {
    // Leer el PDF existente
    const existingPdfBytes = fs.readFileSync(filePath);

    // Cargar el PDF existente usando pdf-lib
    const pdfDoc = await PDFLibDocument.load(existingPdfBytes);

    // Obtener la última página para agregar la firma
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();

    // Incrustar la fuente estándar Helvetica
    const font = await pdfDoc.embedFont('Helvetica');

    // Definir la posición del pie de página
    const footerYPosition = 50; // Espacio desde la parte inferior de la página

    // Agregar detalles de la firma en el pie de página de la última página
    lastPage.drawText(`Firmado por: ${contract.signedBy.email}`, {
      x: 10,
      y: footerYPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    lastPage.drawText(`Usuario ID: ${contract.signedBy.userId}`, {
      x: 10,
      y: footerYPosition - 10,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    lastPage.drawText(`Clave Privada: ${contract.signature}`, {
      x: 10,
      y: footerYPosition - 20,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    lastPage.drawText(`Fecha de Firma: ${new Date(contract.signedAt).toLocaleString()}`, {
      x: 10,
      y: footerYPosition - 30,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    lastPage.drawText(`Dirección IP: ${contract.signedBy.ip}`, {
      x: 10,
      y: footerYPosition - 40,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Incluir la firma como imagen si está disponible
    if (contract.signature) {
      try {
        const imgBuffer = Buffer.from(contract.signature.split(',')[1], 'base64');
        const pngImage = await pdfDoc.embedPng(imgBuffer);

        // Ajustar la firma para que se coloque correctamente al pie, centrada
        lastPage.drawImage(pngImage, {
          x: (width - 200) / 2, // Centrar la firma horizontalmente
          y: footerYPosition - 140,
          width: 200,
          height: 80,
        });
      } catch (error) {
        console.error('Error al insertar la imagen de la firma:', error.message);
      }
    }

    // Guardar el PDF modificado
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);

    return filePath;
  } catch (error) {
    console.error('Error al generar el PDF firmado:', error.message);
    throw new Error('Error al generar el PDF firmado');
  }
};
