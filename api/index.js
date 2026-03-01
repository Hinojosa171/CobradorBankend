const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CONFIGURACIÓN DE CORS - Acepta cualquier origen
app.use(cors({
  origin: '*', // Permite cualquier origen (dirección IP o localhost)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false
}));

app.use(express.json());

// SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND
const frontendBuildPath = path.join(__dirname, '../../frontend-movil/build');
app.use(express.static(frontendBuildPath));
console.log(`📁 Sirviendo archivos estáticos desde: ${frontendBuildPath}`);

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI no está configurado en .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error de conexión:", err));

const Cobrador = require('../models/Cobrador');
const Cliente = require('../models/Cliente');
const Credito = require('../models/Credito');
const Oficina = require('../models/Oficina');
const { crearCredito } = require('../controllers/creditoController');

// CÓDIGO PROTEGIDO PARA REGISTRO DE OFICINA
const CODIGO_OFICINA = '123456789';

// RUTA DE PRUEBA: Escribe http://localhost:3000/api/test en tu navegador
app.get('/api/test', (req, res) => {
  res.json({ mensaje: "¡El backend está vivo y respondiendo!" });
});

// RUTAS GET (Necesarias para el Front)
app.get('/api/cobradores', async (req, res) => {
  try {
    const cobradores = await Cobrador.find();
    res.json(cobradores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OBTENER TODAS LAS OFICINAS
app.get('/api/oficinas', async (req, res) => {
  try {
    const oficinas = await Oficina.find();
    res.json(oficinas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA PARA CREAR UN USUARIO DE PRUEBA
app.post('/api/crear-usuario-prueba', async (req, res) => {
  try {
    // Primero verifica si ya existe
    const existe = await Cobrador.findOne({ usuario: 'admin' });
    
    if (existe) {
      return res.json({ mensaje: 'Usuario admin ya existe', usuario: 'admin', password: '123456' });
    }
    
    // Si no existe, lo crea
    const cobradorPrueba = new Cobrador({
      nombre: 'Administrador',
      cedula: '123456789',
      celular: '1234567890',
      direccion: 'Calle Principal',
      usuario: 'admin',
      password: '123456'
    });
    
    await cobradorPrueba.save();
    res.json({ 
      mensaje: '✅ Usuario de prueba creado exitosamente',
      usuario: 'admin', 
      password: '123456' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// RUTAS POST
app.post('/api/cobradores', async (req, res) => {
  try {
    const cobrador = new Cobrador(req.body);
    await cobrador.save();
    res.json(cobrador);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// REGISTRO DE OFICINA CON CÓDIGO PROTEGIDO
app.post('/api/oficinas', async (req, res) => {
  try {
    const { nombre, cedula, celular, direccion, usuario, password, codigo } = req.body;

    // Validar que se proporcionó el código
    if (!codigo) {
      return res.status(400).json({ error: 'El código de acceso es requerido' });
    }

    // Validar que el código es correcto
    if (codigo !== CODIGO_OFICINA) {
      return res.status(401).json({ error: 'Código de acceso incorrecto' });
    }

    // Crear la nueva oficina
    const oficina = new Oficina({
      nombre,
      cedula,
      celular,
      direccion,
      usuario,
      password,
      rol: 'oficina'
    });

    await oficina.save();
    res.json({ 
      mensaje: '✅ Oficina registrada exitosamente',
      usuario: oficina.usuario,
      nombre: oficina.nombre,
      rol: oficina.rol
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CREAR CLIENTE
app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// RUTA GET PARA OBTENER TODOS LOS CRÉDITOS
app.get('/api/creditos', async (req, res) => {
  try {
    const creditos = await Credito.find()
      .populate('clienteID', 'nombre cedula telefono')
      .populate('cobradorID', 'nombre');
    res.json(creditos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA POST PARA CREAR CRÉDITOS
app.post('/api/creditos', crearCredito);

// RUTA PUT PARA DESACTIVAR/ACTIVAR COBRADORES
app.put('/api/cobradores/:id/toggle-activo', async (req, res) => {
  try {
    const cobrador = await Cobrador.findById(req.params.id);
    
    if (!cobrador) {
      return res.status(404).json({ error: 'Cobrador no encontrado' });
    }

    // Invertir el estado activo
    cobrador.activo = !cobrador.activo;
    await cobrador.save();

    res.json({
      mensaje: cobrador.activo ? '✅ Cobrador activado' : '✅ Cobrador desactivado',
      cobrador: cobrador
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// RUTA PUT PARA ACTUALIZAR CRÉDITOS (marcar como pagado)
app.put('/api/creditos/:id', async (req, res) => {
  try {
    const creditoActualizado = await Credito.findByIdAndUpdate(
      req.params.id,
      { 
        estado: req.body.estado,
        fecha_pago: req.body.estado === 'Realizado' ? new Date() : null
      },
      { new: true }
    );
    res.json(creditoActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA CATCH-ALL PARA EL SPA (React Router)
// Envía index.html para cualquier ruta que no sea /api
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en puerto ${PORT}`));

