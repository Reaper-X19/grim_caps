import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import useAssetLoader from '../../hooks/useAssetLoader'

// ─── Keycap SVG tile ────────────────────────────────────────────────────────
function Keycap({ index, active, lit, label }) {
  const delay = (index * 0.04).toFixed(2)
  return (
    <div
      className="keycap-tile"
      style={{ animationDelay: `${delay}s`, '--key-index': index }}
      data-active={active}
      data-lit={lit}
    >
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="keycap-svg">
        {/* Key body */}
        <rect x="2" y="2" width="36" height="36" rx="6" ry="6"
          className="key-body" />
        {/* Key top face (raised) */}
        <rect x="5" y="5" width="30" height="28" rx="4" ry="4"
          className="key-face" />
        {/* Key legend */}
        {label && (
          <text x="20" y="23" textAnchor="middle" className="key-label">
            {label}
          </text>
        )}
        {/* Glow overlay when lit */}
        <rect x="5" y="5" width="30" height="28" rx="4" ry="4"
          className="key-glow-layer" />
      </svg>
    </div>
  )
}

// ─── Key layout config ────────────────────────────────────────────────────────
const KEY_LABELS = [
  // Row 0: top function-style row
  ['ESC','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11'],
  // Row 1: number row
  ['~','1','2','3','4','5','6','7','8','9','0','-'],
  // Row 2: QWERTY
  ['Q','W','E','R','T','Y','U','I','O','P','[',']'],
  // Row 3: home row
  ['A','S','D','F','G','H','J','K','L',';',"'",'\\'],
  // Row 4: bottom
  ['Z','X','C','V','B','N','M',',','.','/',null,null],
]

// ─── Loading messages ─────────────────────────────────────────────────────────
const MESSAGES = [
  'INITIALIZING GRIM CAPS',
  'LOADING 3D ASSETS',
  'CALIBRATING KEYCAPS',
  'SYNCING LAYERS',
  'WARMING UP SHADERS',
  'READY',
]

export default function LoadingScreen({ onComplete }) {
  const overlayRef = useRef(null)
  const barFillRef = useRef(null)
  const percentRef = useRef(null)
  const messageRef = useRef(null)
  const gridRef = useRef(null)
  const exitingRef = useRef(false)

  const { progress, isLoaded } = useAssetLoader(2200)

  // Message cycling
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    // Advance message based on progress thresholds
    const thresholds = [0, 20, 45, 65, 82, 99]
    const newIndex = thresholds.findLastIndex(t => progress >= t)
    if (newIndex >= 0 && newIndex > messageIndex) {
      setMessageIndex(Math.min(newIndex, MESSAGES.length - 1))
    }
  }, [progress])

  // Lit key cascade driven by progress
  const totalKeys = KEY_LABELS.flat().length
  const litCount = Math.floor((progress / 100) * totalKeys)

  // Exit animation when loaded
  useEffect(() => {
    if (!isLoaded || exitingRef.current) return
    exitingRef.current = true

    const overlay = overlayRef.current
    if (!overlay) return

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete()
      }
    })

    // Flash all keycaps
    tl.to('.keycap-tile', {
      '--key-lit': 1,
      duration: 0.15,
      stagger: { amount: 0.3, from: 'start' },
      ease: 'none',
    })

    // Slam them all off in reverse
    tl.to('.keycap-tile', {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      stagger: { amount: 0.25, from: 'end' },
      ease: 'power2.in',
    }, '+=0.1')

    // Slide the entire overlay upward like a curtain
    tl.to(overlay, {
      yPercent: -105,
      duration: 0.7,
      ease: 'power4.inOut',
    }, '-=0.15')
  }, [isLoaded, onComplete])

  return (
    <div ref={overlayRef} className="loading-screen">
      {/* Scanline effect */}
      <div className="loading-scanline" />

      {/* Corner decorations */}
      <div className="loading-corner top-left" />
      <div className="loading-corner top-right" />
      <div className="loading-corner bottom-left" />
      <div className="loading-corner bottom-right" />

      {/* Brand mark */}
      <div className="loading-brand">
        <span className="loading-brand-grim">GRIM</span>
        <span className="loading-brand-caps">CAPS</span>
      </div>

      {/* Keyboard grid */}
      <div ref={gridRef} className="loading-keyboard-grid">
        {KEY_LABELS.map((row, ri) =>
          row.map((label, ci) => {
            const flatIndex = KEY_LABELS
              .slice(0, ri)
              .reduce((acc, r) => acc + r.length, 0) + ci
            return (
              <div key={`${ri}-${ci}`} className="loading-key-wrapper"
                style={{ gridColumn: ci + 1, gridRow: ri + 1 }}>
                <Keycap
                  index={flatIndex}
                  active={flatIndex <= litCount}
                  lit={flatIndex <= litCount}
                  label={label}
                />
              </div>
            )
          })
        )}
      </div>

      {/* Progress bar */}
      <div className="loading-bar-container">
        <div className="loading-bar-track">
          <div
            ref={barFillRef}
            className="loading-bar-fill"
            style={{ width: `${progress}%` }}
          />
          {/* Glowing head */}
          <div
            className="loading-bar-head"
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status row */}
      <div className="loading-status">
        <span ref={messageRef} className="loading-message">
          {MESSAGES[messageIndex]}
          <span className="loading-cursor">_</span>
        </span>
        <span ref={percentRef} className="loading-percent">
          {String(progress).padStart(3, '0')}%
        </span>
      </div>

      {/* Sub-label */}
      <div className="loading-sublabel">
        MECHANICAL KEYBOARD CUSTOMIZATION
      </div>
    </div>
  )
}
