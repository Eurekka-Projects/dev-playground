import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameBoard } from './components/GameBoard';
import { WaitingRoom } from './components/WaitingRoom';
import { TeamSelection } from './components/TeamSelection';
import { GameState, Card } from './types/game';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const newSocket = io('https://dev-playground-production.up.railway.app', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('connected');
      setError('');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
      setError('Failed to connect to server. Please refresh the page.');
    });

    newSocket.on('gameState', (state: GameState) => {
      console.log('Received game state:', state);
      setGameState(state);
    });

    newSocket.on('error', (msg: string) => {
      console.error('Game error:', msg);
      setError(msg);
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.close();
    };
  }, []);

  const handleJoinGame = (playerName: string) => {
    if (socket) {
      console.log('Attempting to join game with name:', playerName);
      socket.emit('joinGame', playerName);
    }
  };

  const handleTeamSelect = (playerId: string, team: 1 | 2) => {
    if (socket) {
      console.log('Selecting team:', { playerId, team });
      socket.emit('selectTeam', { playerId, team });
    }
  };

  const handleTeamSelectedFirstPlayer = (playerId: string) => {
    if (socket) {
      console.log('Selecting player:', { playerId});
      socket.emit('selectFirstPlayer', { playerId });
    }
  };

  const handleStartGame = () => {
    if (socket) {
      console.log('Starting game');
      socket.emit('startGame');
    }
  };

  const handleCardPlay = (card: Card) => {
    if (socket && gameState?.currentPlayer === socket.id) {
      console.log('Playing card:', card);
      socket.emit('playCard', card);
    }
  };

  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">
          Connecting to server...
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <WaitingRoom
        players={[]}
        onJoinGame={handleJoinGame}
        currentPlayerId={socket?.id}
      />
    );
  }

  if (gameState.status === 'waiting') {
    return (
      <WaitingRoom
        players={gameState.players}
        onJoinGame={handleJoinGame}
        currentPlayerId={socket?.id}
      />
    );
  }

  if (gameState.status === 'team-selection') {
    return (
      <TeamSelection
        players={gameState.players}
        onTeamSelect={handleTeamSelect}
        onStartGame={handleStartGame}
        firstPlayer = {handleTeamSelectedFirstPlayer}
        currentPlayerId={socket?.id}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      
      <GameBoard
        gameState={gameState}
        playerId={socket?.id || ''}
        onCardPlay={handleCardPlay}
      />
    </div>
  );
}

export default App;