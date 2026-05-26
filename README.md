# UNO (pass-and-play) — Deno backend

This project contains a Deno-based backend for a local pass-and-play UNO game.

Run the server (requires Deno installed):

```bash
deno run --allow-net src/backend/server.ts
```

API endpoints:

- `POST /start-game` — optional JSON: `{ names: string[] }` returns initial game state
- `POST /play-card` — JSON: `{ playerId, cardId }`
- `POST /draw-card` — JSON: `{ playerId }`
- `POST /uno` — JSON: `{ playerId }`
- `GET /state` — get current game state

The frontend (React + Vite) is expected to run separately and call these endpoints.
