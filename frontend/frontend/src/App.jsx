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

  // --- 1. PERSISTENCIA DE SESIÓN ---
  useEffect(() => {
    const savedUser = localStorage.getItem('plm_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // --- 2. GESTIÓN DE SOCKETS ---
  useEffect(() => {
    if (user) {
      // Conectar al socket con el usuario actual
      socket.auth = { username: user.username };
      socket.connect();

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
    socket.disconnect();
    setUser(null);
    setRoom(null);
    setView('LOBBY');
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
         // Si es un error de validación (ej: pocos jugadores), mostramos alerta
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
          // El host pide los resultados después de un breve delay
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper p-4 font-sans text-ink">
      
      {/* HEADER GLOBAL (Cerrar sesión + Logo) */}
      {user && (
        <>
            <button onClick={handleLogout} className="fixed top-4 right-4 text-xs font-bold text-gray-400 hover:text-neon-pink underline z-[60]">
                CERRAR SESIÓN
            </button>
            <div className="fixed top-2 left-2 z-[60] pointer-events-none">
                {/* Logo Responsive: Pequeño en móvil (h-10), grande en PC (md:h-20) */}
                <Logo size="h-10 md:h-20" className="hover:scale-110 transition-transform duration-300 drop-shadow-md" />
            </div>
        </>
      )}

      {/* MODALES */}
      <JoinModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onJoin={handleSubmitCode} />
      <CreateRoomModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateRoomFinal} />

      {/* --- GESTIÓN DE VISTAS --- */}
      {!user ? (
        // 1. LOGIN
        <Login onJoin={handleLogin} />
      ) : view === 'GAME' ? (
        // 2. TABLERO DE JUEGO
        <GameBoard 
            user={user} 
            letter={roundData.letter} 
            roundNumber={roundData.roundNumber} 
            onTriggerStop={handleTriggerStop} 
            onSubmitAnswers={handleSubmitAnswers} 
            categories={activeCategories} 
        />
      ) : view === 'WAITING_RESULTS' ? (
        // 3. PANTALLA DE CARGA (ESPERANDO JUEZ)
        <div className="flex flex-col items-center justify-center animate-pulse text-center max-w-md">
          <div className="text-8xl mb-6 animate-bounce">⚖️</div>
          <h2 className="font-heading text-4xl text-ink mb-2">JUEZ DELIBERANDO</h2>
          <p className="font-hand text-xl text-gray-500">Recibiendo respuestas...</p>
          {stopperName && <div className="mt-8 bg-neon-yellow border-2 border-ink px-6 py-2 rotate-2 font-bold shadow-sm">STOP PRESIONADO POR: <span className="text-neon-pink">{stopperName}</span></div>}
        </div>
      ) : view === 'RESULTS' ? (
        // 4. TABLA DE RESULTADOS
        <ResultsBoard 
          results={results} isHost={isHost} onNextRound={handleStartGame} 
          onVoteInvalid={handleVoteInvalid} currentVotes={currentVotes} userId={user.id} 
          isStarting={isStarting} categories={activeCategories}
        />
      ) : view === 'GAME_OVER' ? ( 
        // 5. FIN DEL JUEGO (PREMIOS)
        <GameOverBoard 
           finalStats={finalStats} 
           isHost={isHost} 
           onResetGame={handleResetGame} 
        />
      ) : !room ? (
        // 6. LOBBY PRINCIPAL (MENÚ)
        <Lobby 
            user={user} 
            onCreateRoom={() => setIsCreateModalOpen(true)} 
            onJoinRoom={() => setIsJoinModalOpen(true)} 
            isCreating={isCreating} 
        />
      ) : (
        // 7. SALA DE ESPERA (WAITING ROOM)
        <div className="bg-white border-2 border-ink p-8 shadow-pop text-center max-w-md w-full animate-fade-in-up relative">
           <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neon-yellow border-2 border-ink px-4 py-1 font-bold shadow-sm rotate-[-2deg]">
             ESPERANDO JUGADORES
           </div>
           
           <p className="font-hand text-xl text-gray-500 mt-4">CÓDIGO DE SALA</p>
           <h1 className="text-6xl font-heading text-neon-blue tracking-widest my-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigator.clipboard.writeText(room.code)}>
             {room.code}
           </h1>
           
           <div className="mt-8 text-left">
              <h3 className="font-heading text-lg border-b-2 border-ink mb-2 flex justify-between">
                <span>JUGADORES</span>
                <span className="bg-gray-200 px-2 rounded-full text-sm">{players.length}</span>
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
           
           {/* Botón Salir */}
           <button 
             onClick={() => { setRoom(null); setIsHost(false); setPlayers([]); setView('LOBBY'); }} 
             className="mt-8 text-gray-400 hover:text-ink text-sm underline block w-full text-center mb-4 transition-colors"
           >
             Salir de la sala
           </button>
           
           {/* Panel de Control del Host */}
           {isHost ? (
             <div className="flex flex-col gap-2">
               {/* ADVERTENCIA: MÍNIMO 2 JUGADORES */}
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
             <div className="p-4 bg-paper border border-ink border-dashed text-sm text-gray-500 animate-pulse text-center">
               ⏳ Esperando al anfitrión...
             </div>
           )}
        </div>
      )}
    </div>
  );
}

export default App;