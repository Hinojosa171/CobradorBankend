const mongoose = require('mongoose');
const CreditoSchema = new mongoose.Schema({
  monto_prestado: { type: Number, required: true },
  monto_por_pagar: Number,
  estado: { type: String, default: 'Pendiente', enum: ['Pendiente', 'Realizado'] },
  fecha_origen: { type: Date, default: Date.now },
  fecha_vencimiento: Date,
  fecha_pago: Date,
  clienteID: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  cobradorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Cobrador' }
});

// Lógica del 30% antes de guardar
CreditoSchema.pre('save', function(next) {
  this.monto_por_pagar = this.monto_prestado * 1.3;
  next();
});
module.exports = mongoose.model('Credito', CreditoSchema);