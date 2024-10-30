const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  //console.log('authHeader: ', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId }; // Asegúrate de que `userId` sea una cadena y no un objeto
    next(); // Pasar al siguiente middleware o al controlador
  } catch (error) {
    return res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
