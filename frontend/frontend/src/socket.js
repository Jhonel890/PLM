import { io } from 'socket.io-client';

// -------------------------------------------------------------------------
// URL DE PRODUCCIÓN (La nube de Render)
// Esta dirección funciona desde cualquier lugar del mundo 🌍
// -------------------------------------------------------------------------
const URL = 'https://mind-rush-backend.onrender.com'; 

export const socket = io(URL, {
  autoConnect: false, // Esperamos a que el usuario se loguee
});