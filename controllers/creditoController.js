const Credito = require('../models/Credito');

exports.crearCredito = async (req, res) => {
  try {
    // 1. Verificar si el cliente ya tiene un crédito pendiente
    const creditoActivo = await Credito.findOne({ 
      clienteID: req.body.clienteID, 
      estado: 'Pendiente' 
    });

    if (creditoActivo) {
      return res.status(400).json({ msg: "El cliente ya tiene un crédito activo" });
    }

    // 2. Si no tiene, crear el nuevo crédito
    const nuevoCredito = new Credito(req.body);
    await nuevoCredito.save();
    res.status(201).json(nuevoCredito);
  } catch (error) {
    res.status(500).send("Error en el servidor");
  }
};