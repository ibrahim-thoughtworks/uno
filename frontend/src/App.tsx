import React, { useEffect, useState } from 'react'
import { startGame, playCard, drawCard, callUno, getState } from './api'
import red0 from './assets/red_0.svg'
import red1 from './assets/red_1.svg'
import red2 from './assets/red_2.svg'
import red3 from './assets/red_3.svg'
import red4 from './assets/red_4.svg'
import red5 from './assets/red_5.svg'
import red6 from './assets/red_6.svg'
import red7 from './assets/red_7.svg'
import red8 from './assets/red_8.svg'
import red9 from './assets/red_9.svg'
import redPlus2 from './assets/red_+2.svg'
import redSkip from './assets/red_skip.svg'
import redReverse from './assets/red_reverse.svg'
import blue0 from './assets/blue_0.svg'
import blue1 from './assets/blue_1.svg'
import blue2 from './assets/blue_2.svg'
import blue3 from './assets/blue_3.svg'
import blue4 from './assets/blue_4.svg'
import blue5 from './assets/blue_5.svg'
import blue6 from './assets/blue_6.svg'
import blue7 from './assets/blue_7.svg'
import blue8 from './assets/blue_8.svg'
import blue9 from './assets/blue_9.svg'
import bluePlus2 from './assets/blue_+2.svg'
import blueSkip from './assets/blue_skip.svg'
import blueReverse from './assets/blue_reverse.svg'
import green0 from './assets/green_0.svg'
import green1 from './assets/green_1.svg'
import green2 from './assets/green_2.svg'
import green3 from './assets/green_3.svg'
import green4 from './assets/green_4.svg'
import green5 from './assets/green_5.svg'
import green6 from './assets/green_6.svg'
import green7 from './assets/green_7.svg'
import green8 from './assets/green_8.svg'
import green9 from './assets/green_9.svg'
import greenPlus2 from './assets/green_+2.svg'
import greenSkip from './assets/green_skip.svg'
import greenReverse from './assets/green_reverse.svg'
import yellow0 from './assets/yellow_0.svg'
import yellow1 from './assets/yellow_1.svg'
import yellow2 from './assets/yellow_2.svg'
import yellow3 from './assets/yellow_3.svg'
import yellow4 from './assets/yellow_4.svg'
import yellow5 from './assets/yellow_5.svg'
import yellow6 from './assets/yellow_6.svg'
import yellow7 from './assets/yellow_7.svg'
import yellow8 from './assets/yellow_8.svg'
import yellow9 from './assets/yellow_9.svg'
import yellowPlus2 from './assets/yellow_+2.svg'
import yellowSkip from './assets/yellow_skip.svg'
import yellowReverse from './assets/yellow_reverse.svg'

type Card = { id: string; color: string; value: number | string }

const cardAssets: Record<string, Record<number | string, string>> = {
  red: { 0: red0, 1: red1, 2: red2, 3: red3, 4: red4, 5: red5, 6: red6, 7: red7, 8: red8, 9: red9, plus2: redPlus2, skip: redSkip, reverse: redReverse },
  blue: { 0: blue0, 1: blue1, 2: blue2, 3: blue3, 4: blue4, 5: blue5, 6: blue6, 7: blue7, 8: blue8, 9: blue9, plus2: bluePlus2, skip: blueSkip, reverse: blueReverse },
  green: { 0: green0, 1: green1, 2: green2, 3: green3, 4: green4, 5: green5, 6: green6, 7: green7, 8: green8, 9: green9, plus2: greenPlus2, skip: greenSkip, reverse: greenReverse },
  yellow: { 0: yellow0, 1: yellow1, 2: yellow2, 3: yellow3, 4: yellow4, 5: yellow5, 6: yellow6, 7: yellow7, 8: yellow8, 9: yellow9, plus2: yellowPlus2, skip: yellowSkip, reverse: yellowReverse },
}

function getCardImage(card: Card): string {
  const valueKey = card.value === 'plus2' ? 'plus2' : card.value === 'skip' ? 'skip' : card.value === 'reverse' ? 'reverse' : card.value
  return cardAssets[card.color as keyof typeof cardAssets]?.[valueKey] || red0
}

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
  const imgSrc = getCardImage(c)
  return (
    <img src={imgSrc} alt={`${c.color} ${c.value}`} className="card-image" />
  )
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
          const imgSrc = hideHand ? undefined : getCardImage(c)
          return (
            <div
              key={c.id}
              className="card-wrapper"
              onClick={() => playable && onPlay && onPlay(c.id)}
              style={{
                cursor: playable ? 'pointer' : 'default',
                opacity: playable ? 1 : 0.9,
                zIndex: hand.length - i,
                '--card-index': String(hand.length - i),
              } as React.CSSProperties}
            >
              {hideHand ? (
                <div className="card back">
                  <div className="back-label">UNO</div>
                </div>
              ) : (
                <img src={imgSrc} alt={`${c.color} ${c.value}`} className="card-image" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
