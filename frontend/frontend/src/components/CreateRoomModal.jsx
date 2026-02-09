// frontend/src/components/CreateRoomModal.jsx
import React, { useState } from 'react';

// Lista de Categorías Disponibles
const CATEGORIES_POOL = [
  "NOMBRE", "APELLIDO", "CIUDAD", "ANIMAL", "FRUTA", "COSA", 
  "COLOR", "MARCA", "COMIDA", "PROFESIÓN", "PAÍS", "OBJETO", 
  "FLOR", "DEPORTE", "CANTANTE", "PELÍCULA", "SERIE", "VERBO", "EQUIPO DE FUTBOL",
  "ACTOR/ACTRIZ", "PERSONAJE","MARCA TECNOLÓGICA", "INSTRUMENTO MUSICAL", "APARATO ELECTRÓNICO", "LUGAR TURÍSTICO", "EMOCIÓN", "HERRAMIENTA", "MEDIO DE TRANSPORTE"
];

const CreateRoomModal = ({ isOpen, onClose, onCreate }) => {
  const [mode, setMode] = useState('TRADITIONAL'); // 'TRADITIONAL' | 'CUSTOM'
  const [rounds, setRounds] = useState(5);
  const [selectedCats, setSelectedCats] = useState(["NOMBRE", "APELLIDO", "CIUDAD", "ANIMAL", "FRUTA", "COSA"]);
  const [isLoading, setIsLoading] = useState(false); // <--- NUEVO ESTADO

  if (!isOpen) return null;

  const toggleCategory = (cat) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleCreate = () => {
    // Validación Mínima
    if (mode === 'CUSTOM' && selectedCats.length < 3) {
      alert("⚠️ Elige al menos 3 categorías.");
      return;
    }

    setIsLoading(true); // <--- ACTIVAR LOADING

    const config = {
      mode,
      rounds,
      categories: mode === 'TRADITIONAL' 
        ? ["NOMBRE", "APELLIDO", "CIUDAD", "ANIMAL", "FRUTA", "COSA"]
        : selectedCats
    };
    
    // Enviamos configuración al padre
    // Importante: Si hay error, deberíamos poder resetear isLoading, 
    // pero como el éxito cierra el modal, esto está bien por ahora.
    onCreate(config); 
    
    // Opcional: Si la creación falla rápido en el padre, podrías querer resetear isLoading
    // setTimeout(() => setIsLoading(false), 5000); // Timeout de seguridad
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white border-4 border-ink p-6 w-full max-w-lg shadow-pop relative max-h-[90vh] overflow-y-auto rounded-sm">
        
        <button onClick={onClose} disabled={isLoading} className="absolute top-2 right-4 text-3xl font-bold hover:text-neon-pink transition-colors disabled:opacity-50">×</button>

        <h2 className="text-3xl font-heading text-center mb-6 text-ink border-b-2 border-ink pb-2">CONFIGURAR SALA</h2>

        {/* SELECCIÓN DE RONDAS */}
        <div className="mb-8">
          <label className="block font-heading text-lg mb-2 text-gray-700">NÚMERO DE RONDAS</label>
          <div className="flex gap-2">
            {[3, 5, 8, 10].map(num => (
              <button
                key={num}
                onClick={() => setRounds(num)}
                disabled={isLoading}
                className={`flex-1 py-3 font-bold border-2 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed ${rounds === num ? 'bg-neon-yellow border-ink shadow-[2px_2px_0px_0px_#000] -translate-y-1' : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* MODO DE JUEGO */}
        <div className="mb-8">
          <label className="block font-heading text-lg mb-2 text-gray-700">MODO DE JUEGO</label>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setMode('TRADITIONAL')}
              disabled={isLoading}
              className={`flex-1 py-4 font-heading border-2 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'TRADITIONAL' ? 'bg-neon-blue text-white border-ink shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
            >
              TRADICIONAL
            </button>
            <button
              onClick={() => setMode('CUSTOM')}
              disabled={isLoading}
              className={`flex-1 py-4 font-heading border-2 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'CUSTOM' ? 'bg-neon-pink text-white border-ink shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
            >
              PERSONALIZADO
            </button>
          </div>

          {/* SELECTOR DE CATEGORÍAS (CUSTOM) */}
          {mode === 'CUSTOM' && (
            <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 rounded-sm">
              <p className="text-xs font-bold text-gray-500 mb-3 uppercase flex justify-between">
                <span>Selecciona las categorías</span>
                <span className={selectedCats.length < 3 ? "text-red-500" : "text-green-600"}>{selectedCats.length} seleccionadas</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_POOL.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    disabled={isLoading}
                    className={`text-xs font-bold px-3 py-2 border rounded-full transition-all disabled:opacity-50 ${selectedCats.includes(cat) ? 'bg-neon-green text-ink border-ink shadow-sm' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {mode === 'TRADITIONAL' && (
            <div className="text-sm text-gray-500 italic text-center p-4 bg-gray-50 border border-gray-200 rounded-sm">
              Se jugará con: Nombre, Apellido, Ciudad, Animal, Fruta, Cosa.
            </div>
          )}
        </div>

        {/* BOTÓN CREAR CON LOADING */}
        <button
          onClick={handleCreate}
          disabled={isLoading}
          className="w-full bg-ink text-white font-heading text-xl py-4 hover:bg-neon-blue transition-all border-2 border-transparent hover:border-ink shadow-pop rounded-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
             <>
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               CREANDO...
             </>
          ) : (
             "¡LISTO! CREAR SALA"
          )}
        </button>

      </div>
    </div>
  );
};

export default CreateRoomModal;