import express from "express";
import {
  listarResenas,
  obtenerResena,
  crearResena,
  actualizarResena,
  eliminarResena,
  resenasPorProducto,
  topResenas
} from "../controllers/ResenaController.js";
import verificarToken from "../middlewares/verificarToken.js";

const router = express.Router();

router.get("/", listarResenas);
router.get("/top", topResenas);
router.get("/product/:productId", resenasPorProducto);
router.get("/:id", obtenerResena);
router.post("/", verificarToken, crearResena);
router.patch("/:id", verificarToken, actualizarResena);
router.delete("/:id", verificarToken, eliminarResena);

export default router;
