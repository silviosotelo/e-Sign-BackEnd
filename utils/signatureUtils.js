const crypto = require('crypto');

// Generate signature for a contract
exports.generateSignature = (data, privateKey) => {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  return signer.sign(privateKey, 'hex');
};

// Verify contract signature
exports.verifySignature = (data, publicKey, signature) => {
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(data);
  return verifier.verify(publicKey, signature, 'hex');
};
