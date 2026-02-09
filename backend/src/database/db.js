// src/database/db.js
const { PrismaClient } = require('@prisma/client');

// Instancia única de Prisma para toda la app
const prisma = new PrismaClient();

// Exportamos para usarlo en controladores y sockets
module.exports = prisma;