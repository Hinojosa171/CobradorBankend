# 🚀 SISTEMA DE GERENTES - GUÍA DE USO DEL BACKEND

## 📋 ENDPOINTS DEL GERENTE

### 1️⃣ CREAR GERENTE
**POST** `/api/gerentes`

```json
{
  "nombre": "Juan Pérez",
  "cedula": "98765432",
  "celular": "3005551234",
  "direccion": "Calle 10 #20-30",
  "usuario": "juan_gerente",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "mensaje": "✅ Gerente creado exitosamente",
  "gerente": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez",
    "usuario": "juan_gerente",
    "rol": "gerente"
  }
}
```

---

### 2️⃣ LOGIN GERENTE
**POST** `/api/gerentes/login`

```json
{
  "usuario": "juan_gerente",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "mensaje": "✅ Login exitoso",
  "gerente": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez",
    "usuario": "juan_gerente",
    "rol": "gerente"
  }
}
```

---

### 3️⃣ OBTENER DATOS DEL GERENTE
**GET** `/api/gerentes/:id`

**Ejemplo:** `http://localhost:3000/api/gerentes/507f1f77bcf86cd799439011`

---

### 4️⃣ CREAR BARRIOS (Siloé, Terrón Colorado, etc.)
**POST** `/api/barrios`

```json
{
  "nombre": "Siloé",
  "descripcion": "Barrio ubicado en el sur de la ciudad"
}
```

O crear múltiples barrios:
```json
{
  "nombre": "Terrón Colorado",
  "descripcion": "Zona residencial norte"
}
```

Barrios sugeridos:
- Siloé
- Terrón Colorado
- Potrero Grande
- El Retiro
- Sucre
- Poblado II
- Los Alcázares

---

### 5️⃣ OBTENER TODOS LOS BARRIOS
**GET** `/api/barrios`

**Respuesta:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Siloé",
    "descripcion": "Barrio ubicado en el sur",
    "activo": true,
    "fecha_creacion": "2024-03-15T10:30:00Z"
  },
  ...
]
```

---

### 6️⃣ CREAR OFICINA (El gerente crea la oficina)
**POST** `/api/gerentes/oficinas/crear`

```json
{
  "nombre": "Oficina Centro",
  "cedula": "123456789",
  "celular": "3005551111",
  "direccion": "Calle Principal 100",
  "usuario": "oficina_centro",
  "password": "pass123",
  "gerenteID": "507f1f77bcf86cd799439011",
  "barrios": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}
```

**Respuesta:**
```json
{
  "mensaje": "✅ Oficina creada exitosamente",
  "oficina": {
    "_id": "507f1f77bcf86cd799439020",
    "nombre": "Oficina Centro",
    "usuario": "oficina_centro",
    "gerenteID": "507f1f77bcf86cd799439011",
    "barrios": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "nombre": "Siloé"
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "nombre": "Terrón Colorado"
      }
    ],
    "cobradores": [],
    "activo": true
  }
}
```

---

### 7️⃣ OBTENER OFICINAS DEL GERENTE
**GET** `/api/gerentes/:gerenteID/oficinas`

**Ejemplo:** `http://localhost:3000/api/gerentes/507f1f77bcf86cd799439011/oficinas`

Devuelve todas las oficinas creadas por ese gerente con sus barrios y cobradores.

---

### 8️⃣ ASIGNAR BARRIOS A UNA OFICINA
**POST** `/api/oficinas/asignar-barrios`

```json
{
  "oficiaID": "507f1f77bcf86cd799439020",
  "barrios": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
}
```

---

### 9️⃣ CREAR COBRADOR EN UNA OFICINA
**POST** `/api/oficinas/cobradores/crear`

```json
{
  "nombre": "Carlos González",
  "cedula": "87654321",
  "celular": "3005552222",
  "direccion": "Carrera 50 #30-40",
  "usuario": "carlos_cobrador",
  "password": "cobrador123",
  "oficiaID": "507f1f77bcf86cd799439020"
}
```

**Respuesta:**
```json
{
  "mensaje": "✅ Cobrador creado exitosamente",
  "cobrador": {
    "_id": "507f1f77bcf86cd799439030",
    "nombre": "Carlos González",
    "usuario": "carlos_cobrador",
    "cedula": "87654321"
  }
}
```

---

### 🔟 OBTENER ESTADÍSTICAS DEL GERENTE
**GET** `/api/gerentes/:gerenteID/estadisticas`

**Ejemplo:** `http://localhost:3000/api/gerentes/507f1f77bcf86cd799439011/estadisticas`

**Respuesta:**
```json
{
  "mensaje": "✅ Estadísticas obtenidas",
  "estadisticas": {
    "totalOficinas": 2,
    "totalCobradores": 5,
    "totalClientes": 25,
    "totalDineroPrestado": 2500000,
    "totalDineroActual": 3250000,
    "creditosPendientes": 18,
    "creditosRealizados": 7
  }
}
```

---

## 🧪 SCRIPT DE PRUEBA COMPLETO

Para probar todo el sistema de forma ordenada:

```bash
# 1. Crear gerente
curl -X POST http://localhost:3000/api/gerentes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "cedula": "98765432",
    "celular": "3005551234",
    "direccion": "Calle 10 #20-30",
    "usuario": "juan_gerente",
    "password": "contraseña123"
  }'

# Copiar el _id del gerente (ej: 507f1f77bcf86cd799439011)

# 2. Crear barrios
curl -X POST http://localhost:3000/api/barrios \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Siloé", "descripcion": "Barrio sur"}'

curl -X POST http://localhost:3000/api/barrios \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Terrón Colorado", "descripcion": "Barrio norte"}'

# Copiar los _id de los barrios

# 3. Crear oficina
curl -X POST http://localhost:3000/api/gerentes/oficinas/crear \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Oficina Centro",
    "cedula": "123456789",
    "celular": "3005551111",
    "direccion": "Centro",
    "usuario": "oficina_centro",
    "password": "pass123",
    "gerenteID": "507f1f77bcf86cd799439011",
    "barrios": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
  }'

# 4. Crear cobrador
curl -X POST http://localhost:3000/api/oficinas/cobradores/crear \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos González",
    "cedula": "87654321",
    "celular": "3005552222",
    "direccion": "Carrera 50",
    "usuario": "carlos_cobrador",
    "password": "cobrador123",
    "oficiaID": "507f1f77bcf86cd799439020"
  }'

# 5. Ver estadísticas
curl http://localhost:3000/api/gerentes/507f1f77bcf86cd799439011/estadisticas
```

---

## 📊 ESTRUCTURA DE DATOS

### Gerente
- `_id` - ID único
- `nombre` - Nombre completo
- `cedula` - Documento de identidad (único)
- `celular` - Teléfono
- `direccion` - Dirección
- `usuario` - Usuario login (único)
- `password` - Contraseña
- `rol` - "gerente" (fijo)
- `activo` - Booleano
- `fecha_creacion` - Timestamp

### Barrio
- `_id` - ID único
- `nombre` - Nombre del barrio (único)
- `descripcion` - Descripción opcional
- `activo` - Booleano
- `fecha_creacion` - Timestamp

### Oficina (Actualizado)
- `_id` - ID único
- `nombre` - Nombre de la oficina
- `cedula` - Documento (único)
- `usuario` - Username (único)
- `password` - Contraseña
- `gerenteID` - Referencia al Gerente 👈 **NUEVO**
- `barrios` - Array de referencias a Barrios 👈 **NUEVO**
- `cobradores` - Array de referencias a Cobradores 👈 **NUEVO**
- `activo` - Booleano 👈 **NUEVO**
- `fecha_creacion` - Timestamp

---

## 🎯 FLUJO DE TRABAJO

1. **Administrador crea Gerente**
2. **Gerente crea Barrios** (Siloé, Terrón Colorado, etc.)
3. **Gerente crea Oficinas** y asigna barrios a cada una
4. **Gerente crea Cobradores** dentro de cada oficina
5. **Cobradores crean Clientes** dentro de sus barrios
6. **Cobradores registran Créditos** para los clientes
7. **Gerente ve Estadísticas** (dinero prestado, cobradores, clientes, etc.)

---

## ⚠️ NOTAS IMPORTANTES

- Todos los usuarios (gerente, oficina, cobrador) tienen credenciales únicas
- El gerente puede ver estadísticas en tiempo real
- Las oficinas están vinculadas a un gerente específico
- Los barrios son globales pero se asignan a oficinas
- Los cobradores se crean dentro de una oficina
