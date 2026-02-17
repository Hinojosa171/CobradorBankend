const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Tu nueva ruta de MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Prueba:EdlicA6qY2fxU7n4@cluster0.0ht3eoq.mongodb.net/TuCobradorDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error de conexión:", err));

// Rutas rápidas para pruebas
const Cobrador = require('../models/Cobrador');
const Cliente = require('../models/Cliente');
const Credito = require('../models/Credito');
const { crearCredito } = require('../controllers/creditoController');

app.post('/api/cobradores', async (req, res) => {
  const cobrador = new Cobrador(req.body);
  await cobrador.save();
  res.json(cobrador);
});

app.post('/api/clientes', async (req, res) => {
  const cliente = new Cliente(req.body);
  await cliente.save();
  res.json(cliente);
});

// Ruta de créditos con la validación del 30%
app.post('/api/creditos', crearCredito);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en puerto ${PORT}`));

module.exports = app;