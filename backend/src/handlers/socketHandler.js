const prisma = require('../database/db');
const { generateRoomCode } = require('../utils/codeGenerator');

const stopTimers = {};
const answerVotes = {}; 

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Conectado: ${socket.id}`);

    // CREAR SALA
    socket.on('create_room', async ({ userId, username, config }, callback) => {
      try {
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) return callback({ status: 'ERROR', message: 'Usuario inválido' });

        const roomCode = generateRoomCode();
        let categoriesStr = "NOMBRE,APELLIDO,CIUDAD,ANIMAL,FRUTA,COSA";
        let roundsNum = 5;

        if (config) {
            if (config.mode === 'CUSTOM' && Array.isArray(config.categories)) categoriesStr = config.categories.join(',');
            if (config.rounds) roundsNum = parseInt(config.rounds);
        }

        const newRoom = await prisma.gameRoom.create({
          data: { code: roomCode, status: 'WAITING', maxRounds: roundsNum, categories: categoriesStr }
        });

        const player = await prisma.player.create({
          data: { userId, roomId: newRoom.id, isHost: true, socketId: socket.id }
        });

        socket.join(roomCode);
        callback({ status: 'OK', room: newRoom, player });
      } catch (e) { callback({ status: 'ERROR', message: 'Error al crear sala' }); }
    });

    // UNIRSE
    socket.on('join_room', async ({ roomCode, userId }, callback) => {
      try {
        const room = await prisma.gameRoom.findUnique({ where: { code: roomCode }, include: { players: true } });
        if (!room) return callback({ status: 'ERROR', message: 'Sala no encontrada' });
        
        const isAlreadyIn = room.players.find(p => p.userId === userId);
        if (!isAlreadyIn && room.status !== 'WAITING') return callback({ status: 'ERROR', message: 'Partida ya iniciada' });

        let player;
        if (isAlreadyIn) {
          player = isAlreadyIn;
          await prisma.player.update({ where: { id: player.id }, data: { socketId: socket.id } });
        } else {
          player = await prisma.player.create({ data: { userId, roomId: room.id, isHost: false, socketId: socket.id } });
        }
        socket.join(roomCode);
        const allPlayers = await prisma.player.findMany({ where: { roomId: room.id }, include: { user: true } });
        io.to(roomCode).emit('update_players', allPlayers);
        callback({ status: 'OK', room, player });
      } catch (e) { callback({ status: 'ERROR' }); }
    });

    // INICIAR JUEGO (Con validación de jugadores)
    socket.on('start_game', async ({ roomCode }, callback) => {
      try {
        for (const id in answerVotes) delete answerVotes[id];
        const room = await prisma.gameRoom.findUnique({ where: { code: roomCode }, include: { players: true } });
        
        // --- VALIDACIÓN: Mínimo 2 jugadores ---
        if (room.players.length < 2) {
            return callback({ status: 'ERROR', message: 'Se necesitan mínimo 2 jugadores.' });
        }

        // Fin de juego?
        const roundsCount = await prisma.round.count({ where: { roomId: room.id } });
        if (roundsCount >= room.maxRounds) {
            const stats = await calculateGameStats(room.id);
            await prisma.gameRoom.update({ where: { id: room.id }, data: { status: 'FINISHED' } });
            io.to(roomCode).emit('game_over', stats);
            return callback({ status: 'OK', message: 'Game Over' });
        }

        // Elegir Letra
        const alphabet = "ABCDEFGHIJLMNOPQRSTUVWXYZ".split('');
        const used = room.usedLetters ? room.usedLetters.split(',') : [];
        const available = alphabet.filter(l => !used.includes(l));
        
        if (available.length === 0) {
             const stats = await calculateGameStats(room.id);
             io.to(roomCode).emit('game_over', stats);
             return callback({ status: 'OK' });
        }

        const randomLetter = available[Math.floor(Math.random() * available.length)];
        const newUsed = used.length > 0 ? `${room.usedLetters},${randomLetter}` : randomLetter;
        
        await prisma.gameRoom.update({ where: { id: room.id }, data: { status: 'PLAYING', usedLetters: newUsed } });
        const newRound = await prisma.round.create({ data: { roomId: room.id, roundNumber: roundsCount + 1, letter: randomLetter, status: 'ACTIVE' } });

        io.to(roomCode).emit('game_started', { 
            letter: randomLetter, 
            roundNumber: roundsCount + 1, 
            roundId: newRound.id,
            categories: room.categories.split(',') 
        });
        callback({ status: 'OK' });
      } catch (e) { console.error(e); callback({ status: 'ERROR' }); }
    });

    // STOP
    socket.on('trigger_stop', async ({ roomCode, userId, username, roundId }, callback) => {
      if (stopTimers[roomCode]) return callback({ status: 'OK' });
      io.to(roomCode).emit('stop_warning', { stopperName: username, seconds: 5 });
      stopTimers[roomCode] = setTimeout(async () => {
        try {
            await prisma.round.update({ where: { id: roundId }, data: { status: 'VOTING', stopperId: userId } });
            io.to(roomCode).emit('round_ended', { stopperName: username, roundId });
            delete stopTimers[roomCode];
        } catch (e) {}
      }, 5000);
      callback({ status: 'OK' });
    });

    // ENVIAR RESPUESTAS
    socket.on('submit_answers', async ({ roomCode, userId, answers, roundId }, callback) => {
      const room = await prisma.gameRoom.findUnique({ where: { code: roomCode } });
      const player = await prisma.player.findFirst({ where: { userId, roomId: room.id } });
      if (player) {
        const answersToSave = Object.entries(answers).map(([category, content]) => ({
          roundId, playerId: player.id, category, content: content || "", isValid: true
        }));
        await prisma.answer.createMany({ data: answersToSave });
      }
      callback({ status: 'OK' });
    });

    // VOTACIÓN
    socket.on('vote_answer_invalid', async ({ roomCode, answerId, userId, roundId }, callback) => {
      const targetAnswer = await prisma.answer.findUnique({ where: { id: answerId }, include: { player: true } });
      if (!targetAnswer || targetAnswer.player.userId === userId) return callback({ status: 'ERROR' });

      if (!answerVotes[answerId]) answerVotes[answerId] = new Set();
      answerVotes[answerId].add(userId);

      const roomPlayers = await prisma.player.findMany({ where: { roomId: targetAnswer.player.roomId } });
      const needed = roomPlayers.length <= 2 ? 1 : 2;
      
      if (answerVotes[answerId].size >= needed) {
          await prisma.answer.update({ where: { id: answerId }, data: { isValid: false } });
          await calculateAndBroadcastResults(io, roomCode, roundId);
          callback({ status: 'ANNULLED', votes: answerVotes[answerId].size });
      } else {
          io.to(roomCode).emit('vote_update', { answerId, votes: answerVotes[answerId].size, needed });
          callback({ status: 'VOTED' });
      }
    });

    socket.on('get_round_results', async ({ roomCode, roundId }, callback) => {
      await calculateAndBroadcastResults(io, roomCode, roundId); callback({ status: 'OK' });
    });

    socket.on('reset_room', async ({ roomCode }, callback) => {
        const room = await prisma.gameRoom.findUnique({ where: { code: roomCode } });
        await prisma.gameRoom.update({ where: { id: room.id }, data: { status: 'WAITING', usedLetters: "" } });
        await prisma.answer.deleteMany({ where: { player: { roomId: room.id } } });
        await prisma.round.deleteMany({ where: { roomId: room.id } });
        await prisma.player.updateMany({ where: { roomId: room.id }, data: { score: 0 } });
        io.to(roomCode).emit('room_reset');
        callback({ status: 'OK' });
    });

    // HELPERS
    async function calculateAndBroadcastResults(io, roomCode, roundId) {
        const allAnswers = await prisma.answer.findMany({ where: { roundId }, include: { player: { include: { user: true } } } });
        const validAnalysis = {}; 
        allAnswers.forEach(ans => {
          if (!ans.isValid) return;
          const cat = ans.category; const word = ans.content.trim().toUpperCase();
          if (!validAnalysis[cat]) validAnalysis[cat] = {};
          if (!validAnalysis[cat][word]) validAnalysis[cat][word] = [];
          if (word.length > 0) validAnalysis[cat][word].push(ans.id);
        });

        const updates = []; const results = {}; 
        for (const ans of allAnswers) {
          let newScore = 0;
          if (ans.isValid && ans.content.trim().length > 0) {
             const count = validAnalysis[ans.category]?.[ans.content.trim().toUpperCase()]?.length || 0;
             newScore = (count > 1) ? 50 : 100;
          }
          if (ans.score !== newScore) {
             updates.push(prisma.answer.update({ where: { id: ans.id }, data: { score: newScore } }));
             ans.score = newScore;
          }
          const u = ans.player.userId;
          if (!results[u]) results[u] = { totalScore: 0, answers: {}, name: ans.player.user.username, userId: u };
          results[u].answers[ans.category] = { id: ans.id, word: ans.content, score: ans.score, isValid: ans.isValid };
          results[u].totalScore += ans.score;
        }
        if (updates.length > 0) await Promise.all(updates);
        io.to(roomCode).emit('show_results', Object.values(results).sort((a, b) => b.totalScore - a.totalScore));
    }

    async function calculateGameStats(roomId) {
        const players = await prisma.player.findMany({ where: { roomId }, include: { user: true } });
        const leaderboard = players.map(p => ({ name: p.user.username, totalScore: 0, userId: p.userId }));
        
        for (let p of leaderboard) {
            const total = await prisma.answer.aggregate({
                where: { playerId: (await prisma.player.findFirst({ where: { userId: p.userId, roomId } })).id },
                _sum: { score: true }
            });
            p.totalScore = total._sum.score || 0;
        }
        return { leaderboard: leaderboard.sort((a, b) => b.totalScore - a.totalScore), awards: {} };
    }
  });
};