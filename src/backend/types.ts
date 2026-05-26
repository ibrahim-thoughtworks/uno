export type Color = 'red' | 'blue' | 'green' | 'yellow';

export interface Card {
  id: string;
  color: Color;
  value: number; // 0-9
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
}
