// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { socket } from './socket';

// Importación de Componentes
import Login from './components/Login';
import Lobby from './components/Lobby';
import JoinModal from './components/JoinModal';
import CreateRoomModal from './components/CreateRoomModal';
import GameBoard from './components/GameBoard';
import ResultsBoard from './components/ResultsBoard';
import GameOverBoard from './components/GameOverBoard';
import Logo from './components/Logo';

function App() {
  // --- ESTADOS PRINCIPALES ---
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  
  // --- ESTADOS DE JUEGO ---
  const [view, setView] = useState('LOBBY'); // LOBBY, WAITING_ROOM, GAME, WAITING_RESULTS, RESULTS, GAME_OVER
  const [roundData, setRoundData] = useState({ letter: '', roundNumber: 1, roundId: null });
  const [stopperName, setStopperName] = useState('');
  const [results, setResults] = useState([]); 
  const [currentVotes, setCurrentVotes] = useState({}); 
  const [finalStats, setFinalStats] = useState(null);
  const [activeCategories, setActiveCategories] = useState([]); 

  // --- ESTADOS DE UI (MODALES) ---
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
  const [isCreating, setIsCreating] = useState(false); 
  const [isStarting, setIsStarting] = useState(false); 

  // --- 1. PERSISTENCIA DE SESIÓN Y RECONEXIÓN AUTOMÁTICA ---
  useEffect(() => {
    const savedUser = localStorage.getItem('plm_user');
    const savedRoom = localStorage.getItem('plm_room');
    
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
  }, []);

  // --- 2. GESTIÓN DE SOCKETS ---
  useEffect(() => {
    if (user) {
      // Conectar al socket con el usuario actual
      socket.auth = { username: user.username };
      socket.connect();

      // INTENTAR RECONEXIÓN AUTOMÁTICA
      const savedRoom = localStorage.getItem('plm_room');
      if (savedRoom) {
        socket.emit('rejoin_game', { roomCode: savedRoom, userId: user.id }, (res) => {
          if (res.status === 'OK') {
            setRoom(res.room);
            setIsHost(res.player.isHost);
            if(res.room.categories) setActiveCategories(res.room.categories.split(','));
            
            if (res.currentRound) {
              setRoundData({ letter: res.currentRound.letter, roundNumber: res.currentRound.roundNumber, roundId: res.currentRound.id });
              setView('GAME');
            } else if (res.room.status === 'WAITING') {
              setView('WAITING_ROOM');
            } else {
              setView('WAITING_RESULTS');
            }
          } else {
            localStorage.removeItem('plm_room');
          }
        });
      }

      // Escuchar eventos
      socket.on('update_players', (list) => setPlayers(list));

      socket.on('game_started', (data) => {
        setRoundData({ letter: data.letter, roundNumber: data.roundNumber, roundId: data.roundId });
        setActiveCategories(data.categories);
        setView('GAME');      
        setStopperName('');   
        setResults([]);       
        setCurrentVotes({}); 
        setIsStarting(false); 
      });

      socket.on('round_ended', (data) => setStopperName(data.stopperName));

      socket.on('show_results', (data) => {
        setResults(data);
        setView('RESULTS'); 
      });

      socket.on('vote_update', ({ answerId, votes, needed, voters }) => {
        setCurrentVotes(prev => ({ ...prev, [answerId]: { votes, needed, voters } }));
      });

      socket.on('game_over', (stats) => {
         setFinalStats(stats);
         setView('GAME_OVER');
         setIsStarting(false);
      });

      socket.on('room_reset', () => {
         setView('WAITING_ROOM'); 
         setResults([]);
         setFinalStats(null);
         setIsStarting(false);
      });

      // Limpieza de eventos al desmontar
      return () => {
        socket.off('update_players');
        socket.off('game_started');
        socket.off('round_ended');
        socket.off('show_results');
        socket.off('vote_update');
        socket.off('game_over');
        socket.off('room_reset');
      };
    }
  }, [user]);

  // --- HANDLERS (ACCIONES) ---

  const handleLogin = (u) => { 
    localStorage.setItem('plm_user', JSON.stringify(u)); 
    setUser(u); 
  };
  
  const handleLogout = () => {
    localStorage.removeItem('plm_user');
    localStorage.removeItem('plm_room'); // También borramos la sala
    socket.disconnect();
    setUser(null);
    setRoom(null);
    setView('LOBBY');
  };

  // Función para Volver al Inicio sin cerrar sesión
  const handleLeaveRoom = () => {
    setRoom(null);
    setIsHost(false);
    setPlayers([]);
    setView('LOBBY');
    localStorage.removeItem('plm_room');
  };

  const handleCreateRoomFinal = (config) => {
    setIsCreating(true);
    socket.emit('create_room', { 
        userId: user.id, 
        username: user.username,
        config: config 
    }, (res) => {
        setIsCreating(false);
        setIsCreateModalOpen(false);
        if (res.status === 'OK') {
          setRoom(res.room);
          setIsHost(true);
          setPlayers([{ ...res.player, user: user }]);
          if(res.room.categories) setActiveCategories(res.room.categories.split(','));
          
          localStorage.setItem('plm_room', res.room.code); // GUARDA LA SALA
          setView('WAITING_ROOM'); 
        } else {
          alert("Error: " + res.message);
        }
    });
  };

  const handleSubmitCode = (c) => {
    socket.emit('join_room', { roomCode: c, userId: user.id, username: user.username }, (res) => {
      if (res.status === 'OK') {
        setRoom(res.room);
        setIsHost(res.player.isHost); 
        setIsJoinModalOpen(false);
        if(res.room.categories) setActiveCategories(res.room.categories.split(','));
        
        localStorage.setItem('plm_room', res.room.code); // GUARDA LA SALA
        setView('WAITING_ROOM');
      } else {
        alert("Error: " + res.message);
      }
    });
  };

  const handleStartGame = () => {
    setIsStarting(true); 
    socket.emit('start_game', { roomCode: room.code }, (res) => {
      if (res.status !== 'OK') {
         setIsStarting(false);
         if (res.message !== 'Game Over') alert("⚠️ " + res.message);
      }
    });
  };

  const handleResetGame = () => {
      socket.emit('reset_room', { roomCode: room.code }, (res) => {
          if (res.status !== 'OK') alert("Error al reiniciar");
      });
  };

  const handleTriggerStop = () => { 
      socket.emit('trigger_stop', { roomCode: room.code, userId: user.id, username: user.username, roundId: roundData.roundId }, () => {}); 
  };

  const handleSubmitAnswers = (answers) => {
    socket.emit('submit_answers', { roomCode: room.code, userId: user.id, answers: answers, roundId: roundData.roundId }, (response) => {
      if (response.status === 'OK') {
        setView('WAITING_RESULTS');
        if (isHost) {
          setTimeout(() => {
            socket.emit('get_round_results', { roomCode: room.code, roundId: roundData.roundId }, () => {});
          }, 2000);
        }
      }
    });
  };

  const handleVoteInvalid = (answerId) => {
    socket.emit('vote_answer_invalid', { roomCode: room.code, answerId, userId: user.id, roundId: roundData.roundId }, (res) => {
       if(res && res.status === 'ERROR') alert("🚫 " + res.message);
    });
  };

  // --- RENDERIZADO ---
  return (
    // pt-16 para que la nueva barra superior no tape el juego
    <div className={`min-h-screen flex flex-col items-center justify-center bg-paper font-sans text-ink ${user ? 'pt-16 pb-4 px-4' : 'p-4'}`}>
      
      {/* ============================================== */}
      {/* 🌟 HEADER GLOBAL (Control de Sala y Sesión) 🌟 */}
      {/* ============================================== */}
      {user && (
        <div className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-3 md:px-6 transition-all ${room ? 'h-16 bg-ink border-b-4 border-neon-pink shadow-md animate-fade-in-up' : 'h-20 pointer-events-none'}`}>
           
           <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
              {/* Logo (Clickable para ir al inicio si estás en una sala) */}
              <div 
                onClick={() => {
                  if (room && window.confirm('¿Volver a la pantalla principal? Abandonarás la sala actual.')) {
                    handleLeaveRoom();
                  }
                }}
                className={`transition-transform ${room ? 'cursor-pointer hover:scale-105' : ''}`}
                title={room ? "Volver al inicio" : ""}
              >
                <Logo size="h-10 md:h-12" className={`drop-shadow-md ${room ? 'hidden sm:block' : ''}`} />
              </div>
              
              {/* Código de Sala EN EL HEADER (Solo si estás dentro de una) */}
              {room && (
                <div 
                  onClick={() => {
                    navigator.clipboard.writeText(room.code);
                    alert(`¡Código ${room.code} copiado al portapapeles!`);
                  }}
                  className="flex items-center gap-2 bg-white/10 px-3 py-1 md:py-2 rounded border border-white/20 cursor-pointer hover:bg-white/20 transition-colors group"
                  title="Copiar Código"
                >
                   <span className="font-heading text-xs md:text-sm text-gray-300 hidden md:inline">SALA:</span>
                   <span className="font-heading text-xl md:text-2xl text-neon-yellow tracking-widest">{room.code}</span>
                   <span className="text-xs md:text-sm group-hover:scale-125 transition-transform">📋</span>
                </div>
              )}
           </div>

           {/* BOTONES DERECHA */}
           <div className="flex items-center pointer-events-auto">
             {room ? (
               // Botón: Volver al menú principal (Lobby)
               <button 
                 onClick={() => {
                   if(window.confirm('¿Seguro que quieres volver al inicio? Abandonarás la partida.')) handleLeaveRoom();
                 }} 
                 className="text-[10px] md:text-xs font-bold bg-white text-ink hover:bg-red-500 hover:text-white px-3 py-2 border-2 border-ink shadow-[2px_2px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1"
               >
                 <span className="text-sm">🏠</span> <span className="hidden md:inline">VOLVER AL</span> INICIO
               </button>
             ) : (
               // Botón: Cerrar Sesión (Solo visible en el Lobby)
               <button 
                 onClick={handleLogout} 
                 className="text-xs font-bold text-gray-400 hover:text-neon-pink underline"
               >
                 CERRAR SESIÓN
               </button>
             )}
           </div>
        </div>
      )}

      {/* MODALES */}
      <JoinModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onJoin={handleSubmitCode} />
      <CreateRoomModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateRoomFinal} />

      {/* --- GESTIÓN DE VISTAS --- */}
      {!user ? (
        <Login onJoin={handleLogin} />
      ) : view === 'GAME' ? (
        <GameBoard 
            user={user} 
            roomCode={room.code}
            letter={roundData.letter} 
            roundNumber={roundData.roundNumber} 
            onTriggerStop={handleTriggerStop} 
            onSubmitAnswers={handleSubmitAnswers} 
            categories={activeCategories} 
        />
      ) : view === 'WAITING_RESULTS' ? (
        <div className="flex flex-col items-center justify-center animate-pulse text-center max-w-md">
          <div className="text-8xl mb-6 animate-bounce">⚖️</div>
          <h2 className="font-heading text-4xl text-ink mb-2">JUEZ DELIBERANDO</h2>
          <p className="font-hand text-xl text-gray-500">Recibiendo respuestas...</p>
          {stopperName && <div className="mt-8 bg-neon-yellow border-2 border-ink px-6 py-2 rotate-2 font-bold shadow-sm">STOP PRESIONADO POR: <span className="text-neon-pink">{stopperName}</span></div>}
        </div>
      ) : view === 'RESULTS' ? (
        <ResultsBoard 
          results={results} isHost={isHost} onNextRound={handleStartGame} 
          onVoteInvalid={handleVoteInvalid} currentVotes={currentVotes} userId={user.id} 
          isStarting={isStarting} categories={activeCategories}
        />
      ) : view === 'GAME_OVER' ? ( 
        <GameOverBoard 
           finalStats={finalStats} 
           isHost={isHost} 
           onResetGame={handleResetGame} 
        />
      ) : !room ? (
        <Lobby 
            user={user} 
            onCreateRoom={() => setIsCreateModalOpen(true)} 
            onJoinRoom={() => setIsJoinModalOpen(true)} 
            isCreating={isCreating} 
        />
      ) : (
        // ==============================================
        // 🏠 SALA DE ESPERA (PREPARANDO PARTIDA)
        // ==============================================
        <div className="bg-white border-2 border-ink p-8 shadow-pop text-center max-w-md w-full animate-fade-in-up relative mt-8">
           <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neon-yellow border-2 border-ink px-4 py-1 font-bold shadow-sm rotate-[-2deg]">
             PREPARANDO PARTIDA
           </div>
           
           {/* --- CÓDIGO DE SALA EN GRANDE --- */}
           <p className="font-hand text-xl text-gray-500 mt-6">CÓDIGO DE SALA</p>
           <h1 
             className="text-6xl font-heading text-neon-blue tracking-widest my-2 cursor-pointer hover:scale-105 transition-transform" 
             onClick={() => {
               navigator.clipboard.writeText(room.code);
               alert(`¡Código ${room.code} copiado al portapapeles!`);
             }}
             title="Toca para copiar"
           >
             {room.code}
           </h1>
           
           <div className="mt-8 text-left">
              <h3 className="font-heading text-lg border-b-2 border-ink mb-2 flex justify-between">
                <span>JUGADORES EN SALA</span>
                <span className="bg-gray-200 px-2 rounded-full text-sm">{players.length}/8</span>
              </h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {players.map(p => (
                  <li key={p.id} className="flex items-center justify-between font-hand text-xl border-b border-gray-100 pb-1">
                    <span className={p.userId === user.id ? "font-bold text-neon-blue" : "text-gray-700"}>
                      {p.user?.username} {p.userId === user.id && "(Tú)"}
                    </span>
                    {p.isHost && <span className="text-neon-pink text-[10px] font-bold border border-ink px-1 rounded bg-white">HOST</span>}
                  </li>
                ))}
              </ul>
           </div>
           
           {isHost ? (
             <div className="flex flex-col gap-2 mt-8">
               {players.length < 2 && (
                 <p className="text-xs text-neon-pink font-bold animate-pulse">
                   ⚠️ Se necesitan al menos 2 jugadores
                 </p>
               )}

               <button 
                 onClick={handleStartGame} 
                 disabled={isStarting || players.length < 2}
                 className={`
                   w-full font-heading text-xl py-3 border-2 border-ink shadow-pop transition-all flex justify-center items-center gap-2
                   ${players.length < 2 
                      ? 'bg-gray-200 text-gray-400 border-gray-300 shadow-none cursor-not-allowed' 
                      : 'bg-neon-green text-ink hover:-translate-y-1'
                   }
                 `}
               >
                 {isStarting ? (
                   <>
                     <span className="animate-spin h-5 w-5 border-2 border-ink border-t-transparent rounded-full"></span>
                     INICIANDO...
                   </>
                 ) : players.length < 2 ? (
                   "ESPERANDO..."
                 ) : (
                   "INICIAR PARTIDA"
                 )}
               </button>
             </div>
           ) : (
             <div className="mt-8 p-4 bg-paper border border-ink border-dashed text-sm text-gray-500 animate-pulse text-center">
               ⏳ Esperando a que el Host inicie...
             </div>
           )}
        </div>
      )}
    </div>
  );
}

export default App;