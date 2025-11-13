import express from "express";
import {
  crearCarrito,
  obtenerCarritoPorUsuario,
  agregarItem,
  actualizarCantidad,
  eliminarItem,
  vaciarCarrito,
  calcularTotales
} from "../controllers/CarritoController.js";
import verificarToken from "../middlewares/verificarToken.js";

const router = express.Router();

const autorizarUsuario = (req, res, next) => {
  const objetivo = (req.params.usuarioId || req.body.usuario || "").toString();
  if (req.usuario.rol === "administrador" || req.usuario._id.toString() === objetivo) {
    return next();
  }
  if (!objetivo) {
    req.body.usuario = req.usuario._id;
    return next();
  }
  return res.status(403).json({ success: false, error: "No tienes permiso para esta acción" });
};

router.post("/", verificarToken, autorizarUsuario, crearCarrito);
router.get("/:usuarioId/total", verificarToken, autorizarUsuario, calcularTotales);
router.get("/:usuarioId", verificarToken, autorizarUsuario, obtenerCarritoPorUsuario);
router.post("/:usuarioId/items", verificarToken, autorizarUsuario, agregarItem);
router.patch("/:usuarioId/items", verificarToken, autorizarUsuario, actualizarCantidad);
router.delete("/:usuarioId/items/:productoId", verificarToken, autorizarUsuario, eliminarItem);
router.delete("/:usuarioId", verificarToken, autorizarUsuario, vaciarCarrito);

export default router;
