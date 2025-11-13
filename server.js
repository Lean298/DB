import dotenv from 'dotenv';
import express from 'express';
import conectarDB from './src/config/db.js';
import usuariosRoutes from './src/routes/UsuarioRoutes.js';
import productosRoutes from "./src/routes/ProductoRoutes.js";


dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);


app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

const start = async () => {
  await conectarDB();
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
};

start();