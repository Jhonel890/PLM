// frontend/src/components/ResultsBoard.jsx
import React, { useState } from 'react';

const ResultsBoard = ({ results, onNextRound, isHost, onVoteInvalid, currentVotes = {}, userId, isStarting, categories = [] }) => {
  const sortedResults = [...results].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sortedResults.length > 0 ? sortedResults[0] : null;

  const [localVotingState, setLocalVotingState] = useState({}); 

  const handleLocalVote = (answerId) => {
    setLocalVotingState(prev => ({ ...prev, [answerId]: true }));
    onVoteInvalid(answerId);
  };

  return (
    <div className="w-full max-w-6xl pb-32 animate-fade-in px-4">
      
      <div className="text-center mb-10 mt-6">
        <h2 className="font-heading text-4xl text-neon-blue mb-4 drop-shadow-sm">RESULTADOS</h2>
        <div className="bg-white border-2 border-ink p-3 inline-block rounded-lg shadow-sm">
           <p className="font-hand text-sm text-gray-600">
             👮‍♂️ <strong>Reglas:</strong> Reporta con 👎 si es falso.<br/>
             <span className="text-xs text-gray-400">(Mayoría necesaria para anular)</span>
           </p>
        </div>
        {winner && (
          <div className="mt-6 transform rotate-1 transition-all hover:scale-105 duration-300">
            <div className="bg-neon-yellow border-4 border-ink p-4 shadow-pop inline-block">
              <span className="font-hand text-lg text-gray-700 block">👑 Líder:</span>
              <span className="font-heading text-5xl text-neon-pink block leading-none">{winner.name}</span>
              <div className="mt-2 inline-block bg-white border-2 border-ink px-4 py-1 font-bold text-2xl shadow-sm">{winner.totalScore} pts</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedResults.map((player) => {
          const isMyCard = player.userId === userId;
          
          return (
            <div key={player.userId || player.name} className={`relative border-2 border-ink rounded-sm flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] ${isMyCard ? 'bg-yellow-50 border-neon-blue' : 'bg-white'}`}>
                
                <div className={`p-3 border-b-2 border-ink flex justify-between items-center ${isMyCard ? 'bg-neon-blue/10' : 'bg-gray-50'}`}>
                  <h3 className="font-heading text-xl truncate w-2/3 text-ink">
                    {player.name} {isMyCard && <span className="text-xs text-neon-blue font-bold">(Tú)</span>}
                  </h3>
                  <div className="font-bold text-lg bg-white text-ink px-2 border border-ink rounded shadow-sm">{player.totalScore}</div>
                </div>

                <div className="p-4 bg-paper flex-1">
                  <ul className="space-y-4">
                    {/* MAPEO DINÁMICO DE CATEGORÍAS */}
                    {categories.map(catName => {
                      const ans = player.answers[catName];
                      const word = ans?.word || "";
                      const score = ans?.score || 0;
                      const isValid = ans?.isValid ?? true;
                      const answerId = ans?.id;
                      
                      const voteInfo = currentVotes[answerId] || { votes: 0, needed: 2, voters: [] };
                      const votes = voteInfo.votes;
                      const needed = voteInfo.needed;
                      const votersList = voteInfo.voters || [];

                      const iHaveVoted = votersList.includes(userId) || localVotingState[answerId];
                      const someOneElseVoted = votes > 0;

                      if (!word) return null;

                      return (
                        <li key={catName} className={`flex flex-col border-b border-dashed border-gray-300 pb-2 last:border-0 transition-all ${!isValid ? 'opacity-50 grayscale' : ''}`}>
                          
                          <div className="flex justify-between items-end mb-1">
                            <div className="flex flex-col overflow-hidden w-full mr-2">
                              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">{catName}</span>
                              <span className={`font-hand text-xl leading-none ${!isValid ? 'line-through decoration-red-500 decoration-2' : 'text-ink'}`}>{word}</span>
                            </div>
                            <div className={`font-heading text-sm px-2 py-1 rounded border-2 ${!isValid ? 'bg-gray-100 border-gray-300 text-gray-400' : score === 100 ? 'bg-neon-green text-white border-ink' : 'bg-yellow-200 text-yellow-800 border-ink'}`}>{isValid ? score : 0}</div>
                          </div>

                          {isValid && !isMyCard && (
                            <div className="flex justify-end mt-1">
                               <button
                                 onClick={() => handleLocalVote(answerId)}
                                 disabled={iHaveVoted}
                                 className={`
                                   flex items-center gap-1 border px-2 py-1 rounded text-[10px] font-bold uppercase transition-all shadow-sm active:translate-y-[1px]
                                   ${iHaveVoted 
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default' 
                                      : someOneElseVoted
                                        ? 'bg-red-500 text-white border-red-700 animate-pulse hover:bg-red-600'
                                        : 'bg-white hover:bg-red-50 border-gray-300 hover:border-red-400 text-gray-400 hover:text-red-500'
                                   }
                                 `}
                               >
                                 {iHaveVoted ? (
                                   <span>⏳ Tu voto ({votes}/{needed})</span>
                                 ) : someOneElseVoted ? (
                                   <span className="font-bold">⚠️ APOYAR ({votes}/{needed})</span>
                                 ) : (
                                   <span>👎 Reportar</span>
                                 )}
                               </button>
                            </div>
                          )}

                          {isValid && isMyCard && someOneElseVoted && (
                             <div className="text-[10px] text-orange-500 font-bold text-right mt-1 animate-pulse bg-orange-50 px-2 py-1 rounded border border-orange-200 inline-block float-right">
                               ⚠️ Riesgo ({votes}/{needed})
                             </div>
                          )}

                          {!isValid && <div className="text-[10px] text-red-500 font-bold text-right mt-1">⛔ ANULADA</div>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t-2 border-ink flex justify-center z-50">
        {isHost ? (
          <button 
            onClick={onNextRound} 
            disabled={isStarting}
            className="w-full max-w-md bg-neon-green text-ink font-heading text-xl py-3 px-8 border-4 border-ink shadow-pop hover:-translate-y-1 transition-all rounded-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isStarting ? (
               <>
                 <svg className="animate-spin h-5 w-5 text-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 INICIANDO...
               </>
            ) : "SIGUIENTE RONDA ➡️"}
          </button>
        ) : (
          <p className="font-hand text-gray-500 animate-pulse">Esperando al anfitrión...</p>
        )}
      </div>
    </div>
  );
};

export default ResultsBoard;