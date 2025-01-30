import React, { useState } from 'react';
import { Users } from 'lucide-react';

interface TestPlayersProps {
  onJoinGame: (playerNames: string[]) => void;
  error: string;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
}

export const TestPlayers: React.FC<TestPlayersProps> = ({
  onJoinGame,
  error,
  connectionStatus,
}) => {
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoinGame(playerNames);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
      <div className="flex items-center justify-center mb-6">
        <Users className="w-12 h-12 text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-center mb-6">Test Mode - Add Players</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {connectionStatus === 'disconnected' && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg">
          Server connection lost. Please refresh the page.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {playerNames.map((name, index) => (
          <input
            key={index}
            type="text"
            value={name}
            onChange={(e) => handleNameChange(index, e.target.value)}
            placeholder={`Player ${index + 1} name`}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={connectionStatus !== 'connected'}
          />
        ))}
        
        <button
          type="submit"
          disabled={
            playerNames.some(name => !name.trim()) ||
            connectionStatus !== 'connected'
          }
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Start Game with Test Players
        </button>
      </form>
    </div>
  );
};