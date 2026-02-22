import { useState, Suspense, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CustomEnvironment from '../components/playground/CustomEnvironment'
import GenesisScene    from '../components/playground/GhostAssemblyScene'
import ResonanceScene  from '../components/playground/RGBRainScene'
import ShatterScene    from '../components/playground/VoidEmergenceScene'
import CascadeScene    from '../components/playground/CyberPulseScene'
import DescentScene    from '../components/playground/GravityDropScene'
import ChromeScene     from '../components/playground/LiquidChromeScene'

// ─── Animation catalog ─────────────────────────────────────────────────────
const ANIMATIONS = [
  {
    id:          'genesis',
    name:        'Genesis',
    tagline:     'Born from darkness',
    description: 'Keys materialise from total void — spinning down column by column with a coin-drop physics. Each key lands with a teal impact flash, then a gold scan-line sweeps across the fully assembled board. Loops continuously.',
    accent:      '#00d4ff',
    // Deep void: near-black with a cold cyan aurora at top-left
    gradient:    'radial-gradient(ellipse 80% 60% at 10% 0%, #001a2e 0%, #000408 55%, #000000 100%)',
    num:         '01',
    Scene:       GenesisScene,
  },
  {
    id:          'resonance',
    name:        'Resonance',
    tagline:     'Standing wave',
    description: 'Rows of keycaps ripple outward from the centre like a sonar pulse, rising and falling in a symmetric standing wave. Each row peaks with a gold emissive flash before settling. The pattern repeats symmetrically — inner rows first, outer rows last.',
    accent:      '#ffcc44',
    // Warm amber/gold haze — the gold wave radiating outward
    gradient:    'radial-gradient(ellipse 70% 55% at 50% 50%, #1a1100 0%, #0d0900 50%, #000000 100%)',
    num:         '02',
    Scene:       ResonanceScene,
  },
  {
    id:          'shatter',
    name:        'Shatter',
    tagline:     'Scatter & reform',
    description: 'All keycaps simultaneously explode outward in a radial burst with random 3-axis tumbling and a blinding white flash. They hang in scattered positions, then snap back in a single exponential rush — fully reformed.',
    accent:      '#ff44aa',
    // Hot pink/magenta burst from centre
    gradient:    'radial-gradient(ellipse 65% 65% at 50% 45%, #1a0010 0%, #0a0008 55%, #000000 100%)',
    num:         '03',
    Scene:       ShatterScene,
  },
  {
    id:          'cascade',
    name:        'Cascade',
    tagline:     'EMP shockwave',
    description: 'A left-to-right wave front sweeps the keyboard — each column of keys heaves upward as the wave hits, then snaps back with a trailing emissive glow. A focused spotlight tracks the wave as the camera tilts toward the advancing front.',
    accent:      '#00ffcc',
    // Teal/cyan lightning streak from left
    gradient:    'radial-gradient(ellipse 90% 50% at 0% 50%, #001a16 0%, #000d0a 55%, #000000 100%)',
    num:         '04',
    Scene:       CascadeScene,
  },
  {
    id:          'descent',
    name:        'Descent',
    tagline:     'Zero to grounded',
    description: 'Keycaps rain from high above in randomised order — each spinning like a falling coin. They land with realistic bounce physics and a brief orange impact flash. After the final key lands, the fully assembled board holds before the cycle restarts.',
    accent:      '#ff8800',
    // Warm amber overhead beam — like a warehouse ceiling flood light
    gradient:    'radial-gradient(ellipse 60% 70% at 50% 0%, #1a0e00 0%, #0a0600 50%, #000000 100%)',
    num:         '05',
    Scene:       DescentScene,
  },
  {
    id:          'chrome',
    name:        'Phantom Chrome',
    tagline:     'Layer by layer',
    description: 'An exploded engineering teardown — keycaps and weight peel apart first, revealing switches, PCB, plate, emission strips and case beneath. Each layer glows its material colour. Reassembly plays as a sandwich: inner layers click in first, then a left-to-right keycap wave closes the lid.',
    accent:      '#cc88ff',
    // Purple iridescent at bottom-right — premium product vibe
    gradient:    'radial-gradient(ellipse 70% 60% at 90% 100%, #100018 0%, #080010 55%, #000000 100%)',
    num:         '06',
    Scene:       ChromeScene,
  },
]

// ─── Scene Canvas ───────────────────────────────────────────────────────────
function SceneCanvas({ anim, onCreated }) {
  const Scene = anim.Scene
  return (
    <Canvas
      key={anim.id}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      shadows
      onCreated={onCreated}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <PerspectiveCamera makeDefault position={[0.8, 1.8, 5.5]} fov={52} near={0.1} far={100} />
      <CustomEnvironment />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <EffectComposer>
        <Bloom
          intensity={1.0}
          luminanceThreshold={0.80}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.08} darkness={0.80} />
      </EffectComposer>
    </Canvas>
  )
}

// ─── Nav dot ────────────────────────────────────────────────────────────────
function NavDot({ active, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: active ? 28 : 8,
        height: 8,
        borderRadius: 4,
        background: active ? accent : 'rgba(255,255,255,0.20)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        padding: 0,
      }}
    />
  )
}

// ─── Playground Page ────────────────────────────────────────────────────────
export default function PlaygroundPage() {
  const [idx, setIdx]         = useState(0)
  const [visible, setVisible] = useState(true)
  const anim                  = ANIMATIONS[idx]
  const timeoutRef            = useRef(null)

  const goTo = useCallback((next) => {
    setVisible(false)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIdx(next)
      setVisible(true)
    }, 220)
  }, [])

  const prev = () => goTo((idx - 1 + ANIMATIONS.length) % ANIMATIONS.length)
  const next = () => goTo((idx + 1) % ANIMATIONS.length)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx])

  const handleCreated = useCallback(({ gl }) => {
    gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, overflow: 'hidden',
      background: '#000',
    }}>
      {/* ── Per-scene gradient background ─────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: anim.gradient,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.55s ease, background 0.55s ease',
        zIndex: 0,
      }} />

      {/* ── 3D Canvas — full viewport ─────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <SceneCanvas anim={anim} onCreated={handleCreated} />
      </div>

      {/* ── Bottom info overlay ───────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        zIndex: 10, pointerEvents: 'none',
        // Gradient scrim so text is readable over the 3D scene
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.28) 60%, transparent 100%)',
        padding: '0 48px 36px',
        display: 'flex', flexDirection: 'column', gap: 0,
      }}>
        {/* Scene number + tagline */}
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: anim.accent,
          marginBottom: 10, opacity: visible ? 0.90 : 0,
          transform: `translateY(${visible ? 0 : 10}px)`,
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          textShadow: `0 0 20px ${anim.accent}60`,
        }}>
          {anim.num} / 06 · {anim.tagline}
        </div>

        {/* Scene name */}
        <h2 style={{
          fontSize: 'clamp(2.8rem, 6vw, 5rem)',
          fontWeight: 900, color: '#fff', margin: '0 0 14px',
          lineHeight: 0.95, letterSpacing: '-0.03em',
          textShadow: `0 0 80px ${anim.accent}50`,
          opacity: visible ? 1 : 0,
          transform: `translateY(${visible ? 0 : 14}px)`,
          transition: 'opacity 0.35s ease 0.05s, transform 0.35s ease 0.05s',
        }}>
          {anim.name}
        </h2>

        {/* Description */}
        <p style={{
          maxWidth: 520, fontSize: 14, lineHeight: 1.65,
          color: 'rgba(255,255,255,0.55)', margin: 0,
          opacity: visible ? 1 : 0,
          transform: `translateY(${visible ? 0 : 8}px)`,
          transition: 'opacity 0.35s ease 0.12s, transform 0.35s ease 0.12s',
        }}>
          {anim.description}
        </p>
      </div>

      {/* ── Dot nav — bottom center ──────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: 8, alignItems: 'center',
        zIndex: 20,
      }}>
        {ANIMATIONS.map((a, i) => (
          <NavDot
            key={a.id}
            active={i === idx}
            accent={anim.accent}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* ── Arrow navigation ─────────────────────────────────────── */}
      {[
        { dir: 'left',  fn: prev, Icon: ChevronLeft,  style: { left: 20 } },
        { dir: 'right', fn: next, Icon: ChevronRight, style: { right: 20 } },
      ].map(({ dir, fn, Icon, style: s }) => (
        <button
          key={dir}
          onClick={fn}
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            ...s,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 14, width: 52, height: 52,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'background 0.2s, box-shadow 0.2s',
            zIndex: 20,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${anim.accent}28`
            e.currentTarget.style.boxShadow  = `0 0 20px ${anim.accent}30`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.boxShadow  = 'none'
          }}
        >
          <Icon size={22} />
        </button>
      ))}

      {/* ── Scene switcher strip (top) ───────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 20,
        // Scrim from top
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)',
        padding: '16px 20px 28px',
        display: 'flex', gap: 8, overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {ANIMATIONS.map((a, i) => {
          const isActive = i === idx
          return (
            <button
              key={a.id}
              onClick={() => goTo(i)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: 10,
                border: `1px solid ${isActive ? a.accent + '80' : 'rgba(255,255,255,0.08)'}`,
                background: isActive ? `${a.accent}18` : 'rgba(0,0,0,0.30)',
                display: 'flex', flexDirection: 'column', gap: 2,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? `0 0 20px ${a.accent}28` : 'none',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: isActive ? a.accent : 'rgba(255,255,255,0.30)',
              }}>
                {a.num}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.50)',
              }}>
                {a.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Keyboard hint ────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 20, right: 24,
        fontSize: 11, color: 'rgba(255,255,255,0.22)',
        letterSpacing: '0.08em', zIndex: 20,
      }}>
        ← → to navigate · drag to orbit
      </div>
    </div>
  )
}
