const mongoose = require('mongoose');
const ClienteSchema = new mongoose.Schema({
  nombre: String,
  cedula: { type: String, unique: true },
  telefono: String,
  direccion: String,
  cobradorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Cobrador' }
});
module.exports = mongoose.model('Cliente', ClienteSchema);