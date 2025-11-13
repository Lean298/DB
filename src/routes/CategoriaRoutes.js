import express from "express";
import {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  estadisticasCategorias
} from "../controllers/CategoriaController.js";
import verificarToken from "../middlewares/verificarToken.js";
import protegerRutas from "../middlewares/protegerRutas.js";

const router = express.Router();

router.get("/", listarCategorias);
router.get("/stats", verificarToken, protegerRutas("administrador"), estadisticasCategorias);
router.get("/:id", obtenerCategoria);
router.post("/", verificarToken, protegerRutas("administrador"), crearCategoria);
router.put("/:id", verificarToken, protegerRutas("administrador"), actualizarCategoria);
router.delete("/:id", verificarToken, protegerRutas("administrador"), eliminarCategoria);

export default router;
