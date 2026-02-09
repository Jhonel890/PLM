import { useState } from 'react';
import Logo from './Logo'; // Asegúrate de tener el logo importado

// -------------------------------------------------------------------------
// URL DE PRODUCCIÓN (La nube de Render)
// Debe ser IGUAL que en socket.js
// -------------------------------------------------------------------------
const API_URL = 'https://mind-rush-backend.onrender.com'; 

const Login = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  // --- 1. INTENTAR LOGIN ---
  const handleLoginAttempt = async (e) => {
    e.preventDefault();
    setError('');
    setShowRegisterConfirm(false);

    if (!username.trim() || !password.trim()) {
      setError('¡Nombre y contraseña requeridos!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }) 
      });

      const data = await response.json();

      if (response.ok) {
        onJoin(data.user); 
      } else if (response.status === 404) {
        setShowRegisterConfirm(true); // Usuario no existe -> Preguntar registro
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

  // --- 2. CONFIRMAR REGISTRO ---
  const handleRegisterConfirm = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }) 
      });

      const data = await response.json();

      if (response.ok) {
        onJoin(data.user);
      } else {
        setError(data.message || 'No se pudo registrar');
        setShowRegisterConfirm(false); 
      }
    } catch (err) {
      setError('Error al intentar registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-paper p-4">
        
        <div className="bg-white border-2 border-ink p-8 w-full max-w-md shadow-pop transform rotate-1 transition-transform hover:rotate-0 relative">
          
          {/* LOGO */}
          <div className="flex justify-center mb-6 -mt-12">
             <div className="bg-white p-2 rounded-full border-4 border-ink shadow-sm rotate-[-3deg] hover:rotate-3 transition-transform duration-500">
                <Logo size="h-24" />
             </div>
          </div>

          <p className="text-center text-gray-500 mb-8 font-hand text-xl">
            Velocidad • Ingenio • Adrenalina
          </p>

          {/* FORMULARIO */}
          <form onSubmit={handleLoginAttempt} className="flex flex-col gap-4">
            <div>
              <label className="block font-bold text-lg mb-1">Usuario</label>
              <input
                type="text"
                className="w-full bg-paper border-2 border-ink p-3 text-xl font-hand focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder-gray-400 focus:border-neon-blue"
                placeholder="Tu apodo..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || showRegisterConfirm}
              />
            </div>

            <div>
              <label className="block font-bold text-lg mb-1">Contraseña</label>
              <input
                type="password"
                className="w-full bg-paper border-2 border-ink p-3 text-xl font-hand focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder-gray-400 focus:border-neon-pink"
                placeholder="Una clave secreta..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || showRegisterConfirm}
              />
            </div>

            {error && (
              <div className="bg-neon-pink text-white p-2 border-2 border-ink text-center font-bold text-sm shadow-sm rotate-1 animate-pulse">
                ⚠️ {error}
              </div>
            )}

            {!showRegisterConfirm && (
                <button
                type="submit"
                disabled={isLoading}
                className="bg-neon-blue text-ink font-heading text-xl py-4 border-2 border-ink shadow-pop active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 hover:bg-cyan-300"
                >
                {isLoading ? 'VERIFICANDO...' : 'ENTRAR AL JUEGO'}
                </button>
            )}
          </form>

          {/* MODAL DE ADVERTENCIA / REGISTRO */}
          {showRegisterConfirm && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-50 rounded-sm">
                <div className="bg-white border-4 border-ink p-4 shadow-pop mb-4 rotate-2">
                    <span className="text-4xl">🤔</span>
                </div>
                <h3 className="font-heading text-2xl text-ink mb-2">NO ESTÁS REGISTRADO</h3>
                <p className="font-hand text-lg text-gray-600 mb-6">
                    El usuario <strong>"{username}"</strong> no existe. <br/>
                    ¿Quieres crear una cuenta nueva?
                </p>
                
                <div className="flex flex-col gap-3 w-full">
                    <button 
                        onClick={handleRegisterConfirm}
                        className="w-full py-3 font-heading text-xl text-white bg-neon-green border-2 border-ink shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all"
                    >
                        SÍ, REGISTRARME
                    </button>
                    <button 
                        onClick={() => setShowRegisterConfirm(false)}
                        className="w-full py-3 font-bold border-2 border-transparent text-gray-400 hover:text-ink hover:border-gray-200 transition-colors"
                    >
                        CANCELAR
                    </button>
                </div>
            </div>
          )}

        </div>
    </div>
  );
};

export default Login;