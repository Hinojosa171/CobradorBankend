const mongoose = require('mongoose');
const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: { type: String, unique: true, required: true },
  telefono: String,
  email: String,
  direccion: String,
  cobradorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Cobrador' },
  fecha_creacion: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Cliente', ClienteSchema);