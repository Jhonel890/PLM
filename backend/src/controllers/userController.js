// backend/src/controllers/userController.js
const prisma = require('../database/db');
const bcrypt = require('bcryptjs'); // Necesario para la seguridad

exports.register = async (req, res) => {
  try {
    // Recibimos nombre Y contraseña del Frontend
    const { username, password } = req.body;

    // 1. Validaciones básicas
    if (!username || !password) {
      return res.status(400).json({ message: 'Nombre y contraseña son obligatorios' });
    }

    // 2. Buscamos si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username: username }
    });

    if (existingUser) {
      // --- LOGIN (Usuario existe) ---
      // Comparamos la contraseña que escribió con la encriptada en DB
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      // Login correcto: Devolvemos el usuario (sin el password)
      const { password: _, ...userData } = existingUser;
      return res.status(200).json({ status: 'LOGIN_OK', user: userData });

    } else {
      // --- REGISTRO (Usuario nuevo) ---
      // Encriptamos la contraseña antes de guardarla
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Creamos el usuario en la Base de Datos
      const newUser = await prisma.user.create({
        data: {
          username: username,
          password: hashedPassword // <--- AQUÍ SOLUCIONAMOS EL ERROR
        }
      });
      
      const { password: _, ...userData } = newUser;
      return res.status(201).json({ status: 'REGISTER_OK', user: userData });
    }

  } catch (error) {
    console.error('Error en Auth:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};