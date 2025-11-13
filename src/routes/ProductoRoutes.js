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

const router = express.Router();

router.get("/", listarProductos);

router.get("/filtro", filtrarProductos);

router.get("/top", productosTop);

router.get("/:id", obtenerProducto);

router.post("/", crearProducto);


router.put("/:id", actualizarProducto);


router.delete("/:id", eliminarProducto);


router.patch("/:id/stock", actualizarStock);

export default router;