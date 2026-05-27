import React, { useEffect, useState } from 'react'
import { startGame, playCard, drawCard, callUno, getState } from './api'

type Card = { id: string; color: string; value: number | string }

export default function App() {
  const [state, setState] = useState<any>(null)
  const [playerNames, setPlayerNames] = useState(['', '', ''])

  useEffect(() => {
    // try to fetch existing state
    getState().then((s) => setState(s))
  }, [])

  const handleStart = async () => {
    const names = playerNames.map((n, i) => n || `Player ${i + 1}`)
    const s = await startGame(names)
    setState(s)
  }

  if (!state) {
    return (
      <div className="setup">
        <h2>Start UNO (3 players)</h2>
        {playerNames.map((v, i) => (
          <input key={i} placeholder={`Player ${i + 1} name`} value={v} onChange={(e) => { const p = [...playerNames]; p[i] = e.target.value; setPlayerNames(p) }} />
        ))}
        <button onClick={handleStart}>Start Game</button>
      </div>
    )
  }

  const players = state?.players ?? []
  const cp = typeof state?.currentPlayerIndex === 'number' ? state.currentPlayerIndex : 0
  const topCard = state?.discardPile?.[state.discardPile.length - 1]
  const isGameEnded = state?.gameStatus === 'ended'
  const winnerName = isGameEnded ? players.find((p: any) => p.id === state.winnerId)?.name : null

  const onPlay = async (cardId: string) => {
    if (isGameEnded) return
    try {
      const s = await playCard(state.players[cp].id, cardId)
      setState(s)
    } catch (err: any) {
      alert(err.message || String(err))
    }
  }

  const onDraw = async () => {
    if (isGameEnded) return
    const s = await drawCard(state.players[cp].id)
    setState(s)
  }

  const onUno = async () => {
    if (isGameEnded) return
    const s = await callUno(state.players[cp].id)
    setState(s)
  }

  const resetGame = () => {
    setState(null)
  }

  return (
    <div className="board">
      {isGameEnded && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{winnerName ? `${winnerName} wins!` : 'Game over'}</h2>
            <p>The game has ended. Start a new game from player names.</p>
            <button onClick={resetGame}>New Game</button>
          </div>
        </div>
      )}
      <div className="left-column">
        <PlayerArea position="left" player={players[1]} hideHand={cp !== 1} active={cp === 1} onPlay={onPlay} topCard={topCard} />
      </div>

      <div className="center-column">
        <div className="center-stack">
          <div className="deck" onClick={onDraw} title="Draw card">Deck</div>
          <div className="discard">{renderCard(state.discardPile?.[state.discardPile.length - 1])}</div>
        </div>
        <div className="controls center-controls">
          <button onClick={onUno}>UNO</button>
        </div>
      </div>

      <div className="right-column">
        <PlayerArea position="right" player={players[2]} hideHand={cp !== 2} active={cp === 2} onPlay={onPlay} topCard={topCard} />
      </div>

      <div className="bottom-row">
        <PlayerArea position="bottom" player={players[0]} hideHand={cp !== 0} active={cp === 0} onPlay={onPlay} topCard={topCard} />
      </div>
    </div>
  )
}

function renderCard(c: Card | undefined) {
  if (!c) return <div className="card back" />
  return (
    <div className={`card ${c.color}`}>{displayValue(c.value)}</div>
  )
}

function displayValue(v: any) {
  if (v === 'plus2') return '+2'
  if (v === 'reverse') return '↺'
  if (v === 'skip') return '⏭'
  return String(v)
}

function PlayerArea({ position = 'bottom', player, hideHand, active, onPlay, topCard }: any) {
  const name = player?.name ?? '—'
  const hand: Card[] = Array.isArray(player?.hand) ? player.hand : []
  return (
    <div className={`player-area ${position} ${active ? 'active' : ''}`}>
      <div className="player-name">{name}</div>
      <div className="hand">
        {hand.map((c: Card, i: number) => {
          const playable = !hideHand && (!topCard || c.color === topCard.color || c.value === topCard.value)
          return (
            <div
              key={c.id}
              className={`card ${hideHand ? 'back' : c.color}`}
              onClick={() => playable && onPlay && onPlay(c.id)}
              style={{
                cursor: playable ? 'pointer' : 'default',
                opacity: playable ? 1 : 0.9,
                zIndex: hand.length - i,
                '--card-index': String(hand.length - i),
              } as React.CSSProperties}
            >
              {!hideHand ? displayValue(c.value) : <div className="back-label">UNO</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
