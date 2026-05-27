import { Card, Color, GameState, Player } from './types.ts';

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function colors(): Color[] {
  return ['red', 'blue', 'green', 'yellow'];
}

export function generateDeck(): Card[] {
  const deck: Card[] = [];
  for (const color of colors()) {
    for (let rep = 0; rep < 2; rep++) {
      for (let value = 0; value <= 9; value++) {
        deck.push({ id: uid(`${color}-${value}-`), color, value });
      }
      // add two of each action card per color
      deck.push({ id: uid(`${color}-plus2-`), color, value: 'plus2' })
      deck.push({ id: uid(`${color}-plus2-`), color, value: 'plus2' })
      deck.push({ id: uid(`${color}-reverse-`), color, value: 'reverse' })
      deck.push({ id: uid(`${color}-reverse-`), color, value: 'reverse' })
      deck.push({ id: uid(`${color}-skip-`), color, value: 'skip' })
      deck.push({ id: uid(`${color}-skip-`), color, value: 'skip' })
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let state: GameState | null = null;

export function getState(): GameState | null {
  return state ? JSON.parse(JSON.stringify(state)) : null;
}

function nextIndex(i: number, players: Player[], dir = 1) {
  const n = players.length;
  return ((i + dir) % n + n) % n;
}

export function startGame(names?: string[]): GameState {
  const deck = shuffle(generateDeck());
  const players: Player[] = [];
  const playerCount = 3;
  for (let i = 0; i < playerCount; i++) {
    players.push({ id: uid('p-'), name: names?.[i] ?? `Player ${i + 1}`, hand: [] });
  }

  // deal 7 cards each
  for (let r = 0; r < 7; r++) {
    for (const p of players) {
      const c = deck.pop();
      if (!c) throw new Error('Not enough cards to deal');
      p.hand.push(c);
    }
  }

  // start discard pile with one card
  const discard: Card[] = [];
  const first = deck.pop();
  if (!first) throw new Error('Deck exhausted');
  discard.push(first);

  state = {
    players,
    currentPlayerIndex: 0,
    discardPile: discard,
    commonDeck: deck,
    hasCalledUno: {},
    gameStatus: 'playing',
    winnerId: null,
    direction: 1,
  };

  // initialize UNO flags
  for (const p of players) state.hasCalledUno[p.id] = false;

  return getState()!;
}

function ensureState() {
  if (!state) throw new Error('Game not initialized');
}

export function playCard(playerId: string, cardId: string): GameState {
  ensureState();
  const s = state!;
  const player = s.players.find((p) => p.id === playerId);
  if (!player) throw new Error('Invalid player');
  if (s.players[s.currentPlayerIndex].id !== playerId) throw new Error('Not your turn');

  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) throw new Error('Card not in hand');

  const top = s.discardPile[s.discardPile.length - 1];
  const card = player.hand[cardIndex];
  if (!(card.color === top.color || card.value === top.value)) throw new Error('Card does not match');

  // play the card
  player.hand.splice(cardIndex, 1);
  s.discardPile.push(card);

  // Check win
  if (player.hand.length === 0) {
    s.gameStatus = 'ended';
    s.winnerId = player.id;
    return getState()!;
  }
  // Apply action cards and advance turn according to card effects
  const dir = s.direction || 1;
  if (card.value === 'reverse') {
    // flip direction, next player becomes previous in original order
    s.direction = -dir;
    s.currentPlayerIndex = nextIndex(s.currentPlayerIndex, s.players, s.direction);
  } else if (card.value === 'skip') {
    // skip next player: advance two steps
    s.currentPlayerIndex = nextIndex(nextIndex(s.currentPlayerIndex, s.players, dir), s.players, dir);
  } else if (card.value === 'plus2') {
    // next player draws two and is skipped
    const targetIdx = nextIndex(s.currentPlayerIndex, s.players, dir);
    replenishIfNeeded(s);
    for (let k = 0; k < 2; k++) {
      const drawn = s.commonDeck.pop();
      if (drawn) s.players[targetIdx].hand.push(drawn);
      else break;
    }
    // move to player after the one who drew
    s.currentPlayerIndex = nextIndex(targetIdx, s.players, dir);
  } else {
    // normal card: advance one step
    s.currentPlayerIndex = nextIndex(s.currentPlayerIndex, s.players, dir);
  }

  // reset UNO flag for the new current player
  const newPid = s.players[s.currentPlayerIndex].id;
  s.hasCalledUno[newPid] = false;

  return getState()!;
}

function replenishIfNeeded(s: GameState) {
  if (s.commonDeck.length <= 1) {
    // take all discard except top
    const top = s.discardPile.pop();
    if (!top) return;
    const others = s.discardPile.splice(0, s.discardPile.length);
    const reshuffled = shuffle(others);
    s.commonDeck.push(...reshuffled);
    // put back the top
    s.discardPile.push(top);
  }
}

export function drawCard(playerId: string): GameState {
  ensureState();
  const s = state!;
  if (s.players[s.currentPlayerIndex].id !== playerId) throw new Error('Not your turn');
  const player = s.players.find((p) => p.id === playerId)!;

  replenishIfNeeded(s);
  const card = s.commonDeck.pop();
  if (card) player.hand.push(card);

  // advance turn according to current direction
  s.currentPlayerIndex = nextIndex(s.currentPlayerIndex, s.players, s.direction || 1);
  const newPid = s.players[s.currentPlayerIndex].id;
  s.hasCalledUno[newPid] = false;

  return getState()!;
}

export function callUno(playerId: string): GameState {
  ensureState();
  const s = state!;
  if (s.players[s.currentPlayerIndex].id !== playerId) throw new Error('Not your turn');
  s.hasCalledUno[playerId] = true;
  return getState()!;
}
