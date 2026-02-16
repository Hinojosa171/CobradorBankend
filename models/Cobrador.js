const mongoose = require('mongoose');

const CobradorSchema = new mongoose.Schema({
    nombre: String,
    celular: String,
    usuario: { type: String, unique: true },
    contrasena: String,
    rol: { type: String, default: 'cobrador' }
});

module.exports = mongoose.model('Cobrador', CobradorSchema);