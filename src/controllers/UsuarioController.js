import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import Carrito from "../models/Carrito.js";
import { hashearPassword, compararPassword } from "../middlewares/hashPassword.js";
import {
  listarTodos,
  obtenerPorId,
  crear,
  actualizarPorId,
  eliminarPorId
} from "./baseController.js";

export const listarUsuarios = async (req, res, next) => {
  try {
    const { estado } = req.query;

    let filtro = { rol: "cliente" }; 

    if (estado === "activos") filtro.eliminado = false;
    else if (estado === "eliminados") filtro.eliminado = true;

    const usuarios = await Usuario.find(filtro);
    res.status(200).json({ success: true, data: usuarios });
  } catch (e) {
    next(e);
  }
};


export const obtenerUsuario = obtenerPorId(Usuario);

export const registrarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, direccion, telefono } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ error: "Email ya registrado" });

    const passwordHasheado = await hashearPassword(password);
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      direccion,
      telefono,
      password: passwordHasheado
    });

    res.status(201).json({ success: true, data: nuevoUsuario });
  } catch (e) {
    next(e);
  }
};

export const registrarAdministrador = async (req, res) => {
  try {
    const { nombre, email, password, direccion, telefono } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: "El email ya está registrado" });

    const passwordHasheado = await hashearPassword(password);
    const nuevoAdmin = await Usuario.create({
      nombre,
      email,
      password: passwordHasheado,
      direccion,
      telefono,
      rol: "administrador"
    });

    res.status(201).json({ mensaje: "Administrador creado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear administrador", error });
  }
};

export const loginUsuario = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario || usuario.eliminado) {
      return res.status(401).json({ error: "Credenciales inválidas o usuario eliminado" });
    }

    const coincide = await compararPassword(password, usuario.password);
    if (!coincide) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ success: true, token });
  } catch (e) {
    next(e);
  }
};

export const eliminarUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { eliminado: true },
      { new: true }
    );

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    await Carrito.findOneAndUpdate(
      { usuario: req.params.id },
      { eliminado: true }
    );

    res.status(200).json({ success: true, data: usuario });
  } catch (e) {
    next(e);
  }
};

export const actualizarPerfil = async (req, res, next) => {
  try {
    const camposPermitidos = ["nombre", "direccion", "telefono"];
    const datosActualizados = {};

    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        datosActualizados[campo] = req.body[campo];
      }
    });

    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      { $set: datosActualizados },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: usuario });
  } catch (e) {
    next(e);
  }
};

export const actualizarPassword = async (req, res, next) => {
  try {
    const { actual, nueva } = req.body;

    if (!actual || !nueva) {
      return res.status(400).json({ error: "Debes enviar la contraseña actual y la nueva." });
    }

    const usuario = await Usuario.findById(req.usuario._id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado." });

    const coincide = await compararPassword(actual, usuario.password);
    if (!coincide) {
      return res.status(401).json({ error: "La contraseña actual es incorrecta." });
    }

    const nuevaHasheada = await hashearPassword(nueva);
    usuario.password = nuevaHasheada;
    await usuario.save();

    res.status(200).json({ success: true, message: "Contraseña actualizada correctamente." });
  } catch (e) {
    next(e);
  }
};