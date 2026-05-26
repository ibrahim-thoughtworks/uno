Act as a Senior Full-Stack TypeScript Engineer. Help me build a local multiplayer UNO game (single-client, pass-and-play style) using TypeScript for both the frontend and backend. 

The game starts with 3 players. All state is managed in-memory on the backend. The frontend will communicate with the backend via a REST API, and the UI will re-render based on the updated game state returned by the server.

## Tech Stack

### backend
  - js (deno)
  - express
### frontend
  - react

### 1. Data Models & Setup
**Card Structure:** Each card has an id, color ('blue', 'green', 'yellow', 'red'), and value (numbers 0-9). (Note: Special action cards like Skip/Reverse/Wild are excluded from this version).
**Deck Generation:** Create a standard deck consisting of two sets of 0-9 cards for each of the 4 colors.
**Game State:** Track players (array of 3 players with ids and their hand arrays), currentPlayerIndex, discardPile (array of cards), commonDeck (array of cards), hasCalledUno (boolean or map), and gameStatus ('waiting', 'playing', 'ended').

### 2. Backend API Routes

**POST /start-game**: 
    * Initializes the deck, shuffles it thoroughly.
    * Distributes 7 cards randomly to each of the 3 players.
    * Draws 1 card from the common deck to start the discardPile (must be a number card).
    * Sets currentPlayerIndex to 0.
    * Returns the initial game state.

**POST /play-card**:
    * Expects { playerId, cardId }. Validate it is that player's turn.
    * A card can only be played if its color or value matches the top card of the discardPile.
    * If valid: Move card from player's hand to the top of discardPile.
    * Check Win Condition: If player's hand length == 0, set gameStatus to 'ended' and declare them the winner.
    * Check UNO Penalty: If the player has 1 card left after playing and did not trigger /uno during their turn, enforce a penalty (e.g., automatically draw 2 cards).
    * Advance currentPlayerIndex to the next player. Return updated state.

**POST /draw-card**:
    * Expects { playerId }. Validate turn.
    * Pop a card from the commonDeck and add to the player's hand.
    * Deck Exhaustion Check: If commonDeck is empty or down to 1 card, take all cards from discardPile except the top card, shuffle them, and set them as the new commonDeck.
    * Advance currentPlayerIndex to the next player. Return updated state.

**POST /uno**:
    * Expects { playerId }. Registers that the current player has safely declared "UNO" for having 1 card left.

### 3. Frontend UI & Layout

**Layout Structure:**
    * Arrange the 3 players in a U-shape closer to the screen edges (e.g., Player 1 bottom, Player 2 left, Player 3 right).
    * Center of the screen displays the discardPile (top card face up) and the commonDeck (face down stack).
**Card Rendering:**
    * Use assets located in /assets/images/. Map card names dynamically to files (e.g., red_5.png).
    * **Fog of War:** Only show the card faces for the currentPlayerIndex. The other two players' cards must be rendered using the card back image.
**Interactions:**
    * Highlight the active player visually (e.g., a glowing border or badge).
    * Clicking a card in the current player's hand triggers /play-card.
    * Clicking the commonDeck pile triggers /draw-card.
    * Provide a prominent "UNO" button next to the active player's hand.

### 4. Animations & UX
**Game Start:** Animate cards dealing out sequentially from the center to each player.
**Play Card:** Animate the selected card sliding from the player's hand to the center discard pile.
**Draw Card:** Animate a card sliding from the center common deck to the active player's hand.
