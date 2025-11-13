import mongoose from 'mongoose';

const resenaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'La reseña debe estar asociada a un usuario.']
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: [true, 'La reseña debe estar asociada a un producto.']
  },
  puntuacion: {
    type: Number,
    required: [true, 'La calificación es obligatoria.'],
    min: [1, 'La puntuación mínima es 1.'],
    max: [5, 'La puntuación máxima es 5.']
  },
  comentario: {
    type: String,
    trim: true
  },
  eliminado: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Resena', resenaSchema);