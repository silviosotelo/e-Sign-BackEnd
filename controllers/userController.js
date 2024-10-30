const { generateToken, verify2FAToken, generate2FASecret } = require('../utils/authUtils');
const { findUserByEmail, findUserById, registerUser, updateUser } = require('../services/userService');
const { validateRecaptcha } = require('../middlewares/recaptchaMiddleware');
const { check, validationResult } = require('express-validator');
const qrcode = require('qrcode');
const User = require('../models/userModel');
const argon2 = require('argon2');

// Register a new user
exports.registerUser = [
  check('email', 'Invalid email').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }).trim(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, recaptchaToken } = req.body;

    // Validar que la contraseña esté definida y sea de tipo cadena
    if (typeof password !== 'string') {
      return res.status(400).json({ error: 'Password must be a valid string' });
    }

    try {
      let user = await findUserByEmail(email);
      if (user) return res.status(400).json({ error: 'User already exists' });

      // Hash de la contraseña con Argon2
      const hashedPassword = await argon2.hash(password);
      console.log('Hashed password before saving:', hashedPassword); // Verifica el hash antes de guardarlo

      user = new User({ email, password: hashedPassword });
      await user.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('Error during user registration:', err.message);
      res.status(500).json({ error: 'Server error during registration' });
    }
  }
];

// Login user (JWT)
exports.loginUser = async (req, res) => {
  const { email, password, twoFAToken } = req.body;
  try {
    
    // Buscar al usuario por correo electrónico
    const user = await findUserByEmail(email);
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ error: 'Invalid credentials - user not found' });
    }

    // Comparar la contraseña ingresada con la almacenada usando argon2.verify()
    const isMatch = await argon2.verify(user.password, password);
    //console.log('Password match result:', isMatch); // Verifica si la comparación es correcta

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials - incorrect password' });
    }

    // Verificar 2FA si está habilitado
    if (user.is2FAEnabled && !twoFAToken) {
      return res.status(400).json({ error: '2FA token required' });
    }

    if (user.is2FAEnabled && !verify2FAToken(user.twoFASecret, twoFAToken)) {
      return res.status(400).json({ error: 'Invalid 2FA token' });
    }

    // Generar JWT si pasa todas las verificaciones
    const token = generateToken(user);
    res.status(200).json({ token });

  } catch (err) {
    console.error('Login error:', err.message); // Log para depuración
    res.status(500).json({ error: 'Server error during login' });
  }
};


// Google OAuth2 login
exports.googleLogin = async (req, res) => {
  const { tokenId } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ email, googleId });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate 2FA QR code
exports.generate2FA = async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const secret = generate2FASecret();
    user.twoFASecret = secret.base32;
    await updateUser(user, { twoFASecret: secret.base32 });

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ error: 'Error generating QR code' });
      res.json({ qrcode: data_url, secret: secret.base32 });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Obtener contratos del usuario autenticado
exports.getUserData = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verifica que el userId sea válido
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    // Buscar todos los contratos asociados al usuario ordenados por fecha descendente
    const userData = await findUserById(userId);
    const user = {userId: userData._id, email: userData.email, createdAt: userData.createdAt}
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};