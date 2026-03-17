const mongoose = require('mongoose');
const CobradorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  celular: String,
  direccion: String,
  usuario: { type: String, required: true },
  password: { type: String, required: true },
  oficinaID: { type: mongoose.Schema.Types.ObjectId, ref: 'Oficina' },
  activo: { type: Boolean, default: true },
  fecha_creacion: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Cobrador', CobradorSchema);