const contractService = require('../services/contractService');

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

// Obtener los contratos del usuario autenticado
exports.getUserContracts = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Buscar todos los contratos asociados al usuario
    const contracts = await contractService.getUserContracts({ userId });
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sign a contract
exports.signContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Signature is required' });
    }

    const signedContract = await contractService.signContract(id, signature);
    res.status(200).json(signedContract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
