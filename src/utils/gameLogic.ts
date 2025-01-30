import { Card, Player } from '../types/game';

export const createDeck = (): Card[] => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
  const points = {
    1: 11,
    7: 10,
    10: 2,
    11: 3,
    12: 4,
  };

  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        suit: suit as Card['suit'],
        value,
        points: points[value as keyof typeof points] || 0,
      });
    }
  }

  return shuffle(deck);
};

export const shuffle = (array: any[]): any[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const dealCards = (deck: Card[], numPlayers: number): { hands: Card[][], remainingDeck: Card[] } => {
  const hands: Card[][] = Array(numPlayers).fill([]).map(() => []);
  const remainingDeck = [...deck];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < numPlayers; j++) {
      const card = remainingDeck.pop();
      if (card) {
        hands[j] = [...hands[j], card];
      }
    }
  }

  return { hands, remainingDeck };
};