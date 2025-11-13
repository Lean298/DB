import mongoose from 'mongoose';

const conectarDB = async () => {
  try {
    const defaultDb = process.env.MONGO_DB_NAME || 'Tuki-FoodStore';
    const uri =
      process.env.MONGO_URI ||
      `${process.env.MONGO_URL || 'mongodb://localhost:27017'}/${defaultDb}`;

    const options = {};

    if (process.env.MONGO_USER && process.env.MONGO_PASS) {
      options.user = process.env.MONGO_USER;
      options.pass = process.env.MONGO_PASS;

      if (process.env.MONGO_AUTH_SOURCE) {
        options.authSource = process.env.MONGO_AUTH_SOURCE;
      }
    }

    await mongoose.connect(uri, options);

    console.log('MongoDB conectado');
    console.log('Conectando a MongoDB con URI:', uri);
  } catch (err) {
    console.error('Error de conexión:', err.message);
    process.exit(1);
  }
};

export default conectarDB;
