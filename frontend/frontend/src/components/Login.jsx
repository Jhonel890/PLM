// frontend/src/components/Login.jsx
import { useState } from 'react';
import Logo from './Logo'; // <--- IMPORTANTE: Asegúrate de importar el Logo

// Si estás usando DevTunnel o Ngrok, recuerda poner aquí TU URL, no localhost.
// Ejemplo: const API_URL = 'https://tu-tunel.devtunnels.ms';
const API_URL = 'http://localhost:3000'; 

const Login = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación
    if (!username.trim() || !password.trim()) {
      setError('¡Nombre y contraseña requeridos!');
      return;
    }
    if (password.length < 4) {
      setError('La contraseña es muy corta (mín. 4)');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }) 
      });

      const data = await response.json();

      if (response.ok) {
        onJoin(data.user); 
      } else {
        setError(data.message || 'Error al conectar');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor 😞');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-paper p-4">
        <div className="bg-white border-2 border-ink p-8 w-full max-w-md shadow-pop transform rotate-1 transition-transform hover:rotate-0 relative">
          
          {/* LOGO MIND RUSH (Centrado y Grande) */}
          <div className="flex justify-center mb-6 -mt-12">
             <div className="bg-white p-2 rounded-full border-4 border-ink shadow-sm rotate-[-3deg] hover:rotate-3 transition-transform duration-500">
                <Logo size="h-24" />
             </div>
          </div>

          <p className="text-center text-gray-500 mb-8 font-hand text-xl">
            Velocidad • Ingenio • Adrenalina
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input Usuario */}
            <div>
              <label className="block font-bold text-lg mb-1">Usuario</label>
              <input
                type="text"
                className="w-full bg-paper border-2 border-ink p-3 text-xl font-hand focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder-gray-400 focus:border-neon-blue"
                placeholder="Tu apodo..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Input Contraseña */}
            <div>
              <label className="block font-bold text-lg mb-1">Contraseña</label>
              <input
                type="password"
                className="w-full bg-paper border-2 border-ink p-3 text-xl font-hand focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder-gray-400 focus:border-neon-pink"
                placeholder="Una clave secreta..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="bg-neon-pink text-white p-2 border-2 border-ink text-center font-bold text-sm shadow-sm rotate-1 animate-pulse">
                ⚠️ {error}
              </div>
            )}

            {/* Botón de Acción */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-neon-blue text-ink font-heading text-xl py-4 border-2 border-ink shadow-pop active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 hover:bg-cyan-300"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  CARGANDO...
                </span>
              ) : 'ENTRAR / REGISTRAR'}
            </button>
          </form>
        </div>
    </div>
  );
};

export default Login;