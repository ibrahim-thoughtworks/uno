export type Color = 'red' | 'blue' | 'green' | 'yellow';

export interface Card {
  id: string;
  color: Color;
  // numbers 0-9 or action strings: 'plus2', 'reverse', 'skip'
  value: number | 'plus2' | 'reverse' | 'skip';
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
}

export type GameStatus = 'waiting' | 'playing' | 'ended';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  discardPile: Card[];
  commonDeck: Card[];
  hasCalledUno: Record<string, boolean>;
  gameStatus: GameStatus;
  winnerId?: string | null;
  // 1 for forward, -1 for reverse
  direction: number;
}
