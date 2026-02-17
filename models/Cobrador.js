const mongoose = require('mongoose');
const CobradorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  celular: String,
  direccion: String,
  usuario: { type: String, required: true },
  password: { type: String, required: true }
});
module.exports = mongoose.model('Cobrador', CobradorSchema);