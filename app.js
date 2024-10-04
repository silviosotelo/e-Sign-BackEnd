const express = require('express');
const contractRoutes = require('./routes/contractRoutes');
const authRoutes = require('./routes/authRoutes');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // Importar variables de entorno

const app = express();

// Middlewares de seguridad
app.use(helmet());

// Configuración CORS (Descomentar si tienes dominios específicos)
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*', // URL del frontend desde .env
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};
app.use(cors(corsOptions));

// Middleware para análisis del body
app.use(bodyParser.json());

// Limitar el número de solicitudes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite por IP
    message: 'Too many requests, please try again later.'
});

app.use(limiter); // Aplicar limitación globalmente

// Definir rutas
app.use('/api/contracts', contractRoutes);
app.use('/api/auth', authRoutes);

// Capturar rutas inexistentes
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Manejo de errores
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
