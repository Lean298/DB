import dotenv from 'dotenv';
import express from 'express';
import conectarDB from './src/config/db.js';
import usuariosRoutes from './src/routes/UsuarioRoutes.js';
import productosRoutes from "./src/routes/ProductoRoutes.js";
import categoriasRoutes from "./src/routes/CategoriaRoutes.js";
import carritoRoutes from "./src/routes/CarritoRoutes.js";
import pedidosRoutes from "./src/routes/PedidoRoutes.js";
import resenasRoutes from "./src/routes/ResenaRoutes.js";


dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/ordenes", pedidosRoutes);
app.use("/api/resenas", resenasRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: err.message });
});


app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

const start = async () => {
  await conectarDB();
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
};

start();

export default app;
