import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio.'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria.'],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio.'],
    min: [0, 'El precio no puede ser negativo.']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio.'],
    min: [0, 'El stock no puede ser negativo.']
  },
  urlImagen: {
    type: String,
    trim: true
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'El producto debe tener una categoría.']
  },
  reseñas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resena'
  }],
  promedioCalificacion: {
    type: Number,
    default: 0
  },
  totalResenas: {
    type: Number,
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  },
  eliminado: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Producto', productoSchema);