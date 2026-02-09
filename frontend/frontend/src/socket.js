import { io } from 'socket.io-client';

// URL DE TU BACKEND EN RENDER (La que sale en tu captura verde)
const URL = 'https://mind-rush-backend.onrender.com';

export const socket = io(URL, {
  autoConnect: false
});