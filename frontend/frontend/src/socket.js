// frontend/src/socket.js
import io from 'socket.io-client';

// Definimos la URL del backend
const URL = 'http://localhost:3000';

// Creamos la instancia pero NO conectamos automáticamente (autoConnect: false)
// Conectaremos manualmente solo cuando el usuario haga Login.
export const socket = io(URL, {
  autoConnect: false
});