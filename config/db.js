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


/*const mongoose = require('mongoose');
require('dotenv').config();

// Opciones de conexión recomendadas por mongoose
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
};
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };


// Función para conectar a MongoDB
const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.DB_URI, options);
        //console.log('Connected to MongoDB');
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1); // Terminar el proceso si falla la conexión
    }
};

// Manejar eventos de desconexión
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    mongoose.connect(process.env.DB_URI, options); // Reintentar conexión
});

module.exports = connectDB;*/
