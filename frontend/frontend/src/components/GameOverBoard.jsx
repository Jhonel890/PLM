// frontend/src/components/GameOverBoard.jsx
import React from 'react';

const GameOverBoard = ({ finalStats, isHost, onResetGame }) => {
  const { leaderboard, awards } = finalStats;
  const winner = leaderboard[0];

  return (
    <div className="min-h-screen w-full bg-paper flex flex-col items-center justify-center p-4 animate-fade-in relative overflow-hidden">
      
      {/* Confetti Decorativo (Emojis flotantes CSS) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
         <div className="absolute top-10 left-10 text-4xl animate-bounce">🎉</div>
         <div className="absolute top-20 right-20 text-6xl animate-pulse">✨</div>
         <div className="absolute bottom-10 left-1/4 text-5xl animate-spin">🎈</div>
      </div>

      <div className="bg-white border-4 border-ink p-8 shadow-pop max-w-2xl w-full text-center relative z-10">
        
        <h1 className="font-heading text-6xl text-neon-pink mb-2 drop-shadow-sm">¡JUEGO TERMINADO!</h1>
        <p className="font-hand text-2xl text-gray-500 mb-8">Y el ganador definitivo es...</p>

        {/* 🏆 GRAN GANADOR */}
        <div className="mb-10 transform scale-110">
          <div className="inline-block relative">
             <div className="absolute -top-12 -left-8 text-6xl rotate-[-15deg]">👑</div>
             <div className="bg-neon-yellow border-4 border-ink p-6 shadow-[8px_8px_0px_0px_#000]">
                <h2 className="font-heading text-5xl text-ink uppercase tracking-wider">{winner.name}</h2>
                <div className="mt-2 bg-white border-2 border-ink inline-block px-4 py-1 text-2xl font-bold">
                   {winner.totalScore} PUNTOS
                </div>
             </div>
          </div>
        </div>

        {/* 🎖️ TABLA DE PREMIOS ESPECIALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          
          {/* El Rayo (Más Stops) */}
          <div className="bg-gray-50 border-2 border-ink p-4 flex items-center gap-4">
             <div className="text-4xl">⚡</div>
             <div>
                <h3 className="font-heading text-lg text-neon-blue">EL RAYO</h3>
                <p className="text-xs text-gray-500 font-bold uppercase">Más veces presionó STOP</p>
                <p className="font-hand text-xl">
                  {leaderboard.find(p => p.userId === awards.flash)?.name || "Nadie"}
                </p>
             </div>
          </div>

          {/* El Cerebrito (Más palabras únicas) */}
          <div className="bg-gray-50 border-2 border-ink p-4 flex items-center gap-4">
             <div className="text-4xl">🧠</div>
             <div>
                <h3 className="font-heading text-lg text-neon-pink">EL CEREBRITO</h3>
                <p className="text-xs text-gray-500 font-bold uppercase">Más respuestas únicas</p>
                <p className="font-hand text-xl">
                  {leaderboard.find(p => p.userId === awards.brain)?.name || "Nadie"}
                </p>
             </div>
          </div>

        </div>

        {/* 📋 TABLA DE POSICIONES COMPLETA */}
        <div className="text-left mb-8">
           <h3 className="font-heading text-xl border-b-2 border-ink mb-2">TABLA FINAL</h3>
           <ul className="space-y-2">
             {leaderboard.map((p, index) => (
               <li key={p.userId} className="flex justify-between font-hand text-lg border-b border-gray-200 pb-1">
                 <span>#{index + 1} {p.name}</span>
                 <span className="font-bold">{p.totalScore} pts</span>
               </li>
             ))}
           </ul>
        </div>

        {/* BOTÓN REINICIAR */}
        {isHost ? (
          <button 
            onClick={onResetGame}
            className="w-full bg-ink text-white font-heading text-xl py-4 hover:bg-neon-green hover:text-ink hover:border-ink border-2 border-transparent transition-all shadow-pop"
          >
            VOLVER AL LOBBY 🔄
          </button>
        ) : (
          <p className="text-sm text-gray-400 animate-pulse">Esperando al anfitrión para volver a jugar...</p>
        )}

      </div>
    </div>
  );
};

export default GameOverBoard;