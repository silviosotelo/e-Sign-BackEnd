// contractController.js
const contractService = require('../services/contractService');
const { generateKeyPair, generateSignature } = require('../utils/signatureUtils');
const { getClientIp } = require('request-ip'); // Utilizar para obtener la IP del cliente

// Create a new contract for a specific user
exports.createContract = async (req, res) => {
  try {
    const { email, title, content } = req.body;

    if (!email || !title || !content) {
      return res.status(400).json({ error: 'Email, title, and content are required' });
    }

    // Crear el contrato para el usuario con el email proporcionado
    const contract = await contractService.createContractForUser(email, { title, content });
    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ error: error.message, pilin: "1cm" });
  }
};

// Get all contracts
exports.getContracts = async (req, res) => {
  try {
    const contracts = await contractService.getContracts();
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all contracts
exports.getContractsById = async (req, res) => {
  try {
    console.log(req.params.id);
    const contractId = req.params.id;
    const contracts = await contractService.getContractsById(contractId);
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener contratos del usuario autenticado
exports.getUserContracts = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('userId: ', userId);

    // Verifica que el userId sea válido
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Buscar todos los contratos asociados al usuario ordenados por fecha descendente
    const contracts = await contractService.getUserContracts(userId);
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener contratos del usuario autenticado
exports.getUserIdContracts = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verifica que el userId sea válido
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Buscar todos los contratos asociados al usuario ordenados por fecha descendente
    const contracts = await contractService.getUserContracts(userId);
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Obtener contratos del usuario por ID
exports.getContractsByUser = async (req, res) => {
  try {
    // Obtener el userId del token o de los parámetros de la solicitud
    const userId = req.user._id; // Si estás usando autenticación y el userId está en el token, por ejemplo
    const contracts = await contractService.getUserContracts(userId);
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sign a contract
exports.signContract = async (req, res) => {
  try {
    const { id } = req.params;
    //console.log('req.body: ', req.body);
    const { userId, email, ip } = req.body.signatureData;



    // Crear los datos para la firma digital
    const dataToSign = `Contrato ID: ${id}, User ID: ${userId}, Email: ${email}, IP: ${ip}`;

    // Generar par de claves pública y privada
    const { publicKey, privateKey } = generateKeyPair();

    // Generar firma digital usando la clave privada
    const signature = generateSignature(dataToSign, privateKey);

    // Firmar el contrato
    const signedContract = await contractService.signContract(id, {
      signature,
      signedAt: new Date(),
      userId,
      email,
      ip,
      publicKey, // Guardar la clave pública para la verificación futura
    });

    res.status(200).json(signedContract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
