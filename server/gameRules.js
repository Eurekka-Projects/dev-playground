import { setTimeout } from 'timers/promises';

export const CARD_VIEW_TIME = 1000; // 60 seconds in milliseconds

export const canPlayCard = (card, gameState, playerId) => {
  const player = gameState.players.find(p => p.id === playerId);
  const isPlayerTurn = gameState.currentPlayer === playerId;
  
  if (!player || !isPlayerTurn) return false;

  // Get the leading card of the round
  const leadingCard = gameState.playedCards[0];
  
  // If no cards played yet, player can play any card except restrictions on trump Ace
  if (!leadingCard ) {
    // Check if trying to play trump Ace while trump 7 hasn't been played
    if (card.suit === gameState.trump.suit && card.value === 1) {
      const trump7Played = gameState.playedCardsHistory.some(
        c => c.suit === gameState.trump.suit && c.value === 7
      );
      if (!trump7Played) return false;
    }
    return true;
  }

  // Check if player is last to play
  const isLastPlayer = gameState.playedCards.length === 4;
  
  // Prevent playing trump 7 as last card
  if (isLastPlayer && card.suit === gameState.trump.suit && card.value === 7) {
    return false;
  }

 

  return true;
};

export const shouldShowTeammateCards = (gameState) => {
  // Show cards at game start
  if (gameState.roundNumber === 1 && !gameState.hasShownInitialCards) {
    return true;
  }
  
  // Show cards in third-to-last round
  const cardsRemaining = gameState.deck.length + 
    gameState.players.reduce((sum, p) => sum + p.hand.length, 0);
  return cardsRemaining === 12 && !gameState.hasShownAntepenultimateCards;
};

export const getTeammate = (playerId, gameState) => {
  const team = gameState.teams.team1.includes(playerId) ? gameState.teams.team1 : gameState.teams.team2;
  return team.find(id => id !== playerId);
};

export async function handleCardViewing(gameState, io) {
  if (shouldShowTeammateCards(gameState)) {
    // Set viewing state
    gameState.isViewingTeammateCards = true;
    io.emit('gameState', gameState);
    
    // Wait for 60 seconds
    await setTimeout(CARD_VIEW_TIME);
    
    // Update viewing state
    gameState.isViewingTeammateCards = false;
    if (gameState.roundNumber === 1) {
      gameState.hasShownInitialCards = true;
    } else {
      gameState.hasShownAntepenultimateCards = true;
    }
    
    io.emit('gameState', gameState);
  }
}