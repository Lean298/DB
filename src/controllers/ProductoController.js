import Producto from "../models/Producto.js";
import Categoria from "../models/Categoria.js";
import mongoose from "mongoose";


export const listarProductos = async (req, res, next) => {
  try {
    const productos = await Producto.aggregate([
      { $match: { eliminado: false } },
      {
        $lookup: {
          from: "categorias",
          localField: "categoria",
          foreignField: "_id",
          as: "categoria"
        }
      },
      { $unwind: "$categoria" }
    ]);
    res.status(200).json({ success: true, data: productos });
  } catch (e) {
    next(e);
  }
};


export const filtrarProductos = async (req, res, next) => {
  try {
    const { min, max, marca } = req.query;

    const condiciones = [{ eliminado: false }];

    if (min || max) {
      condiciones.push({
        precio: {
          ...(min && { $gte: Number(min) }),
          ...(max && { $lte: Number(max) })
        }
      });
    }

    if (marca) {
      condiciones.push({ descripcion: { $regex: marca, $options: "i" } }); // ejemplo: marca en descripción
    }

    const productos = await Producto.find({ $and: condiciones }).populate("categoria");
    res.status(200).json({ success: true, data: productos });
  } catch (e) {
    next(e);
  }
};


export const productosTop = async (req, res, next) => {
  try {
    const top = await Producto.aggregate([
      { $match: { eliminado: false } },
      { $sort: { totalResenas: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "categorias",
          localField: "categoria",
          foreignField: "_id",
          as: "categoria"
        }
      },
      { $unwind: "$categoria" },
      {
        $project: {
          nombre: 1,
          totalResenas: 1,
          promedioCalificacion: 1,
          categoria: "$categoria.nombre"
        }
      }
    ]);
    res.status(200).json({ success: true, data: top });
  } catch (e) {
    next(e);
  }
};


export const actualizarStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    const actualizado = await Producto.findByIdAndUpdate(
      id,
      { $set: { stock: cantidad } },
      { new: true, runValidators: true }
    );

    if (!actualizado) return res.status(404).json({ error: "Producto no encontrado" });

    res.status(200).json({ success: true, data: actualizado });
  } catch (e) {
    next(e);
  }
};


export const obtenerProducto = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id).populate("categoria");
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(200).json({ success: true, data: producto });
  } catch (e) {
    next(e);
  }
};

export const crearProducto = async (req, res, next) => {
  try {
    const nuevo = await Producto.create(req.body);
    res.status(201).json({ success: true, data: nuevo });
  } catch (e) {
    next(e);
  }
};

export const actualizarProducto = async (req, res, next) => {
  try {
    const actualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!actualizado) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(200).json({ success: true, data: actualizado });
  } catch (e) {
    next(e);
  }
};

export const eliminarProducto = async (req, res, next) => {
  try {
    const eliminado = await Producto.findByIdAndUpdate(
      req.params.id,
      { $set: { eliminado: true } },
      { new: true }
    );
    if (!eliminado) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(200).json({ success: true, data: eliminado });
  } catch (e) {
    next(e);
  }
};