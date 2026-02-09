// frontend/src/components/JoinModal.jsx
import React, { useState } from 'react';

const JoinModal = ({ isOpen, onClose, onJoin }) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length === 4) {
      onJoin(code);
      setCode(''); // Limpiar input
    }
  };

  const handleChange = (e) => {
    // Solo permitimos letras y máximo 4 caracteres
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    setCode(value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-2 border-ink p-8 w-full max-w-sm shadow-pop relative transform rotate-1">
        
        {/* Botón Cerrar (X) */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-neon-pink font-bold text-xl px-2"
        >
          ✕
        </button>

        <h2 className="text-3xl font-heading text-center mb-6 text-neon-blue" style={{ textShadow: '1px 1px 0 #000' }}>
          INGRESAR CÓDIGO
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            autoFocus
            type="text"
            value={code}
            onChange={handleChange}
            placeholder="ABCD"
            className="w-full text-center text-5xl font-heading tracking-[0.5em] p-4 bg-paper border-2 border-ink focus:outline-none focus:shadow-pop transition-all uppercase placeholder-gray-300"
          />

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 font-bold font-hand text-xl border-2 border-transparent hover:border-ink hover:bg-gray-100 transition-all"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={code.length !== 4}
              className="flex-1 py-3 bg-neon-green border-2 border-ink font-heading text-xl shadow-pop active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ENTRAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinModal;