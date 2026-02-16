const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
    nombre: String,
    cedula: { type: String, unique: true },
    direccion: String,
    celular: String,
    cobrador: { type: mongoose.Schema.Types.ObjectId, ref: 'Cobrador' },
    monto_prestado: { type: Number, default: 0 },
    monto_por_pagar: { type: Number, default: 0 },
    estado: { type: String, enum: ['Al día', 'En mora'], default: 'Al día' }
});

module.exports = mongoose.model('Cliente', ClienteSchema);