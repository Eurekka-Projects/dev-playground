import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createDeck, dealCards } from './gameLogic.js';
import { canPlayCard, handleCardViewing, getTeammate } from './gameRules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

const MAX_PLAYERS = 4;
let gameState = {
  players: [],
  currentPlayer: null,
  trump: null,
  deck: [],
  playedCards: [],
  whoPlayedCard:[],
  playedCardsHistory: [],
  winner: null,
  status: 'waiting',
  teams: {
    team1: [],
    team2: []
  },
  roomOwner: null,
  roundNumber: 0,
  hasShownInitialCards: false,
  hasShownAntepenultimateCards: false,
  isViewingTeammateCards: false,
  teamScores: {
    team1: 0,
    team2: 0
  },
  firstPlayer: null
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('gameState', gameState);

  socket.on('joinGame', (playerName) => {
    console.log('Player joining:', playerName);
    if (gameState.players.length >= MAX_PLAYERS) {
      socket.emit('error', 'Game is full');
      return;
    }

    const isFirstPlayer = gameState.players.length === 0;
    const player = {
      id: socket.id,
      name: playerName,
      hand: [],
      score: 0,
      isRoomOwner: isFirstPlayer
    };

    if (isFirstPlayer) {
      gameState.roomOwner = socket.id;
    }

    gameState.players.push(player);
    console.log('Current players:', gameState.players.length);

    if (gameState.players.length === MAX_PLAYERS) {
      gameState.status = 'team-selection';
    }

    io.emit('gameState', gameState);
  });

  socket.on('selectTeam', ({ playerId, team }) => {
    if (socket.id !== gameState.roomOwner) return;

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    gameState.teams.team1 = gameState.teams.team1.filter(id => id !== playerId);
    gameState.teams.team2 = gameState.teams.team2.filter(id => id !== playerId);

    if (team === 1) {
      gameState.teams.team1.push(playerId);
    } else {
      gameState.teams.team2.push(playerId);
    }

    player.team = team;
    io.emit('gameState', gameState);
  });

  socket.on('selectFirstPlayer', (playerId) => {
    if (socket.id !== gameState.roomOwner) return;
    gameState.firstPlayer = playerId.playerId;
    gameState.currentPlayer = playerId
    io.emit('gameState', gameState);
  });

  socket.on('startGame', () => {
    if (socket.id !== gameState.roomOwner) return;
    if (gameState.teams.team1.length !== 2 || gameState.teams.team2.length !== 2) return;
    if (!gameState.firstPlayer) return;


   
    const deck = createDeck();
    const { hands, remainingDeck } = dealCards(deck, MAX_PLAYERS);

    gameState.players.forEach((player, index) => {
      player.hand = hands[index];
      player.score = 0;
    });

    gameState.status = 'playing';
    gameState.deck = remainingDeck.slice(1);
    gameState.trump = remainingDeck[0];
    gameState.currentPlayer = gameState.firstPlayer;
    gameState.roundNumber = 1;

    handleCardViewing(gameState, io);
    io.emit('gameState', gameState);
  });

  socket.on('playCard', (card) => {
    if (gameState.currentPlayer !== socket.id) return;

    const player = gameState.players.find(p => p.id === socket.id);
    if (!player) return;

    if (!canPlayCard(card, gameState, socket.id)) {
      socket.emit('error', 'Invalid card play');
      return;
    }

    // Remove card from player's hand
    const cardIndex = player.hand.findIndex(c =>
      c.suit === card.suit && c.value === card.value
    );

    if (cardIndex === -1) return;

    player.hand.splice(cardIndex, 1);
    if (gameState.playedCards.length < 5) {
      gameState.playedCards.push(card);
      gameState.whoPlayedCard.push({card:card, player:player.id})  
    }


    // find next player
    const playOrder = []
    playOrder.push(gameState.teams.team1[0])
    playOrder.push(gameState.teams.team2[0])
    playOrder.push(gameState.teams.team1[1])
    playOrder.push(gameState.teams.team2[1])

    const currentOrderPlayer = playOrder.indexOf(player.id)
    console.log('antes:' + currentOrderPlayer)
    let nextOrderPlayer = 0

    if (currentOrderPlayer == 3) nextOrderPlayer = 0
    else { nextOrderPlayer = currentOrderPlayer + 1 }

    let nextPlayer = playOrder[nextOrderPlayer]


    if (nextPlayer) {
      gameState.currentPlayer = nextPlayer;
    }

    if (gameState.playedCards.length == 4) {
      resolveRound();
      gameState.currentPlayer = gameState.playedCardsHistory[gameState.playedCardsHistory.length -1].win;

    }

    io.emit('gameState', gameState);

  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const playerIndex = gameState.players.findIndex(p => p.id === socket.id);

    if (playerIndex !== -1) {
      gameState.players.splice(playerIndex, 1);
      gameState.teams.team1 = gameState.teams.team1.filter(id => id !== socket.id);
      gameState.teams.team2 = gameState.teams.team2.filter(id => id !== socket.id);

      if (socket.id === gameState.roomOwner && gameState.players.length > 0) {
        gameState.roomOwner = gameState.players[0].id;
        gameState.players[0].isRoomOwner = true;
      }

      if (gameState.status === 'playing') {
        gameState.status = 'waiting';
        gameState.players = [];
        gameState.teams = { team1: [], team2: [] };
      }

      io.emit('gameState', gameState);
    }
  });
});





function resolveRound() {
  const trumpSuit = gameState.trump.suit;
  let winningCard = gameState.whoPlayedCard[0].card;
  let winningPlayerId = gameState.whoPlayedCard[0].player

  // REVISAR ESSE TREM AQUI 
  // Verifica se o Ás do trunfo foi jogado antes do 7 do trunfo
  const trumpSevenPlayed = gameState.playedCards.some(
    card => card.suit === trumpSuit && card.value === 7
  );

  gameState.playedCards.forEach((card, index) => {
    if (card.suit === trumpSuit && card.value === 1 && !trumpSevenPlayed) {
      throw new Error("O Ás do trunfo não pode ser jogado antes do 7 do trunfo.");
    }
  });

  // Verifica se o 7 do trunfo está sendo jogado como última carta
  if (gameState.playedCards[3]?.suit === trumpSuit && gameState.playedCards[3]?.value === 7) {
    throw new Error("O 7 do trunfo não pode ser jogado como última carta da rodada.");
  }

  const result = reorderCards(gameState.whoPlayedCard, trumpSuit, winningCard);
  console.log(result)
  winningCard = result[0].card;
  winningPlayerId = result[0].player;


  // Calcula os pontos da rodada
  const points = gameState.playedCards.reduce((sum, card) => sum + card.points, 0);
  const winningTeam = gameState.teams.team1.includes(winningPlayerId) ? 'team1' : 'team2';
  gameState.teamScores[winningTeam] += points;

  // Atualiza o estado do jogo
  gameState.lastWinningPlayer = winningPlayerId;
  gameState.currentPlayer = winningPlayerId

  // Deal new cards
  if (gameState.deck.length > 0) {
    gameState.players.forEach(player => {
      if (player.hand.length < 3) {
        const newCard = gameState.deck.pop();
        if (newCard) {
          player.hand.push(newCard);
        }
      }
    });
  }

  let round = {
    cards: gameState.whoPlayedCard,
    win: winningPlayerId, 
    teamWin: winningTeam
  }
  gameState.playedCardsHistory.push(round);

  gameState.playedCards = [];
  gameState.whoPlayedCard = [];
  gameState.currentPlayer = winningPlayerId;

  // Check for game end
  if (gameState.deck.length === 0 && gameState.players.every(p => p.hand.length === 0)) {
    gameState.status = 'finished';
    gameState.winner = gameState.teamScores.team1 > gameState.teamScores.team2 ? 'team1' : 'team2';
  }

  gameState.playedCards = []


}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


function reorderCards(cards, trumpSuit, winningCard) {
  return cards.map(({ card, player }) => ({ card, player })) // Copia os objetos para preservar a entrada original
    .sort((a, b) => {
      const orderValue = (card) => {
        // Define a precedência da Bisca para os valores das cartas
        const precedence = { 1: 14, 7: 13, 13: 12, 12: 11, 11: 10, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 };
        return precedence[card.value] || card.value;
      };

      const aCard = a.card;
      const bCard = b.card;

      // 1. Verifica se há cartas do trunfo
      const isTrumpA = aCard.suit === trumpSuit;
      const isTrumpB = bCard.suit === trumpSuit;

      if (isTrumpA && !isTrumpB) return -1; // A é trunfo, prioridade maior
      if (!isTrumpA && isTrumpB) return 1;  // B é trunfo, prioridade maior
      if (isTrumpA && isTrumpB) {
        return orderValue(bCard) - orderValue(aCard); // Ambos trunfos, ordena pelo valor
      }

      // 2. Caso não existam trunfos, verifica o mesmo naipe do winningCard
      const isSameSuitAsWinningA = aCard.suit === winningCard.suit;
      const isSameSuitAsWinningB = bCard.suit === winningCard.suit;

      if (isSameSuitAsWinningA && !isSameSuitAsWinningB) return -1; // A é do mesmo naipe da winningCard
      if (!isSameSuitAsWinningA && isSameSuitAsWinningB) return 1;  // B é do mesmo naipe da winningCard
      if (isSameSuitAsWinningA && isSameSuitAsWinningB) {
        return orderValue(bCard) - orderValue(aCard); // Ambos do mesmo naipe, ordena pelo valor
      }

      // 3. Caso nenhum dos critérios acima seja atendido, mantém a ordem original
      return 0;
    });
}