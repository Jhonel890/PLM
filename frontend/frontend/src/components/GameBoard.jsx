// frontend/src/components/GameBoard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';

// Helper para iconos
const getCategoryIcon = (cat) => {
  const c = cat.toUpperCase();
  if (c.includes("NOMBRE")) return "👤";
  if (c.includes("APELLIDO")) return "🏷️";
  if (c.includes("CIUDAD") || c.includes("PAÍS")) return "🌍";
  if (c.includes("ANIMAL")) return "🦁";
  if (c.includes("FRUTA") || c.includes("COMIDA")) return "🍎";
  if (c.includes("COSA") || c.includes("OBJETO")) return "📦";
  if (c.includes("COLOR")) return "🎨";
  if (c.includes("MARCA")) return "™️";
  if (c.includes("PROFESIÓN")) return "👮";
  if (c.includes("DEPORTE")) return "⚽";
  if (c.includes("VERBO")) return "🏃";
  if (c.includes("CANTANTE")) return "🎤";
  if (c.includes("PELÍCULA") || c.includes("SERIE")) return "🎬";
  return "✏️";
};

const GameBoard = ({ letter, roundNumber, onTriggerStop, onSubmitAnswers, categories = [] }) => {
  const [countdown, setCountdown] = useState(3);
  const [showGame, setShowGame] = useState(false);
  
  const [stopCountdown, setStopCountdown] = useState(null); 
  const [stopperName, setStopperName] = useState(null);
  const [isMyStop, setIsMyStop] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Inicializar estado dinámico
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    categories.forEach(cat => initial[cat] = ''); 
    return initial;
  });

  const inputsRef = useRef({});
  
  // Calcular progreso
  const filledCount = Object.values(answers).filter(val => val.trim().length > 0).length;
  const totalFields = categories.length;
  const progressPercent = (filledCount / totalFields) * 100;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else { setShowGame(true); }
  }, [countdown]);

  useEffect(() => {
    const handleWarning = (data) => {
      setStopCountdown(data.seconds);
      setStopperName(data.stopperName);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    };
    socket.on('stop_warning', handleWarning);
    return () => socket.off('stop_warning', handleWarning);
  }, []);

  useEffect(() => {
    if (stopCountdown !== null && stopCountdown > 0) {
      const timer = setTimeout(() => setStopCountdown(stopCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [stopCountdown]);

  useEffect(() => {
    const handleRoundEnded = () => {
      if (!hasSubmitted) {
        setHasSubmitted(true);
        setTimeout(() => onSubmitAnswers(answers), 100);
      }
    };
    socket.on('round_ended', handleRoundEnded);
    return () => socket.off('round_ended', handleRoundEnded);
  }, [answers, hasSubmitted, onSubmitAnswers]);

  const handleChange = (e) => {
    if (isMyStop || stopCountdown === 0) return;
    const { name, value } = e.target;
    setAnswers(prev => ({ ...prev, [name]: value.toUpperCase().trimStart() })); 
  };

  const handlePressStop = () => {
    if (stopCountdown !== null) return; 
    setIsMyStop(true); 
    onTriggerStop(); 
  };

  if (!showGame) {
    return (
      <div className="fixed inset-0 bg-paper flex flex-col items-center justify-center z-[100]">
        <h2 className="font-heading text-4xl text-ink mb-8 animate-pulse">RONDA {roundNumber}</h2>
        <div className="w-56 h-56 rounded-full border-[8px] border-ink bg-neon-yellow flex items-center justify-center animate-bounce shadow-pop">
           <span className="font-heading text-[10rem] text-neon-pink drop-shadow-md leading-none pt-6">{countdown}</span>
        </div>
        <p className="mt-8 font-hand text-2xl text-gray-500">Prepara tus dedos...</p>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen bg-paper flex flex-col transition-colors duration-500 ${stopCountdown !== null ? 'bg-red-50' : ''}`}>
      
      {/* 🛑 ALERTA FLOTANTE (STOP) */}
      {stopCountdown !== null && (
         <div className="fixed top-24 right-4 z-50 animate-bounce cursor-default pointer-events-none">
            <div className={`text-white border-4 border-ink w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-pop rotate-12 ${stopCountdown === 0 ? 'bg-gray-800' : 'bg-neon-pink'}`}>
                <span className="font-heading text-4xl md:text-6xl">{stopCountdown}</span>
            </div>
            <div className="bg-white border-2 border-ink px-2 text-[10px] md:text-xs font-bold mt-1 text-center -rotate-6 shadow-sm">
               {stopCountdown === 0 ? "TIEMPO!" : `¡${stopperName} PARÓ!`}
            </div>
         </div>
      )}

      {/* 📊 BARRA DE PROGRESO Y HEADER (RESPONSIVE) */}
      <div className="sticky top-0 z-30 bg-paper/95 backdrop-blur-md border-b-2 border-ink shadow-sm transition-all">
        {/* Barra animada */}
        <div className="h-3 w-full bg-gray-200 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-out ${progressPercent === 100 ? 'bg-neon-green' : 'bg-neon-blue'}`} 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
        
        {/* HEADER CONTENIDO */}
        <div className="flex justify-between items-center px-3 py-2 md:px-4 md:py-3 max-w-6xl mx-auto w-full">
          
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            {/* Letra Gigante (Más pequeña en móvil) */}
            <div className="bg-neon-pink text-white font-heading text-2xl md:text-4xl w-10 h-10 md:w-14 md:h-14 flex items-center justify-center border-2 border-ink rounded-lg shadow-[2px_2px_0px_0px_#000] flex-shrink-0">
              {letter}
            </div>
            
            <div className="flex flex-col min-w-0">
               {/* Texto Ronda (Texto pequeño) */}
               <span className="text-[9px] md:text-[10px] font-black tracking-widest text-gray-400 uppercase truncate">
                 Ronda {roundNumber}
               </span>
               {/* Texto Principal (Ajustable) */}
               <span className="font-hand text-base md:text-xl text-ink font-bold leading-tight truncate">
                 {stopCountdown === 0 ? "¡Manos arriba!" : stopCountdown !== null ? "¡CORRE! 🔥" : "Empieza con..."}
               </span>
            </div>
          </div>
          
          {/* Contador de Campos */}
          <div className={`border-2 border-ink px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-bold shadow-sm transition-colors flex-shrink-0 ml-2 ${filledCount === totalFields ? 'bg-neon-green text-ink' : 'bg-white text-gray-500'}`}>
            {filledCount}/{totalFields} LISTOS
          </div>
        </div>
      </div>

      {/* 📝 ÁREA DE INPUTS (GRILLA RESPONSIVE) */}
      <div className="flex-1 overflow-y-auto p-4 pb-48 pt-6">
        
        {stopCountdown === 0 && (
          <div className="absolute inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-[2px] animate-fade-in">
             <div className="bg-white border-4 border-ink p-6 shadow-pop -rotate-2 text-center transform scale-110">
               <div className="text-5xl mb-2">🛑</div>
               <h3 className="font-heading text-3xl text-ink">TIEMPO</h3>
               <p className="text-sm text-gray-500 font-bold uppercase">Enviando respuestas...</p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {categories.map((catName) => {
            const hasValue = answers[catName]?.length > 0;
            
            return (
              <div key={catName} className={`relative group transition-all duration-300 ${isMyStop ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
                
                {/* Sombra Decorativa */}
                <div className={`absolute inset-0 translate-x-1 translate-y-1 md:translate-x-2 md:translate-y-2 rounded-xl border-2 border-transparent transition-colors ${hasValue ? 'bg-neon-green/20' : 'bg-gray-200 group-hover:bg-neon-blue/20'}`}></div>

                {/* Tarjeta Principal */}
                <div className={`
                    relative bg-white border-2 rounded-xl p-3 md:p-4 flex flex-col gap-1 transition-all
                    ${hasValue ? 'border-neon-green shadow-sm' : 'border-ink'}
                    focus-within:border-neon-blue focus-within:ring-4 focus-within:ring-neon-blue/10 focus-within:-translate-y-1 focus-within:shadow-[3px_3px_0px_0px_rgba(59,130,246,0.5)]
                `}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="flex items-center gap-2 font-heading text-[10px] md:text-xs text-gray-500 uppercase tracking-widest cursor-text">
                      <span className="text-base md:text-lg filter grayscale group-hover:grayscale-0 transition-all">{getCategoryIcon(catName)}</span> 
                      {catName}
                    </label>
                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-white text-[10px] transition-all ${hasValue ? 'bg-neon-green scale-100' : 'bg-gray-100 scale-0'}`}>
                      ✓
                    </div>
                  </div>

                  <input
                    type="text"
                    name={catName}
                    value={answers[catName]}
                    onChange={handleChange}
                    disabled={isMyStop || stopCountdown === 0}
                    placeholder={`${letter}...`} 
                    autoComplete="off"
                    className="w-full bg-transparent text-xl md:text-2xl font-hand text-ink placeholder-gray-200 outline-none border-b-2 border-transparent focus:border-neon-blue/20 transition-colors pt-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✋ BOTÓN STOP (Responsive) */}
      {stopCountdown === null && (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-paper via-paper/90 to-transparent z-40 flex justify-center pointer-events-none">
          <button 
            onClick={handlePressStop}
            className={`
                pointer-events-auto w-full max-w-md bg-neon-pink text-white font-heading text-2xl md:text-3xl py-3 md:py-4 border-4 border-ink 
                shadow-[4px_4px_0px_0px_#000] md:shadow-[6px_6px_0px_0px_#000] active:translate-y-[4px] active:shadow-none active:translate-x-[4px]
                rounded-2xl hover:bg-red-500 transition-all flex items-center justify-center gap-2 md:gap-3 group
                ${filledCount < 1 ? 'opacity-50 cursor-not-allowed grayscale' : ''} 
            `}
            disabled={filledCount < 1} 
          >
            <span className="group-hover:animate-wiggle">✋</span> 
            <span>¡STOP!</span>
          </button>
        </div>
      )}
      
      {/* MENSAJE DE PÁNICO INFERIOR */}
      {stopCountdown !== null && stopCountdown > 0 && (
        <div className="fixed bottom-0 left-0 right-0 py-2 md:py-3 bg-neon-yellow border-t-4 border-ink text-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
          <p className="font-heading text-lg md:text-xl text-ink animate-pulse flex items-center justify-center gap-2">
            {isMyStop ? (
                <>⏳ PAUSA... <span className="text-xs md:text-sm font-hand">(Respira)</span></>
            ) : (
                <>🔥 ¡RÁPIDO! 🔥</>
            )}
          </p>
        </div>
      )}

    </div>
  );
};

export default GameBoard;