import mongoose from "mongoose";
import Carrito from "../models/Carrito.js";
import Producto from "../models/Producto.js";

export const crearCarrito = async (req, res, next) => {
  try {
    const usuario = req.body.usuario || req.usuario?._id;
    if (!usuario) {
      return res.status(400).json({ success: false, error: "El usuario es requerido" });
    }

    if (
      req.usuario &&
      req.usuario.rol !== "administrador" &&
      req.usuario._id.toString() !== usuario.toString()
    ) {
      return res.status(403).json({ success: false, error: "Acceso denegado al carrito" });
    }

    const existente = await Carrito.findOne({ usuario, eliminado: false });
    if (existente) {
      return res.status(200).json({ success: true, data: existente });
    }

    const nuevo = await Carrito.create({ usuario, items: [] });
    res.status(201).json({ success: true, data: nuevo });
  } catch (e) {
    next(e);
  }
};

export const obtenerCarritoPorUsuario = async (req, res, next) => {
  try {
    const { usuarioId } = req.params;
    const carrito = await Carrito.findOne({
      usuario: usuarioId,
      eliminado: false
    }).populate({
      path: "items.producto",
      select: "nombre precio stock"
    });

    if (!carrito) {
      return res.status(404).json({ success: false, error: "Carrito no encontrado" });
    }

    res.status(200).json({ success: true, data: carrito });
  } catch (e) {
    next(e);
  }
};

export const agregarItem = async (req, res, next) => {
  try {
    const { usuarioId } = req.params;
    const { productoId, cantidad } = req.body;

    if (!productoId || cantidad === undefined) {
      return res.status(400).json({ success: false, error: "Producto y cantidad son obligatorios" });
    }

    const cantidadNumerica = Number(cantidad);
    if (Number.isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      return res.status(400).json({ success: false, error: "La cantidad debe ser mayor a cero" });
    }

    const producto = await Producto.findOne({ _id: productoId, eliminado: false });
    if (!producto) {
      return res.status(404).json({ success: false, error: "Producto no encontrado" });
    }

    if (producto.stock < cantidadNumerica) {
      return res.status(400).json({ success: false, error: "Stock insuficiente" });
    }

    const carrito = await Carrito.findOne({ usuario: usuarioId, eliminado: false });
    if (!carrito) {
      return res.status(404).json({ success: false, error: "Carrito no encontrado" });
    }

    const existente = carrito.items.find((item) => item.producto.toString() === productoId);

    if (existente) {
      await Carrito.updateOne(
        { _id: carrito._id, "items.producto": new mongoose.Types.ObjectId(productoId) },
        { $set: { "items.$.cantidad": existente.cantidad + cantidadNumerica } }
      );
    } else {
      await Carrito.updateOne(
        { _id: carrito._id },
        { $push: { items: { producto: productoId, cantidad: cantidadNumerica } } }
      );
    }

    const actualizado = await Carrito.findById(carrito._id).populate({
      path: "items.producto",
      select: "nombre precio stock"
    });

    res.status(200).json({ success: true, data: actualizado });
  } catch (e) {
    next(e);
  }
};

export const actualizarCantidad = async (req, res, next) => {
  try {
    const { usuarioId } = req.params;
    const { productoId, cantidad } = req.body;

    const cantidadNumerica = Number(cantidad);
    if (Number.isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      return res.status(400).json({ success: false, error: "La cantidad debe ser mayor a cero" });
    }

    const carrito = await Carrito.findOne({ usuario: usuarioId, eliminado: false });
    if (!carrito) {
      return res.status(404).json({ success: false, error: "Carrito no encontrado" });
    }

    const resultado = await Carrito.findOneAndUpdate(
      {
        _id: carrito._id,
        "items.producto": productoId
      },
      { $set: { "items.$.cantidad": cantidadNumerica } },
      { new: true }
    ).populate({
      path: "items.producto",
      select: "nombre precio"
    });

    if (!resultado) {
      return res.status(404).json({ success: false, error: "Producto no existe en el carrito" });
    }

    res.status(200).json({ success: true, data: resultado });
  } catch (e) {
    next(e);
  }
};

export const eliminarItem = async (req, res, next) => {
  try {
    const { usuarioId, productoId } = req.params;

    const carrito = await Carrito.findOneAndUpdate(
      { usuario: usuarioId, eliminado: false },
      { $pull: { items: { producto: new mongoose.Types.ObjectId(productoId) } } },
      { new: true }
    ).populate({
      path: "items.producto",
      select: "nombre precio"
    });

    if (!carrito) {
      return res.status(404).json({ success: false, error: "Carrito no encontrado" });
    }

    res.status(200).json({ success: true, data: carrito });
  } catch (e) {
    next(e);
  }
};

export const vaciarCarrito = async (req, res, next) => {
  try {
    const { usuarioId } = req.params;
    const carrito = await Carrito.findOneAndUpdate(
      { usuario: usuarioId, eliminado: false },
      { $set: { items: [] } },
      { new: true }
    );

    if (!carrito) {
      return res.status(404).json({ success: false, error: "Carrito no encontrado" });
    }

    res.status(200).json({ success: true, data: carrito });
  } catch (e) {
    next(e);
  }
};

export const calcularTotales = async (req, res, next) => {
  try {
    const { usuarioId } = req.params;

    const pipeline = [
      {
        $match: {
          usuario: new mongoose.Types.ObjectId(usuarioId),
          eliminado: false
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "productos",
          localField: "items.producto",
          foreignField: "_id",
          as: "producto"
        }
      },
      { $unwind: "$producto" },
      {
        $addFields: {
          subtotal: { $multiply: ["$items.cantidad", "$producto.precio"] }
        }
      },
      {
        $group: {
          _id: "$_id",
          total: { $sum: "$subtotal" },
          detalles: {
            $push: {
              producto: "$producto.nombre",
              cantidad: "$items.cantidad",
              subtotal: "$subtotal"
            }
          }
        }
      }
    ];

    const resultado = await Carrito.aggregate(pipeline);

    if (resultado.length === 0) {
      const existe = await Carrito.findOne({ usuario: usuarioId, eliminado: false });
      if (!existe) {
        return res.status(404).json({ success: false, error: "Carrito no encontrado" });
      }
      return res.status(200).json({ success: true, data: { total: 0, detalles: [] } });
    }

    res.status(200).json({ success: true, data: resultado[0] });
  } catch (e) {
    next(e);
  }
};
