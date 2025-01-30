export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number;
  points: number;
  color: 'red' | 'black';
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  team?: 1 | 2;
  isRoomOwner?: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayer: string | null;
  trump: Card | null;
  deck: Card[];
  playedCards: Card[];
  playedCardsHistory: Card[];
  winner: string | null;
  status: 'waiting' | 'team-selection' | 'playing' | 'finished';
  teams: {
    team1: string[];
    team2: string[];
  };
  roomOwner: string | null;
  roundNumber: number;
  hasShownInitialCards: boolean;
  hasShownAntepenultimateCards: boolean;
  isViewingTeammateCards: boolean;
  teamScores: {
    team1: number;
    team2: number;
  };
}