const mongoose = require('mongoose');
require('dotenv').config();
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const connectDB = async () => {
  try {
    // Conexión a la base de datos utilizando la URI almacenada en el archivo .env
    const conn = await mongoose.connect(process.env.DB_URI, clientOptions);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1); // Detener el servidor si hay un error en la conexión
  }
};

module.exports = connectDB;