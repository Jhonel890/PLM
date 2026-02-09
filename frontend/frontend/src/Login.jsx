// src/components/Login.jsx
import { useState } from 'react';

const Login = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación ISO 25010 (Protección contra errores)
    if (!username.trim() || username.length < 3) {
      setError('¡El nombre debe tener al menos 3 letras!');
      return;
    }

    setIsLoading(true);

    try {
      // Conectamos con nuestro Backend
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await response.json();

      if (response.ok) {
        onJoin(data.user); // ¡Éxito! Subimos el usuario al App.jsx
      } else {
        setError(data.message || 'Error al conectar');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor 😞');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-ink p-8 w-full max-w-md shadow-pop transform rotate-1 transition-transform hover:rotate-0">
      
      {/* Título Estilo Neon */}
      <h1 className="text-5xl font-heading text-neon-pink text-center mb-2" style={{ textShadow: '2px 2px 0px #000' }}>
        PLM
      </h1>
      <p className="text-center text-gray-500 mb-8 font-hand text-xl">
        Párame la Mano • Stop • Bachillerato
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block font-bold text-lg mb-1">¿Cómo te dicen?</label>
          <input
            type="text"
            className="w-full bg-paper border-2 border-ink p-3 text-2xl font-hand focus:outline-none focus:shadow-pop transition-all placeholder-gray-400"
            placeholder="Tu apodo aquí..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            maxLength={12}
          />
        </div>

        {/* Mensaje de Error (Feedback inmediato) */}
        {error && (
          <div className="bg-neon-pink text-white p-2 border-2 border-ink text-center font-bold text-sm shadow-sm rotate-1">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="bg-neon-blue text-ink font-heading text-xl py-4 border-2 border-ink shadow-pop active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? 'Entrando...' : '¡A JUGAR!'}
        </button>
      </form>
    </div>
  );
};

export default Login;