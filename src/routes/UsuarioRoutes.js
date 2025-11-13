import express from "express";
import {
  listarUsuarios,
  obtenerUsuario,
  registrarUsuario,
  registrarAdministrador,
  loginUsuario,
  eliminarUsuario,
  actualizarPerfil,
  actualizarPassword
} from "../controllers/UsuarioController.js";

import verificarToken from "../middlewares/verificarToken.js";
import protegerRutas from "../middlewares/protegerRutas.js";

const router = express.Router();

// 🟢 Rutas públicas
router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);
router.post("/admin", registrarAdministrador);


// 🔐 Rutas protegidas (requieren token)
router.get("/perfil", verificarToken, (req, res) => {
  res.status(200).json({ success: true, data: req.usuario });
});

router.patch("/perfil", verificarToken, actualizarPerfil);
router.patch("/password", verificarToken, actualizarPassword);

// 🔐 Rutas solo para administradores
router.get("/", verificarToken, protegerRutas("administrador"), listarUsuarios);
router.get("/:id", verificarToken, protegerRutas("administrador"), obtenerUsuario);
router.delete("/:id", verificarToken, protegerRutas("administrador"), eliminarUsuario);

export default router;