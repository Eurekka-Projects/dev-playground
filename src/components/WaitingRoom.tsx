import React from 'react';
import { Player } from '../types/game';
import Logo from '../utils/loo.png'

interface WaitingRoomProps {
  players: Player[];
  onJoinGame: (playerName: string) => void;
  currentPlayerId?: string;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  players,
  onJoinGame,
  currentPlayerId
}) => {
  const [playerName, setPlayerName] = React.useState('');
  const isPlayerJoined = players.some(p => p.id === currentPlayerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onJoinGame(playerName.trim());
      setPlayerName('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-green-800 rounded-lg shadow-xl p-4 max-w-5xl w-full flex-row flex items-center justify-between gap-5">
        <div className='flex flex-col w-2/4'>
          { isPlayerJoined &&  <div className="flex justify-center">

            <img src={Logo} className='w-60' />
          </div> }

          <h1 className="text-2xl font-bold text-center mb-6 text-white">Bisca dos zé ruela</h1>
          {!isPlayerJoined && players.length < 4 && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-4">
              <div>
                <label htmlFor="playerName" className="block text-sm font-medium text-white mb-1 ">
                  Nome do jogador
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                  maxLength={20}
                />
              </div>
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="w-full bg-green-200 text-gray-700 py-2 rounded-lg hover:bg-green-400 disabled:opacity-70"
              >
                Entrar na sala
              </button>
            </form>
          )}


        </div>

        <div className="mb-6 w-2/4">
          <h2 className="text-lg font-semibold mb-3 text-white">Players ({players.length}/4):</h2>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div key={player.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="font-medium">
                  {index + 1}. {player.name}
                  {player.isRoomOwner && ' (Room Owner)'}
                </span>
                {player.id === currentPlayerId && (
                  <span className="text-sm text-blue-600">(You)</span>
                )}
              </div>
            ))}
            {Array.from({ length: 4 - players.length }).map((_, index) => (
              <div key={`empty-${index}`} className="p-3 bg-gray-50 rounded-lg text-gray-400">
                Aguardando jogador...
              </div>
            ))}
          </div>
        </div>



        {isPlayerJoined && (
          <div className="text-center text-gray-600">
            Waiting for other players to join...
          </div>
        )}

        {players.length === 4 && (
          <div className="text-center text-green-600 font-medium">
            All players have joined! Room owner will organize teams.
          </div>
        )}
      </div>
    </div>
  );
};