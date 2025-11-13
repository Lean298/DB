import Pedido from "../models/Pedido.js";
import Producto from "../models/Producto.js";
import Carrito from "../models/Carrito.js";

export const listarPedidos = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const filtro = { eliminado: false };

    if (estado) {
      const estados = estado.split(",").map((item) => item.trim());
      filtro.estado = { $in: estados };
    }

    const pedidos = await Pedido.find(filtro)
      .populate({ path: "usuario", select: "nombre email" })
      .populate({ path: "detalles.producto", select: "nombre precio" })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: pedidos });
  } catch (e) {
    next(e);
  }
};

export const obtenerPedido = async (req, res, next) => {
  try {
    const pedido = await Pedido.findOne({
      _id: req.params.id,
      eliminado: false
    })
      .populate({ path: "usuario", select: "nombre email" })
      .populate({ path: "detalles.producto", select: "nombre precio" });

    if (!pedido) {
      return res.status(404).json({ success: false, error: "Pedido no encontrado" });
    }

    if (
      req.usuario.rol !== "administrador" &&
      pedido.usuario._id.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ success: false, error: "No puedes acceder a este pedido" });
    }

    res.status(200).json({ success: true, data: pedido });
  } catch (e) {
    next(e);
  }
};

export const crearPedido = async (req, res, next) => {
  try {
    const { usuarioId, items, metodoPago } = req.body;

    if (!usuarioId || !items?.length) {
      return res.status(400).json({ success: false, error: "Usuario e items son obligatorios" });
    }

    if (
      req.usuario.rol !== "administrador" &&
      req.usuario._id.toString() !== usuarioId.toString()
    ) {
      return res.status(403).json({ success: false, error: "No puedes crear pedidos para otro usuario" });
    }

    const itemsInvalidos = items.some(
      (item) => !item.producto || !item.cantidad || Number(item.cantidad) <= 0
    );

    if (itemsInvalidos) {
      return res.status(400).json({ success: false, error: "Los items deben incluir producto y cantidad válida" });
    }

    const productosIds = items.map((item) => item.producto);
    const productos = await Producto.find({
      _id: { $in: productosIds },
      eliminado: false
    });

    if (productos.length !== productosIds.length) {
      return res.status(400).json({ success: false, error: "Algún producto no está disponible" });
    }

    let total = 0;
    const detalles = [];

    for (const item of items) {
      const producto = productos.find((prod) => prod._id.equals(item.producto));
      if (!producto) {
        return res.status(400).json({ success: false, error: "Producto no disponible" });
      }
      if (producto.stock < item.cantidad) {
        return res.status(400).json({ success: false, error: `Stock insuficiente para ${producto.nombre}` });
      }
      const subtotal = producto.precio * item.cantidad;
      total += subtotal;
      detalles.push({
        producto: producto._id,
        cantidad: item.cantidad,
        subtotal
      });
    }

    const pedido = await Pedido.create({
      usuario: usuarioId,
      metodoPago,
      detalles,
      total
    });

    await Promise.all(
      detalles.map((detalle) =>
        Producto.findByIdAndUpdate(detalle.producto, {
          $inc: { stock: -detalle.cantidad }
        })
      )
    );

    await Carrito.findOneAndUpdate(
      { usuario: usuarioId, eliminado: false },
      { $set: { items: [] } }
    );

    res.status(201).json({ success: true, data: pedido });
  } catch (e) {
    next(e);
  }
};

export const actualizarPedido = async (req, res, next) => {
  try {
    const actualizado = await Pedido.findOneAndUpdate(
      { _id: req.params.id, eliminado: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!actualizado) {
      return res.status(404).json({ success: false, error: "Pedido no encontrado" });
    }

    res.status(200).json({ success: true, data: actualizado });
  } catch (e) {
    next(e);
  }
};

export const eliminarPedido = async (req, res, next) => {
  try {
    const eliminado = await Pedido.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { eliminado: true } },
      { new: true }
    );

    if (!eliminado) {
      return res.status(404).json({ success: false, error: "Pedido no encontrado" });
    }

    res.status(200).json({ success: true, data: eliminado });
  } catch (e) {
    next(e);
  }
};

export const estadisticasPedidos = async (req, res, next) => {
  try {
    const stats = await Pedido.aggregate([
      { $match: { eliminado: false } },
      {
        $group: {
          _id: "$estado",
          totalPedidos: { $sum: 1 },
          montoTotal: { $sum: "$total" }
        }
      },
      { $sort: { totalPedidos: -1 } }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (e) {
    next(e);
  }
};

export const pedidosPorUsuario = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.usuario.rol !== "administrador" && req.usuario._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: "No puedes acceder a estos pedidos" });
    }

    const pedidos = await Pedido.find({ usuario: userId, eliminado: false })
      .populate({ path: "detalles.producto", select: "nombre precio" })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: pedidos });
  } catch (e) {
    next(e);
  }
};

export const actualizarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;

    const pedido = await Pedido.findOneAndUpdate(
      { _id: req.params.id, eliminado: false },
      { $set: { estado } },
      { new: true, runValidators: true }
    );

    if (!pedido) {
      return res.status(404).json({ success: false, error: "Pedido no encontrado" });
    }

    res.status(200).json({ success: true, data: pedido });
  } catch (e) {
    next(e);
  }
};
