import React from 'react';
import { GameState, Card as CardType } from '../types/game';
import { PlayerHand } from './PlayerHand';
import { Card } from './Card';

interface GameBoardProps {
  gameState: GameState;
  playerId: string;
  onCardPlay: (card: CardType) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, playerId, onCardPlay }) => {
  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isCurrentTurn = gameState.currentPlayer === playerId;

  if (!currentPlayer) return null;
  console.log(isCurrentTurn)

  const getTeamScore = (teamNumber: 1 | 2) => {
    return gameState.teamScores[`team${teamNumber}`];
  };

  const getPlayerTeam = (player: typeof gameState.players[0]) => {
    if (gameState.teams.team1.includes(player.id)) return 1;
    if (gameState.teams.team2.includes(player.id)) return 2;
    return null;
  };

  const getTeammate = () => {
    const team = getPlayerTeam(currentPlayer);
    if (!team) return null;
    const teammateid = gameState.teams[`team${team}`].find(id => id !== playerId);
    return gameState.players.find(p => p.id === teammateid);
  };

  const teammate = getTeammate();
  const currentTeam = getPlayerTeam(currentPlayer);

  return (
    <div className="min-h-screen bg-green-800 p-8">
      <div className="flex flex-col items-center gap-8">
        {/* Score Board */}
        <div className="bg-white rounded-lg p-4 shadow-lg fixed right-10">
          <h2 className="text-xl font-bold mb-2">Scores</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className={`${currentTeam === 1 ? 'font-bold' : ''}`}>
              <h3 className="text-blue-600">Dupla 1</h3>
              <p>{getTeamScore(1)} points</p>
            </div>
            <div className={`${currentTeam === 2 ? 'font-bold' : ''}`}>
              <h3 className="text-red-600">Dupla 2</h3>
              <p>{getTeamScore(2)} points</p>
            </div>
          </div>
        </div>

        {/* Current Turn Indicator */}
        <div className="bg-white px-4 py-2 rounded-full shadow-lg">
          {isCurrentTurn ? (
            <span className="text-green-600 font-bold">Joga ai, Zé!</span>
          ) : (
            <span className="text-gray-600">
              Vez de { gameState.players.find(p => p.id === gameState.currentPlayer)?.name}
            </span>
          )}
        </div>

        {/* Trump Card */}
        {gameState.trump && (
          <div className="flex flex-col items-center fixed left-10">
            <h3 className="text-white mb-2">Trunfo</h3>
            <Card card={gameState.trump} isPlayable={false} />
          </div>
        )}

        {/* Teammate's Cards (if viewing period) */}
        {gameState.isViewingTeammateCards && teammate && (
          <div className="flex flex-col items-center gap-2 fixed top-64 ">
            <h3 className="text-white">Jogo da sua dupla ({teammate.name})</h3>
            <div className="flex gap-2">
              {teammate.hand.map((card, index) => (
                <Card key={`${card.suit}-${card.value}-${index}`} card={card} isPlayable={false} />
              ))}
            </div>
          </div>
        )}

        {/* Played Cards */}
       { !gameState.isViewingTeammateCards &&  <div className="flex gap-4 justify-center min-h-[250px] min-w-[400px] bg-green-700 p-4 rounded-lg">
          {gameState.playedCards.map((card, index) => (
            <Card 
              key={`${card.suit}-${card.value}-${index}`} 
              card={card} 
              isPlayable={false} 
            />
          ))}
        </div> }

        {/* Player's Hand */}
        <div className="mt-auto">
          <PlayerHand
            gameState = {gameState}
            cards={currentPlayer.hand}
            isCurrentPlayer={isCurrentTurn}
            onCardPlay={onCardPlay}
          />
        </div>
      </div>
    </div>
  );
};