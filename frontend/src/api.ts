const BASE = 'http://localhost:8080'

export async function startGame(names?: string[]) {
  const res = await fetch(`${BASE}/start-game`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names }) })
  return res.json()
}

export async function playCard(playerId: string, cardId: string) {
  const res = await fetch(`${BASE}/play-card`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId, cardId }) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || JSON.stringify(err))
  }
  return res.json()
}

export async function drawCard(playerId: string) {
  const res = await fetch(`${BASE}/draw-card`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId }) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || JSON.stringify(err))
  }
  return res.json()
}

export async function callUno(playerId: string) {
  const res = await fetch(`${BASE}/uno`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId }) })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || JSON.stringify(err))
  }
  return res.json()
}

export async function getState() {
  const res = await fetch(`${BASE}/state`)
  return res.json()
}
