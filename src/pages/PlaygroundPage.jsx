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

// ─── Animation catalog ────────────────────────────────────────────────
const ANIMATIONS = [
  {
    id: 'genesis',
    name: 'Genesis',
    tagline: 'Born from darkness',
    description: 'The keyboard assembles itself — key by key — from pure void. A column-by-column reveal with cinematic lighting and a camera that slowly pulls back to expose the full build.',
    accent: '#00d4ff',
    num: '01',
    Scene: GenesisScene,
  },
  {
    id: 'resonance',
    name: 'Resonance',
    tagline: 'Sound-wave physics',
    description: 'Two overlapping sine waves create a standing-wave interference pattern. Every keycap becomes a pixel in a living, breathing waveform.',
    accent: '#00ff88',
    num: '02',
    Scene: ResonanceScene,
  },
  {
    id: 'shatter',
    name: 'Shatter',
    tagline: 'Scatter & Reform',
    description: 'All 87 keycaps simultaneously explode outward in a radial burst, hold in position for a dramatic beat, then snap back with an exponential rush.',
    accent: '#ff44aa',
    num: '03',
    Scene: ShatterScene,
  },
  {
    id: 'cascade',
    name: 'Cascade',
    tagline: 'EMP shockwave',
    description: 'A physical wave front travels left to right — each column of keys lifts as the wave hits and snaps back with exponential damping. Camera orbits for a 360° showcase.',
    accent: '#00ffcc',
    num: '04',
    Scene: CascadeScene,
  },
  {
    id: 'descent',
    name: 'Descent',
    tagline: 'Zero to grounded',
    description: 'Keycaps rain from above in randomised order, each landing with realistic bounce physics and a brief impact flash. Shot from a low dramatic angle.',
    accent: '#ff8800',
    num: '05',
    Scene: DescentScene,
  },
  {
    id: 'chrome',
    name: 'Phantom Chrome',
    tagline: 'Material metamorphosis',
    description: 'The keyboard spins through a full 360° product reveal while the surface morphs from matte black → titanium → mirror chrome → iridescent violet. Orbiting rim lights create dramatic reflections.',
    accent: '#cc88ff',
    num: '06',
    Scene: ChromeScene,
  },
]

// ─── Fullscreen Scene Viewer ──────────────────────────────────────────
function SceneCanvas({ anim, onCreated }) {
  const Scene = anim.Scene
  return (
    <Canvas
      key={anim.id}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      shadows
      onCreated={onCreated}
      style={{ width: '100%', height: '100%', background: '#000' }}
    >
      <PerspectiveCamera makeDefault position={[0.8, 1.8, 5.5]} fov={52} near={0.1} far={100} />
      <CustomEnvironment />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.1} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  )
}

// ─── Navigation dot ──────────────────────────────────────────────────
function NavDot({ active, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: active ? 28 : 8,
        height: 8,
        borderRadius: 4,
        background: active ? accent : 'rgba(255,255,255,0.25)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        padding: 0,
      }}
    />
  )
}

// ─── Playground Page ─────────────────────────────────────────────────
export default function PlaygroundPage() {
  const [idx, setIdx]       = useState(0)
  const [visible, setVisible] = useState(true)
  const anim                = ANIMATIONS[idx]
  const timeoutRef          = useRef(null)

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

  // Keyboard navigation
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
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>

      {/* ── Immersive 3D Canvas Section ──────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: '80vh', overflow: 'hidden', flexShrink: 0 }}>
        <SceneCanvas anim={anim} onCreated={handleCreated} />

        {/* Accent colour ambient glow on top-left */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: 400, height: 400, pointerEvents: 'none',
          background: `radial-gradient(circle, ${anim.accent}14 0%, transparent 70%)`,
          transition: 'background 0.6s ease',
        }} />

        {/* Animation info — bottom-left overlay */}
        <div style={{
          position: 'absolute', bottom: 40, left: 48,
          opacity: visible ? 1 : 0,
          transform: `translateY(${visible ? 0 : 12}px)`,
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: anim.accent, marginBottom: 8, opacity: 0.85,
          }}>
            {anim.num} / 06 · {anim.tagline}
          </div>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 900, color: '#fff', margin: 0,
            lineHeight: 1, letterSpacing: '-0.02em',
            textShadow: `0 0 60px ${anim.accent}40`,
          }}>
            {anim.name}
          </h2>
        </div>

        {/* Arrow navigation — sides */}
        <button
          onClick={prev}
          style={{
            position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 12, width: 48, height: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${anim.accent}25`}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          style={{
            position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 12, width: 48, height: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${anim.accent}25`}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          <ChevronRight size={20} />
        </button>

        {/* Dot navigation — bottom center */}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 8, alignItems: 'center',
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

        {/* Keyboard navigation hint */}
        <div style={{
          position: 'absolute', bottom: 16, right: 24,
          fontSize: 11, color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.08em',
        }}>
          ← → to navigate · drag to orbit
        </div>
      </div>

      {/* ── Description + Animation Switcher Strip ───────────────── */}
      <div style={{
        flex: 1, padding: '32px 48px 40px',
        background: 'linear-gradient(180deg, #040408 0%, #080810 100%)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        {/* Description text */}
        <p style={{
          maxWidth: 580, fontSize: 15, lineHeight: 1.7,
          color: 'rgba(255,255,255,0.50)',
          marginBottom: 32,
          opacity: visible ? 1 : 0,
          transform: `translateY(${visible ? 0 : 6}px)`,
          transition: 'opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s',
        }}>
          {anim.description}
        </p>

        {/* Scene switcher — horizontal scroll cards */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {ANIMATIONS.map((a, i) => {
            const isActive = i === idx
            return (
              <button
                key={a.id}
                onClick={() => goTo(i)}
                style={{
                  flexShrink: 0,
                  padding: '12px 20px',
                  borderRadius: 12,
                  border: `1px solid ${isActive ? a.accent : 'rgba(255,255,255,0.06)'}`,
                  background: isActive ? `${a.accent}14` : 'rgba(255,255,255,0.02)',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? `0 0 24px ${a.accent}20` : 'none',
                }}
              >
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isActive ? a.accent : 'rgba(255,255,255,0.35)',
                }}>
                  {a.num}
                </span>
                <span style={{
                  fontSize: 14, fontWeight: 700,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                }}>
                  {a.name}
                </span>
                <span style={{
                  fontSize: 11,
                  color: isActive ? a.accent : 'rgba(255,255,255,0.28)',
                  opacity: 0.8,
                }}>
                  {a.tagline}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
