const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ CONFIGURACIÓN DE CORS PARA PRODUCCIÓN Y DESARROLLO
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Permitir cualquier *.vercel.app en producción
    const isVercelDomain = origin && origin.includes('.vercel.app');
    
    // Permitir peticiones sin origin (como mobile apps o curl)
    if (!origin || allowedOrigins.includes(origin) || isVercelDomain) {
      console.log(`✅ Origen permitido: ${origin || 'sin origen'}`);
      callback(null, true);
    } else {
      console.warn(`⚠️ Origen bloqueado: ${origin}`);
      callback(new Error('CORS no permitido'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND (solo en desarrollo local)
const frontendBuildPath = path.join(__dirname, '../../frontend-movil/build');
if (process.env.NODE_ENV === 'development') {
  app.use(express.static(frontendBuildPath));
  console.log(`📁 Sirviendo archivos estáticos desde: ${frontendBuildPath}`);
}

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI no está configurado en .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB Atlas");
    console.log(`📍 Base de datos: ${MONGO_URI.split('/').pop().split('?')[0]}`);
  })
  .catch(err => {
    console.error("❌ Error de conexión a MongoDB:", err.message);
    console.error("📍 URL utilizada:", MONGO_URI);
    process.exit(1);
  });

const Cobrador = require('../models/Cobrador');
const Cliente = require('../models/Cliente');
const Credito = require('../models/Credito');
const Oficina = require('../models/Oficina');
const Gerente = require('../models/Gerente');
const Barrio = require('../models/Barrio');
const { crearCredito } = require('../controllers/creditoController');
const { 
  crearGerente,
  loginGerente,
  obtenerGerente,
  crearBarrio,
  obtenerBarrios,
  crearOficina,
  obtenerOficinasGerente,
  asignarBarriosOficina,
  crearCobradorOficina,
  estadisticasGerente
} = require('../controllers/gerenteController');

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

// ============================================
// RUTAS DEL GERENTE
// ============================================

// CREAR GERENTE
app.post('/api/gerentes', crearGerente);

// LOGIN GERENTE
app.post('/api/gerentes/login', loginGerente);

// OBTENER DATOS DEL GERENTE
app.get('/api/gerentes/:id', obtenerGerente);

// CREAR BARRIO
app.post('/api/barrios', crearBarrio);

// OBTENER TODOS LOS BARRIOS
app.get('/api/barrios', obtenerBarrios);

// CREAR OFICINA DESDE GERENTE
app.post('/api/gerentes/oficinas/crear', crearOficina);

// OBTENER OFICINAS DEL GERENTE
app.get('/api/gerentes/:gerenteID/oficinas', obtenerOficinasGerente);

// ASIGNAR BARRIOS A UNA OFICINA
app.post('/api/oficinas/asignar-barrios', asignarBarriosOficina);

// CREAR COBRADOR EN UNA OFICINA
app.post('/api/oficinas/cobradores/crear', crearCobradorOficina);

// OBTENER ESTADÍSTICAS DEL GERENTE
app.get('/api/gerentes/:gerenteID/estadisticas', estadisticasGerente);

// ============================================
// FIN RUTAS DEL GERENTE
// ============================================

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

// MIDDLEWARE DE MANEJO GLOBAL DE ERRORES
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.message);
  console.error('📍 Stack:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error en el servidor'
  });
});

// RUTA CATCH-ALL PARA EL SPA (React Router)
// Envía index.html para cualquier ruta que no sea /api
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en puerto ${PORT}`));

