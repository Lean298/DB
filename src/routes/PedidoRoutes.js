import express from "express";
import {
  listarPedidos,
  obtenerPedido,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
  estadisticasPedidos,
  pedidosPorUsuario,
  actualizarEstado
} from "../controllers/PedidoController.js";
import verificarToken from "../middlewares/verificarToken.js";
import protegerRutas from "../middlewares/protegerRutas.js";

const router = express.Router();

const asegurarPropietario = (req, res, next) => {
  const objetivo = (req.params.userId || req.body.usuarioId || req.params.id || "").toString();
  if (req.usuario.rol === "administrador" || req.usuario._id.toString() === objetivo) {
    if (!req.body.usuarioId) {
      req.body.usuarioId = objetivo || req.usuario._id;
    }
    return next();
  }

  if (!req.body.usuarioId && req.body) {
    req.body.usuarioId = req.usuario._id;
    return next();
  }

  return res.status(403).json({ success: false, error: "No tienes permiso para esta acción" });
};

router.get("/", verificarToken, protegerRutas("administrador"), listarPedidos);
router.get("/stats", verificarToken, protegerRutas("administrador"), estadisticasPedidos);
router.get("/user/:userId", verificarToken, asegurarPropietario, pedidosPorUsuario);
router.get("/:id", verificarToken, obtenerPedido);
router.post("/", verificarToken, asegurarPropietario, crearPedido);
router.put("/:id", verificarToken, protegerRutas("administrador"), actualizarPedido);
router.delete("/:id", verificarToken, protegerRutas("administrador"), eliminarPedido);
router.patch("/:id/status", verificarToken, protegerRutas("administrador"), actualizarEstado);

export default router;
