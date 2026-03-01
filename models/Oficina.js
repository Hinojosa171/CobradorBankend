const mongoose = require('mongoose');

const OficinaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  celular: String,
  direccion: String,
  usuario: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, default: 'oficina' },
  fecha_creacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Oficina', OficinaSchema);
