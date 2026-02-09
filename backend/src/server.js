// backend/src/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const prisma = require('./database/db'); // Conexión a BD

// --- IMPORTACIONES DE RUTAS Y LÓGICA ---
const userRoutes = require('./routes/userRoutes'); // Rutas REST (Usuarios)
const socketHandler = require('./handlers/socketHandler'); // <--- NUEVO: Lógica de Tiempo Real

// 1. Configuración de Express (App Web)
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN })); // Seguridad
app.use(express.json());

// 2. Creación del Servidor HTTP
const server = http.createServer(app);

// 3. Configuración de Socket.io (Tiempo Real)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// --- RUTAS HTTP (API REST) ---
// Es importante definir las rutas ANTES de iniciar el servidor
app.use('/api/users', userRoutes);

// Ruta de Salud (Health Check)
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ 
      status: 'OK', 
      database: 'Connected', 
      users_registered: userCount,
      message: 'Sistema PLM Operativo 🚀' 
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

// --- INICIALIZACIÓN DE SOCKETS ---
// Aquí conectamos el "cerebro" de sockets que creamos en handlers/socketHandler.js
socketHandler(io); 

// 4. Iniciar Servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Servidor PLM corriendo en: http://localhost:${PORT}`);
  console.log(`📡 Socket.io listo para conexiones`);
  console.log(`🗄️  Base de datos: TiDB Cloud (MySQL)`);
  console.log(`==================================================\n`);
});