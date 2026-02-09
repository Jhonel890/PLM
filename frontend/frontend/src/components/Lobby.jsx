// frontend/src/components/Lobby.jsx
import React from 'react';

const Lobby = ({ user, onCreateRoom, onJoinRoom, isCreating }) => {
  return (
    <div className="w-full max-w-sm animate-fade-in pb-10">
      
      {/* TARJETA DE BIENVENIDA */}
      <div className="bg-white border-2 border-ink p-8 shadow-pop mb-8 relative">
        <h1 className="font-heading text-4xl text-ink mb-2">
          HOLA, <span className="text-neon-blue">{user.username.toUpperCase()}</span>
        </h1>
        <p className="font-hand text-xl text-gray-500">¿Qué haremos hoy?</p>
      </div>

      {/* BOTÓN CREAR SALA */}
      <div className="bg-white border-2 border-ink p-6 shadow-pop mb-6 relative group hover:-translate-y-1 transition-transform">
        <div className="absolute top-0 right-0 bg-neon-yellow px-2 py-1 border-l-2 border-b-2 border-ink font-bold text-xs">HOST</div>
        <h2 className="font-heading text-2xl text-neon-pink mb-2">CREAR SALA</h2>
        <p className="font-hand text-gray-600 mb-4 text-sm">Tú pones las reglas. Genera un código e invita a tus amigos.</p>
        
        <button 
          onClick={onCreateRoom}
          disabled={isCreating} // Bloquea el botón si está cargando
          className="w-full bg-ink text-white font-heading text-xl py-3 border-2 border-transparent hover:bg-neon-blue hover:border-ink hover:text-ink transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isCreating ? (
            <>
              {/* Spinner SVG simple */}
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              CREANDO...
            </>
          ) : (
            "CREAR AHORA"
          )}
        </button>
      </div>

      {/* BOTÓN UNIRSE A SALA */}
      <div className="bg-white border-2 border-ink p-6 shadow-pop relative group hover:-translate-y-1 transition-transform">
        <h2 className="font-heading text-2xl text-neon-blue mb-2">UNIRSE A SALA</h2>
        <p className="font-hand text-gray-600 mb-4 text-sm">¿Ya tienes un código? Ingrésalo aquí para entrar a la partida.</p>
        <button 
          onClick={onJoinRoom}
          className="w-full bg-transparent border-2 border-ink text-ink font-heading text-xl py-3 hover:bg-neon-yellow transition-all"
        >
          INGRESAR CÓDIGO
        </button>
      </div>

    </div>
  );
};

export default Lobby;