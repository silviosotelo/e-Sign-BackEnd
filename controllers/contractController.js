const contractService = require('../services/contractService');

// Create a new contract
exports.createContract = async (req, res) => {
  try {
    const contract = await contractService.createContract(req.body);
    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Sign a contract
exports.signContract = async (req, res) => {
  try {
    const signedContract = await contractService.signContract(req.params.id, req.body);
    res.status(200).json(signedContract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
