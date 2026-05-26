import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { startGame, getState, playCard, drawCard, callUno } from './game.ts';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    if (url.pathname === '/start-game' && req.method === 'POST') {
      const body = req.body ? await req.json().catch(() => ({})) : {};
      const names = body.names as string[] | undefined;
      const s = startGame(names);
      return jsonResponse(s);
    }

    if (url.pathname === '/play-card' && req.method === 'POST') {
      const { playerId, cardId } = await req.json();
      const s = playCard(playerId, cardId);
      return jsonResponse(s);
    }

    if (url.pathname === '/draw-card' && req.method === 'POST') {
      const { playerId } = await req.json();
      const s = drawCard(playerId);
      return jsonResponse(s);
    }

    if (url.pathname === '/uno' && req.method === 'POST') {
      const { playerId } = await req.json();
      const s = callUno(playerId);
      return jsonResponse(s);
    }

    if (url.pathname === '/state' && req.method === 'GET') {
      const s = getState();
      return jsonResponse(s);
    }

    return new Response('Not Found', { status: 404 });
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: String(err.message ?? err) }, 400);
  }
}

console.log('Starting UNO server on http://localhost:8080');
serve(handler, { port: 8080 });
