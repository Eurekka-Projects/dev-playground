import React, { useState } from 'react';
import { Player } from '../types/game';

interface TeamSelectionProps {
  players: Player[];
  onTeamSelect: (playerId: string, team: 1 | 2) => void;
  onStartGame: () => void;
  firstPlayer: (playerId: string) => void;
  currentPlayerId?: string;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({
  players,
  onTeamSelect,
  onStartGame,
  firstPlayer,
  currentPlayerId
}) => {
  const [selectedFirstPlayer, setSelectedFirstPlayer] = useState<string | null>(null);
  const team1 = players.filter(p => p.team === 1);
  const team2 = players.filter(p => p.team === 2);
  const unassigned = players.filter(p => !p.team);
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isRoomOwner = currentPlayer?.isRoomOwner;

  const handleStartGame = () => {
    if (selectedFirstPlayer) {
      console.log('primeiro jogador' + selectedFirstPlayer)
      onStartGame();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
        <h1 className="text-2xl font-bold text-center mb-8">Hora de montar as duplas</h1>

        {!isRoomOwner && (
          <div className="text-center text-gray-600 mb-6">
            Aguardando o organizador escolher as duplas
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Team 1 */}
          <div className="border-2 border-blue-500 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">Dupla 1</h2>
            <div className="space-y-2">
              {team1.map(player => (
                <div key={player.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>{player.name}</span>
                    {isRoomOwner && (
                      <button
                        onClick={() => onTeamSelect(player.id, 2)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mover para a dupla 2
                      </button>
                    )}
                  </div>
                  {isRoomOwner && team1.length === 2 && team2.length === 2 && (
                    <button
                      onClick={() => {
                        setSelectedFirstPlayer(player.id)
                        firstPlayer(player.id)
                      }

                      }
                      className={`w-full py-1 px-2 rounded text-sm ${selectedFirstPlayer === player.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                    >
                      {selectedFirstPlayer === player.id ? 'Selected to Start' : 'Select to Start'}
                    </button>
                  )}
                </div>
              ))}
              {Array.from({ length: 2 - team1.length }).map((_, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg text-gray-400">
                  Aguardando jogador
                </div>
              ))}
            </div>
          </div>

          {/* Unassigned Players */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Jogadores disponíveis</h2>
            <div className="space-y-2">
              {unassigned.map(player => (
                <div key={player.id} className="p-3 bg-white rounded-lg shadow">
                  <p className="mb-2">{player.name}</p>
                  {isRoomOwner && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onTeamSelect(player.id, 1)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Dupla 1
                      </button>
                      <button
                        onClick={() => onTeamSelect(player.id, 2)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Dupla 2
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Team 2 */}
          <div className="border-2 border-red-500 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Dupla 2</h2>
            <div className="space-y-2">
              {team2.map(player => (
                <div key={player.id} className="p-3 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>{player.name}</span>
                    {isRoomOwner && (
                      <button
                        onClick={() => onTeamSelect(player.id, 1)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Mover para a dupla 1
                      </button>
                    )}
                  </div>
                  {isRoomOwner && team1.length === 2 && team2.length === 2 && (
                    <button
                      onClick={() => setSelectedFirstPlayer(player.id)}
                      className={`w-full py-1 px-2 rounded text-sm ${selectedFirstPlayer === player.id
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                    >
                      {selectedFirstPlayer === player.id ? 'Selected to Start' : 'Select to Start'}
                    </button>
                  )}
                </div>
              ))}
              {Array.from({ length: 2 - team2.length }).map((_, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg text-gray-400">
                  Aguardando jogador
                </div>
              ))}
            </div>
          </div>
        </div>

        {isRoomOwner && team1.length === 2 && team2.length === 2 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleStartGame}
              disabled={!selectedFirstPlayer}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {selectedFirstPlayer ? 'Que comecem os jogos' : 'Select First Player to Start'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};