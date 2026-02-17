const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Cobrador = require('../models/Cobrador');
const Cliente = require('../models/Cliente');

const app = express();
app.use(cors());
app.use(express.json());


// Conexión a Mongo usando la variable de entorno de Vercel

const uri = "mongodb+srv://Pedidos:12121212@cluster0.9pvuv.mongodb.net/CobrosDB?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log("✅ ¡POR FIN CONECTADO CON USUARIO PEDIDOS!"))
  .catch(err => console.error("❌ Error de conexión:", err.message));
// --- RUTAS SOLICITADAS ---

// 1. Crear Cobrador (POST)
app.post('/api/cobradores', async (req, res) => {
    try {
        const nuevo = new Cobrador(req.body);
        await nuevo.save();
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(400).json({ error: "Error al crear cobrador" });
    }
});

// 2. Crear Cliente (POST)
app.post('/api/clientes', async (req, res) => {
    try {
        const nuevoCliente = new Cliente(req.body);
        await nuevoCliente.save();
        res.status(201).json(nuevoCliente);
    } catch (error) {
        res.status(400).json({ error: "Error al crear cliente" });
    }
});

// 3. Crear Crédito (POST) - AQUÍ ESTÁ EL 30%
app.post('/api/creditos', async (req, res) => {
    const { clienteId, monto } = req.body;
    try {
        const cliente = await Cliente.findById(clienteId);
        
        // Validación: Si ya debe, no se le presta
        if (cliente.monto_por_pagar > 0) {
            return res.status(400).json({ error: "El cliente tiene una deuda activa" });
        }

        cliente.monto_prestado = monto;
        cliente.monto_por_pagar = monto * 1.30; // Lógica del 30% a 1 cuota
        cliente.estado = 'En mora'; // Cambia a mora hasta que pague
        await cliente.save();

        res.json({ msg: "Crédito aprobado", total_pagar: cliente.monto_por_pagar });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar crédito" });
    }
});

// 4. Traer clientes de un cobrador (GET)
app.get('/api/cobradores/:id/clientes', async (req, res) => {
    const clientes = await Cliente.find({ cobrador: req.params.id });
    res.json(clientes);
});

// 5. Consultar créditos de un cliente (GET)
app.get('/api/clientes/:id', async (req, res) => {
    const cliente = await Cliente.findById(req.params.id);
    res.json(cliente);
});

module.exports = app;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});