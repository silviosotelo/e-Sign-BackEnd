const app = require('./app');
const connectDB = require('./config/db'); // Importar conexión desde db.js
require('dotenv').config();

// Conectar a la base de datos
connectDB();

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
