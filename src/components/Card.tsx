import React from 'react';
import { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isPlayable?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, isPlayable = true }) => {
  const getCardColor = () => {
    return card.color === 'red' ? 'text-red-600' : 'text-gray-800';
  };

  const getCardValue = (value: number) => {
    switch (value) {
      case 1: return 'A';
      case 11: return 'Q';
      case 12: return 'J';
      case 13: return 'K';
      default: return value.toString();
    }
  };

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`relative w-24 h-36 bg-white rounded-lg shadow-md border-2 
        ${isPlayable ? 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1' : 'cursor-not-allowed opacity-75'}
        ${getCardColor()}`}
    >
      <div className="absolute top-2 left-2">
        <div className="text-xl font-bold">{getCardValue(card.value)}</div>
        <div className="text-2xl">{getSuitSymbol(card.suit)}</div>
      </div>
      <div className="absolute bottom-2 right-2 transform rotate-180">
        <div className="text-xl font-bold">{getCardValue(card.value)}</div>
        <div className="text-2xl">{getSuitSymbol(card.suit)}</div>
      </div>
      {card.points > 0 && (
        <div className="absolute bottom-2 left-2 text-xs font-semibold text-gray-500">
          {card.points}pts
        </div>
      )}
    </div>
  );
};

const getSuitSymbol = (suit: string) => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '';
  }
};