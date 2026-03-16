const mongoose = require('mongoose');

const BarrioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: String,
  activo: { type: Boolean, default: true },
  fecha_creacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Barrio', BarrioSchema);
