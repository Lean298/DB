import mongoose from 'mongoose';

const conectarDB = async () => {
  try {
    const uri = `${process.env.MONGO_URL}/${process.env.MONGO_DB_NAME}?authSource=admin`;
    await mongoose.connect(uri, {
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS,
    });
    console.log('MongoDB conectado');
    console.log("Conectando a MongoDB con URI:", uri);
  } catch (err) {
    console.error('Error de conexión:', err.message);
    process.exit(1);
  }
};

export default conectarDB;