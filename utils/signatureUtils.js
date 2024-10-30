// src/utils/signatureUtils.js
const crypto = require('crypto');

// Generate a pair of keys (public and private)
exports.generateKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // The length of the key in bits
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  return { publicKey, privateKey };
};

// Generate signature for a contract
exports.generateSignature = (data, privateKey) => {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  signer.end();
  return signer.sign(privateKey, 'hex');
};

// Verify contract signature
exports.verifySignature = (data, publicKey, signature) => {
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(data);
  verifier.end();
  return verifier.verify(publicKey, signature, 'hex');
};
