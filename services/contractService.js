const Contract = require('../models/contractModel');

exports.createContract = async (contractData) => {
  const contract = new Contract(contractData);
  return await contract.save();
};

exports.getContracts = async () => {
  return await Contract.find();
};

exports.signContract = async (contractId, signatureData) => {
  const contract = await Contract.findById(contractId);
  if (!contract) throw new Error('Contract not found');
  
  contract.signedBy = signatureData.signedBy;
  contract.signature = signatureData.signature;
  contract.status = 'signed';
  
  return await contract.save();
};
