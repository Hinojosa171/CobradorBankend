const Gerente = require('../models/Gerente');
const Oficina = require('../models/Oficina');
const Cobrador = require('../models/Cobrador');
const Cliente = require('../models/Cliente');
const Credito = require('../models/Credito');
const Barrio = require('../models/Barrio');

// CREAR GERENTE (Solo administrador del sistema)
exports.crearGerente = async (req, res) => {
  try {
    const { nombre, cedula, celular, direccion, usuario, password } = req.body;

    const gerenteExistente = await Gerente.findOne({ $or: [{ usuario }, { cedula }] });
    if (gerenteExistente) {
      return res.status(400).json({ error: 'Usuario o cédula ya existe' });
    }

    const gerente = new Gerente({
      nombre,
      cedula,
      celular,
      direccion,
      usuario,
      password,
      rol: 'gerente'
    });

    await gerente.save();
    res.json({
      mensaje: '✅ Gerente creado exitosamente',
      gerente: {
        _id: gerente._id,
        nombre: gerente.nombre,
        usuario: gerente.usuario,
        rol: gerente.rol
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// LOGIN GERENTE
exports.loginGerente = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    const gerente = await Gerente.findOne({ usuario, password });
    if (!gerente) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    res.json({
      mensaje: '✅ Login exitoso',
      gerente: {
        _id: gerente._id,
        nombre: gerente.nombre,
        usuario: gerente.usuario,
        rol: gerente.rol
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// OBTENER DATOS DEL GERENTE
exports.obtenerGerente = async (req, res) => {
  try {
    const gerente = await Gerente.findById(req.params.id);
    if (!gerente) {
      return res.status(404).json({ error: 'Gerente no encontrado' });
    }

    res.json(gerente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// CREAR BARRIO (El gerente puede agregar barrios a su sistema)
exports.crearBarrio = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const barrioExistente = await Barrio.findOne({ nombre });
    if (barrioExistente) {
      return res.status(400).json({ error: 'El barrio ya existe' });
    }

    const barrio = new Barrio({
      nombre,
      descripcion
    });

    await barrio.save();
    res.json({
      mensaje: '✅ Barrio creado exitosamente',
      barrio
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// OBTENER TODOS LOS BARRIOS
exports.obtenerBarrios = async (req, res) => {
  try {
    // Devolver TODOS los barrios disponibles, sin importar si fueron asignados a otras oficinas
    const barrios = await Barrio.find({ activo: true });
    res.json(barrios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// CREAR OFICINA (El gerente crea la oficina)
exports.crearOficina = async (req, res) => {
  try {
    const { nombre, cedula, celular, direccion, usuario, password, gerenteID, barrios } = req.body;

    // Validar que el gerente existe
    const gerente = await Gerente.findById(gerenteID);
    if (!gerente) {
      return res.status(404).json({ error: 'Gerente no encontrado' });
    }

    // Validar que usuario no exista
    const oficinaExistente = await Oficina.findOne({ $or: [{ usuario }, { cedula }] });
    if (oficinaExistente) {
      return res.status(400).json({ error: 'Usuario o cédula ya existe' });
    }

    const oficina = new Oficina({
      nombre,
      cedula,
      celular,
      direccion,
      usuario,
      password,
      gerenteID,
      barrios: barrios || [],
      cobradores: [],
      rol: 'oficina'
    });

    await oficina.save();
    await oficina.populate('barrios');

    res.json({
      mensaje: '✅ Oficina creada exitosamente',
      oficina
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// OBTENER OFICINAS DEL GERENTE
exports.obtenerOficinasGerente = async (req, res) => {
  try {
    const gerenteID = req.params.gerenteID;

    const oficinas = await Oficina.find({ gerenteID })
      .populate('barrios')
      .populate('cobradores');

    res.json(oficinas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ASIGNAR BARRIOS A UNA OFICINA
exports.asignarBarriosOficina = async (req, res) => {
  try {
    const { oficiaID, barrios } = req.body;

    const oficina = await Oficina.findById(oficiaID);
    if (!oficina) {
      return res.status(404).json({ error: 'Oficina no encontrada' });
    }

    oficina.barrios = barrios;
    await oficina.save();
    await oficina.populate('barrios');

    res.json({
      mensaje: '✅ Barrios asignados exitosamente',
      oficina
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// CREAR COBRADOR EN UNA OFICINA (El gerente crea cobradores)
exports.crearCobradorOficina = async (req, res) => {
  try {
    const { nombre, cedula, celular, direccion, usuario, password, oficiaID } = req.body;

    // Validar que la oficina existe
    const oficina = await Oficina.findById(oficiaID);
    if (!oficina) {
      return res.status(404).json({ error: 'Oficina no encontrada' });
    }

    // Validar que usuario no exista
    const cobradorExistente = await Cobrador.findOne({ usuario });
    if (cobradorExistente) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    const cobrador = new Cobrador({
      nombre,
      cedula,
      celular,
      direccion,
      usuario,
      password,
      oficinaID: oficiaID
    });

    await cobrador.save();

    // Agregar cobrador a la oficina
    oficina.cobradores.push(cobrador._id);
    await oficina.save();

    res.json({
      mensaje: '✅ Cobrador creado exitosamente',
      cobrador: {
        _id: cobrador._id,
        nombre: cobrador.nombre,
        usuario: cobrador.usuario,
        cedula: cobrador.cedula
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ESTADÍSTICAS DEL GERENTE
exports.estadisticasGerente = async (req, res) => {
  try {
    const gerenteID = req.params.gerenteID;

    // Obtener oficinas del gerente
    const oficinas = await Oficina.find({ gerenteID }).populate('cobradores');

    // Obtener IDs de cobradores
    const cobradorIDs = [];
    oficinas.forEach(oficina => {
      oficina.cobradores.forEach(cobrador => {
        if (!cobradorIDs.includes(cobrador._id)) {
          cobradorIDs.push(cobrador._id);
        }
      });
    });

    // Contar clientes de los cobradores
    const clientes = await Cliente.find({ cobradorID: { $in: cobradorIDs } });
    const totalClientes = clientes.length;

    // Contar créditos y sumar monto prestado
    const creditos = await Credito.find({ cobradorID: { $in: cobradorIDs } });
    const totalDineroPrestado = creditos.reduce((suma, credito) => suma + credito.monto_prestado, 0);
    const totalDineroActual = creditos.reduce((suma, credito) => {
      return credito.estado === 'Realizado' ? suma : suma + credito.monto_por_pagar;
    }, 0);
    const creditosPendientes = creditos.filter(c => c.estado === 'Pendiente').length;

    res.json({
      mensaje: '✅ Estadísticas obtenidas',
      estadisticas: {
        totalOficinas: oficinas.length,
        totalCobradores: cobradorIDs.length,
        totalClientes,
        totalDineroPrestado,
        totalDineroActual,
        creditosPendientes,
        creditosRealizados: creditos.length - creditosPendientes
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
