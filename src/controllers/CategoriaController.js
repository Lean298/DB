import mongoose from "mongoose";
import Categoria from "../models/Categoria.js";
import { crear, actualizarPorId, eliminarPorId } from "./baseController.js";

export const listarCategorias = async (req, res, next) => {
  try {
    const categorias = await Categoria.find({ eliminado: false }).sort({ nombre: 1 });
    res.status(200).json({ success: true, data: categorias });
  } catch (e) {
    next(e);
  }
};

export const obtenerCategoria = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Identificador inválido" });
    }

    const categoria = await Categoria.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      eliminado: false
    });

    if (!categoria) {
      return res.status(404).json({ success: false, error: "Categoría no encontrada" });
    }

    res.status(200).json({ success: true, data: categoria });
  } catch (e) {
    next(e);
  }
};

export const crearCategoria = crear(Categoria);
export const actualizarCategoria = actualizarPorId(Categoria);
export const eliminarCategoria = eliminarPorId(Categoria);

export const estadisticasCategorias = async (req, res, next) => {
  try {
    const resultado = await Categoria.aggregate([
      { $match: { eliminado: false } },
      {
        $lookup: {
          from: "productos",
          let: { categoriaId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$categoria", "$$categoriaId"] },
                    { $eq: ["$eliminado", false] }
                  ]
                }
              }
            },
            { $count: "total" }
          ],
          as: "productos"
        }
      },
      {
        $addFields: {
          totalProductos: { $ifNull: [{ $arrayElemAt: ["$productos.total", 0] }, 0] }
        }
      },
      { $project: { productos: 0 } },
      { $sort: { totalProductos: -1, nombre: 1 } }
    ]);

    res.status(200).json({ success: true, data: resultado });
  } catch (e) {
    next(e);
  }
};
