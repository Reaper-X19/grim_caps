import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CustomEnvironment from '../components/playground/CustomEnvironment'
import GenesisScene from '../components/playground/GhostAssemblyScene'
import ResonanceScene from '../components/playground/RGBRainScene'
import ShatterScene from '../components/playground/VoidEmergenceScene'
import CascadeScene from '../components/playground/CyberPulseScene'
import DescentScene from '../components/playground/GravityDropScene'
import ChromeScene from '../components/playground/LiquidChromeScene'

// ─── Animation catalog ─────────────────────────────────────────────────────
const ANIMATIONS = [
  {
    id: 'genesis',
    name: 'Genesis',
    tagline: 'Born from darkness',
    description: 'Keys materialise from total void — spinning down column by column with a coin-drop physics. Each key lands with a teal impact flash, then a gold scan-line sweeps across the fully assembled board. Loops continuously.',
    accent: '#00F0FF',
    // Deep void: near-black with a cold purple aurora at top-left
    gradient: 'radial-gradient(ellipse 80% 60% at 10% 0%, #1a0225 0%, #030014 55%, #000000 100%)',
    num: '01',
    Scene: GenesisScene,
  },
  {
    id: 'resonance',
    name: 'Resonance',
    tagline: 'Standing wave',
    description: 'Rows of keycaps ripple outward from the centre like a sonar pulse, rising and falling in a symmetric standing wave. Each row peaks with a gold emissive flash before settling. The pattern repeats symmetrically — inner rows first, outer rows last.',
    accent: '#FFD600',
    // Warm amber/gold haze — the gold wave radiating outward
    gradient: 'radial-gradient(ellipse 70% 55% at 50% 50%, #1a1100 0%, #0d0900 50%, #000000 100%)',
    num: '02',
    Scene: ResonanceScene,
  },
  {
    id: 'shatter',
    name: 'Shatter',
    tagline: 'Scatter & reform',
    description: 'All keycaps simultaneously explode outward in a radial burst with random 3-axis tumbling and a blinding white flash. They hang in scattered positions, then snap back in a single exponential rush — fully reformed.',
    accent: '#FF0055',
    // Hot pink/magenta burst from centre
    gradient: 'radial-gradient(ellipse 65% 65% at 50% 45%, #1a0010 0%, #0a0008 55%, #000000 100%)',
    num: '03',
    Scene: ShatterScene,
  },
  {
    id: 'cascade',
    name: 'Cascade',
    tagline: 'EMP shockwave',
    description: 'A left-to-right wave front sweeps the keyboard — each column of keys heaves upward as the wave hits, then snaps back with a trailing emissive glow. A focused spotlight tracks the wave as the camera tilts toward the advancing front.',
    accent: '#B026FF',
    // Deep purple lightning streak from left
    gradient: 'radial-gradient(ellipse 90% 50% at 0% 50%, #2d004a 0%, #090518 55%, #000000 100%)',
    num: '04',
    Scene: CascadeScene,
  },
  {
    id: 'descent',
    name: 'Descent',
    tagline: 'Zero to grounded',
    description: 'Keycaps rain from high above in randomised order — each spinning like a falling coin. They land with realistic bounce physics and a brief orange impact flash. After the final key lands, the fully assembled board holds before the cycle restarts.',
    accent: '#FFD600',
    // Warm amber overhead beam — like a warehouse ceiling flood light
    gradient: 'radial-gradient(ellipse 60% 70% at 50% 0%, #1a0e00 0%, #0a0600 50%, #000000 100%)',
    num: '05',
    Scene: DescentScene,
  },
  {
    id: 'chrome',
    name: 'Phantom Chrome',
    tagline: 'Layer by layer',
    description: 'An exploded engineering teardown — keycaps and weight peel apart first, revealing switches, PCB, plate, emission strips and case beneath. Each layer glows its material colour. Reassembly plays as a sandwich: inner layers click in first, then a left-to-right keycap wave closes the lid.',
    accent: '#B026FF',
    // Purple iridescent at bottom-right — premium product vibe
    gradient: 'radial-gradient(ellipse 70% 60% at 90% 100%, #100018 0%, #080010 55%, #000000 100%)',
    num: '06',
    Scene: ChromeScene,
  },
]

// ─── Scene Canvas ───────────────────────────────────────────────────────────
function SceneCanvas({ anim, onCreated }) {
  const Scene = anim.Scene
  const [isPortrait, setIsPortrait] = useState(window.innerWidth < window.innerHeight)

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerWidth < window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const camPos = isPortrait ? [1.2, 2.5, 8.0] : [0.8, 1.8, 5.5]
  const camFov = isPortrait ? 60 : 52

  return (
    <Canvas
      key={anim.id}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      onCreated={onCreated}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <PerspectiveCamera makeDefault position={camPos} fov={camFov} near={0.1} far={100} />
      <CustomEnvironment />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  )
}

// ─── UI: Info Overlay ───────────────────────────────────────────────────────
function InfoOverlay({ anim, visible }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      zIndex: 10, pointerEvents: 'none',
      // Gradient scrim so text is readable over the 3D scene
      background: 'linear-gradient(to top, rgba(3,0,20,0.95) 0%, rgba(3,0,20,0.4) 50%, transparent 100%)',
      padding: 'clamp(20px, 5vw, 48px) clamp(20px, 6vw, 60px)',
      display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      {/* Scene number + tagline */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{
            fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 900,
            color: anim.accent, letterSpacing: '0.2em'
          }}>
            PHASE_{anim.num}
          </span>
          <div style={{ height: 1, width: 40, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{
            fontFamily: 'Orbitron', fontSize: '0.75rem', fontWeight: 600,
            color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em'
          }}>
            {anim.tagline}
          </span>
        </div>

        {/* Animation Name */}
        <h1 style={{
          fontFamily: 'Orbitron', fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 900,
          color: '#fff', textTransform: 'uppercase', lineHeight: 0.9, margin: '0 0 20px -4px',
          letterSpacing: '-0.02em', fontStyle: 'italic'
        }}>
          {anim.name}
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: 'Inter', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)',
          maxWidth: 500, lineHeight: 1.6, margin: 0
        }}>
          {anim.description}
        </p>
      </div>
    </div>
  )
}

// ─── Playground Page ────────────────────────────────────────────────────────
export default function PlaygroundPage() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const anim = ANIMATIONS[idx]
  const timeoutRef = useRef(null)

  const goTo = useCallback((next) => {
    setVisible(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIdx(next)
      setVisible(true)
    }, 400)
  }, [])

  const next = () => goTo((idx + 1) % ANIMATIONS.length)
  const prev = () => goTo((idx - 1 + ANIMATIONS.length) % ANIMATIONS.length)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx])

  return (
    <div style={{
      position: 'fixed', inset: 0, overflow: 'hidden',
      background: '#000',
      zIndex: 5,
    }}>
      {/* ── Per-scene gradient background ─────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: anim.gradient,
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s ease-in-out',
      }} />

      {/* ── 3D Scene ─────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(1.05)',
        filter: visible ? 'blur(0px)' : 'blur(20px)',
        transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <SceneCanvas anim={anim} />
      </div>

      {/* ── UI Overlay ───────────────────────────────────────────── */}
      <InfoOverlay anim={anim} visible={visible} />

      {/* ── Arrow navigation ─────────────────────────────────────── */}
      {[
        { dir: 'left', fn: prev, Icon: ChevronLeft, style: { left: 20 } },
        { dir: 'right', fn: next, Icon: ChevronRight, style: { right: 20 } },
      ].map(({ dir, fn, Icon, style: s }) => (
        <button
          key={dir}
          onClick={fn}
          style={{
            position: 'absolute', top: '50%', ...s,
            transform: 'translateY(-50%)',
            zIndex: 20,
            width: 50, height: 50,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyCenter: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: 0,
            justifyContent: 'center',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${anim.accent}28`
            e.currentTarget.style.boxShadow = `0 0 20px ${anim.accent}30`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <Icon size={22} />
        </button>
      ))}

      {/* ── Progress dots ────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 100, right: 48,
        zIndex: 20, display: 'flex', flexDirection: 'column', gap: 12
      }}>
        {ANIMATIONS.map((a, i) => (
          <button
            key={a.id}
            onClick={() => goTo(i)}
            style={{
              width: 4, height: i === idx ? 24 : 4,
              borderRadius: 2,
              background: i === idx ? anim.accent : 'rgba(255,255,255,0.2)',
              border: 'none', padding: 0, cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
