import React from 'react';
import { Card as CardType } from '../types/game';
import { Card } from './Card';

interface PlayerHandProps {
  cards: CardType[];
  isCurrentPlayer: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameState: any;
  onCardPlay: (card: CardType) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ cards, isCurrentPlayer, onCardPlay, gameState }) => {
  
 // verificar se ja saiu o 7 pra deixar sair o As. 
 // verificar se a carta pode ser a ultima da rodada 

//  let canplay = gameState.playedCardsHistory.find() 


  return (
    <div className="flex gap-2 p-4">
      <div className="relative flex gap-2">
        {cards.map((card, index) => (
          <div
            key={`${card.suit}-${card.value}-${index}`}
            className={`transform transition-transform duration-200 hover:-translate-y-4 
              ${!isCurrentPlayer ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Card
              card={card}
              isPlayable={isCurrentPlayer}
              onClick={() => isCurrentPlayer && onCardPlay(card)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};