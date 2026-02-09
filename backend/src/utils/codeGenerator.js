// backend/src/utils/codeGenerator.js

// Genera un código de 4 letras mayúsculas (ej: ABCD)
// ISO 25010 (Usabilidad): Códigos cortos y fáciles de compartir
const generateRoomCode = (length = 4) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = { generateRoomCode };