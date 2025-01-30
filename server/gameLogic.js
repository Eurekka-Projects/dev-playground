export const createDeck = () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13]; // 11=Queen, 12=Jack, 13=King
  const points = {
    1: 11,  // Ace
    7: 10,  // Seven (manilha)
    13: 4,  // King
    12: 3,  // Jack
    11: 2,  // Queen
  };

  const deck = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        suit,
        value,
        points: points[value] || 0,
        color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black'
      });
    }
  }

  return shuffle(deck);
};

export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const dealCards = (deck, numPlayers) => {
  const hands = Array(numPlayers).fill([]).map(() => []);
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