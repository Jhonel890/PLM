// backend/src/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const prisma = require('./database/db');
const socketHandler = require('./handlers/socketHandler');

const app = express();

// --- CONFIGURACIÓN DE CORS (CRÍTICO PARA VERCEL) ---
app.use(cors({
  origin: "*", // ¡Permite conexiones desde cualquier lugar!
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const server = http.createServer(app);

// --- CONFIGURACIÓN DE SOCKET.IO CORS ---
const io = new Server(server, {
  cors: {
    origin: "*", // ¡También aquí!
    methods: ["GET", "POST"]
  }
});

// --- RUTAS API ---

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.password !== password) return res.status(401).json({ message: 'Contraseña incorrecta' });
    return res.json({ status: 'OK', user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = await prisma.user.create({ data: { username, password } });
    return res.json({ status: 'OK', user: newUser });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: '¡Nombre ya en uso!' });
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'MIND RUSH Server Ready 🚀' });
});

// --- SOCKETS ---
socketHandler(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 MIND RUSH corriendo en puerto ${PORT}`);
});