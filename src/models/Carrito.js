import mongoose from 'mongoose';

const itemCarritoSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1.']
  }
}, { _id: false });

const carritoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El carrito debe estar asociado a un usuario.'],
    unique: true // cada usuario tiene un solo carrito activo
  },
  items: [itemCarritoSchema],
  activo: {
    type: Boolean,
    default: true
  },
  eliminado: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Carrito', carritoSchema);