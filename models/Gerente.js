const mongoose = require('mongoose');

const GerenteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  celular: String,
  direccion: String,
  usuario: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  activo: { type: Boolean, default: true },
  rol: { type: String, default: 'gerente' },
  fecha_creacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gerente', GerenteSchema);
