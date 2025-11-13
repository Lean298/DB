import mongoose from "mongoose";
import Resena from "../models/resena.js";
import Producto from "../models/Producto.js";
import Pedido from "../models/Pedido.js";

export const listarResenas = async (req, res, next) => {
  try {
    const resenas = await Resena.find({ eliminado: false })
      .populate({ path: "usuario", select: "nombre email" })
      .populate({ path: "producto", select: "nombre precio" })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: resenas });
  } catch (e) {
    next(e);
  }
};

export const obtenerResena = async (req, res, next) => {
  try {
    const resena = await Resena.findOne({ _id: req.params.id, eliminado: false })
      .populate({ path: "usuario", select: "nombre" })
      .populate({ path: "producto", select: "nombre" });

    if (!resena) {
      return res.status(404).json({ success: false, error: "Reseña no encontrada" });
    }

    res.status(200).json({ success: true, data: resena });
  } catch (e) {
    next(e);
  }
};

export const crearResena = async (req, res, next) => {
  try {
    const { producto, puntuacion, comentario } = req.body;
    const usuarioId = req.usuario._id;

    const productoExiste = await Producto.findOne({ _id: producto, eliminado: false });
    if (!productoExiste) {
      return res.status(404).json({ success: false, error: "Producto no encontrado" });
    }

    const compra = await Pedido.findOne({
      usuario: usuarioId,
      eliminado: false,
      detalles: { $elemMatch: { producto: new mongoose.Types.ObjectId(producto) } }
    });

    if (!compra) {
      return res.status(403).json({ success: false, error: "Debes comprar el producto antes de reseñar" });
    }

    const resena = await Resena.create({
      usuario: usuarioId,
      producto,
      puntuacion,
      comentario
    });

    await Producto.findByIdAndUpdate(producto, { $push: { reseñas: resena._id } });

    await actualizarEstadisticasProducto(producto);

    res.status(201).json({ success: true, data: resena });
  } catch (e) {
    next(e);
  }
};

export const actualizarResena = async (req, res, next) => {
  try {
    const resena = await Resena.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuario._id, eliminado: false },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!resena) {
      return res.status(404).json({ success: false, error: "Reseña no encontrada" });
    }

    await actualizarEstadisticasProducto(resena.producto);

    res.status(200).json({ success: true, data: resena });
  } catch (e) {
    next(e);
  }
};

export const eliminarResena = async (req, res, next) => {
  try {
    const filtro =
      req.usuario.rol === "administrador"
        ? { _id: req.params.id }
        : { _id: req.params.id, usuario: req.usuario._id };

    const resena = await Resena.findOneAndUpdate(
      filtro,
      { $set: { eliminado: true } },
      { new: true }
    );

    if (!resena) {
      return res.status(404).json({ success: false, error: "Reseña no encontrada" });
    }

    await Producto.findByIdAndUpdate(resena.producto, {
      $pull: { reseñas: resena._id }
    });

    await actualizarEstadisticasProducto(resena.producto);

    res.status(200).json({ success: true, data: resena });
  } catch (e) {
    next(e);
  }
};

export const resenasPorProducto = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const resenas = await Resena.find({
      producto: productId,
      eliminado: false
    })
      .populate({ path: "usuario", select: "nombre" })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: resenas });
  } catch (e) {
    next(e);
  }
};

export const topResenas = async (req, res, next) => {
  try {
    const pipeline = [
      { $match: { eliminado: false } },
      {
        $group: {
          _id: "$producto",
          promedioCalificacion: { $avg: "$puntuacion" },
          totalResenas: { $sum: 1 }
        }
      },
      { $sort: { promedioCalificacion: -1, totalResenas: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "productos",
          localField: "_id",
          foreignField: "_id",
          as: "producto"
        }
      },
      { $unwind: "$producto" },
      {
        $project: {
          producto: "$producto.nombre",
          promedioCalificacion: { $round: ["$promedioCalificacion", 2] },
          totalResenas: 1
        }
      }
    ];

    const resultado = await Resena.aggregate(pipeline);

    res.status(200).json({ success: true, data: resultado });
  } catch (e) {
    next(e);
  }
};

const actualizarEstadisticasProducto = async (productoId) => {
  const stats = await Resena.aggregate([
    {
      $match: {
        producto: new mongoose.Types.ObjectId(productoId),
        eliminado: false
      }
    },
    {
      $group: {
        _id: "$producto",
        promedio: { $avg: "$puntuacion" },
        total: { $sum: 1 }
      }
    }
  ]);

  const data = stats[0] || { promedio: 0, total: 0 };

  await Producto.findByIdAndUpdate(productoId, {
    $set: {
      promedioCalificacion: data.promedio,
      totalResenas: data.total
    }
  });
};
