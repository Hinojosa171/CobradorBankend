const Credito = require('../models/Credito'); // Asegúrate de que la ruta y mayúsculas coincidan
const Cliente = require('../models/Cliente');

exports.crearCredito = async (req, res) => {
    try {
        const { cliente, monto_prestado } = req.body;

        // 1. Validar si el cliente ya tiene deuda (Requisito tarea)
        const deudaActiva = await Credito.findOne({ cliente, estado: 'Pendiente' });
        if (deudaActiva) {
            return res.status(400).json({ error: "El cliente ya tiene un crédito activo" });
        }

        // 2. Calcular el 30% de interés automáticamente (Requisito tarea)
        const monto_por_pagar = monto_prestado * 1.30;

        const nuevoCredito = new Credito({
            cliente,
            monto_prestado,
            monto_por_pagar, // Se guarda el total con interés
            fecha: new Date()
        });

        await nuevoCredito.save();
        res.status(201).json(nuevoCredito);
    } catch (error) {
        res.status(400).json({ error: "Error al procesar el crédito" });
    }
};