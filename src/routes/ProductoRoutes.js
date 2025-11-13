import express from "express";
import {
  listarProductos,
  filtrarProductos,
  productosTop,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  actualizarStock
} from "../controllers/ProductoController.js";
import verificarToken from "../middlewares/verificarToken.js";
import protegerRutas from "../middlewares/protegerRutas.js";

const router = express.Router();

router.get("/", listarProductos);

router.get("/filtro", filtrarProductos);

router.get("/top", productosTop);

router.get("/:id", obtenerProducto);

router.post("/", verificarToken, protegerRutas("administrador"), crearProducto);
router.put("/:id", verificarToken, protegerRutas("administrador"), actualizarProducto);
router.delete("/:id", verificarToken, protegerRutas("administrador"), eliminarProducto);
router.patch("/:id/stock", verificarToken, protegerRutas("administrador"), actualizarStock);

export default router;
