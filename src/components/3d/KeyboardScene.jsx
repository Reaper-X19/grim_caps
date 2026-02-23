/**
 * KeyboardScene — Configurator 3D Canvas (v4 — Clean Rebuild)
 *
 * ANIMATION DESIGN (single unified system, no stacking confusion):
 *
 * Camera path  (IntroCamera via useFrame):
 *   Start: position(0, 14, 20) — far away, high overhead
 *            → keyboard appears small and nearly FLAT (horizontal feel)
 *   End:   position(0,  6,  8) — standard comfortable view over 3.5s
 *            → power3.out easing
 *
 * Model tilt (GSAP on wrapRef inside AnimatedKeyboard):
 *   Start: wrapRef.rotation.x = +0.50  (adds to model's own -0.30 = net +0.20, nearly flat)
 *   End:   wrapRef.rotation.x =  0.00  (adds nothing, model rests at natural -0.30)
 *   Duration: 3.2s, ease power3.out — keyboard unfurls to face viewer
 *
 *   Combined rotX at start: 0.50 + (-0.30) = +0.20 rad  ≈ flat/overhead
 *   Combined rotX at end:   0.00 + (-0.30) = -0.30 rad  ≈ perfect config view
 *
 * OrbitControls activate 500ms after intro completes (no drag-during-animation)
 * Zoom disabled, pan disabled — rotation only
 */
import { Suspense, useState, useCallback, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import gsap from 'gsap'
import KeyboardModel from './KeyboardModel'

// ─── Camera dolly ─────────────────────────────────────────────────────────────
function IntroCamera({ onComplete }) {
  const { camera } = useThree()
  const elapsed   = useRef(0)
  const done      = useRef(false)
  const DURATION  = 3.5  // seconds

  useEffect(() => {
    camera.position.set(0, 14, 20)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame((_, delta) => {
    if (done.current) return
    elapsed.current = Math.min(elapsed.current + delta, DURATION)
    const t = elapsed.current / DURATION

    // power3.out
    const ease = 1 - Math.pow(1 - t, 3)

    camera.position.x =  0
    camera.position.y = 14 + (6  - 14) * ease   // 14 → 6
    camera.position.z = 20 + (8  - 20) * ease   // 20 → 8
    camera.lookAt(0, 0, 0)

    if (t >= 1 && !done.current) {
      done.current = true
      onComplete?.()
    }
  })
  return null
}

// ─── Keyboard with tilt animation ─────────────────────────────────────────────
function AnimatedKeyboard() {
  const wrapRef = useRef()

  useEffect(() => {
    if (!wrapRef.current) return

    // Start tilted forward so the combined rotation is nearly flat
    // (wrapRef +0.50) + (KeyboardModel's own -0.30) = +0.20 ≈ horizontal
    wrapRef.current.rotation.x = 0.50

    // Tween wrapRef back to 0 so keyboard ends at its natural angle (-0.30)
    gsap.to(wrapRef.current.rotation, {
      x: 0,
      duration: 3.2,
      delay: 0.2,          // tiny delay so camera starts moving first
      ease: 'power3.out',
    })
  }, [])

  return (
    <group ref={wrapRef}>
      <KeyboardModel />
    </group>
  )
}

// ─── Main scene ───────────────────────────────────────────────────────────────
export default function KeyboardScene() {
  const [canvasKey,    setCanvasKey]    = useState(0)
  const [orbitEnabled, setOrbitEnabled] = useState(false)

  const handleCreated = useCallback(({ gl }) => {
    const canvas = gl.domElement
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault() })
    canvas.addEventListener('webglcontextrestored', () => setCanvasKey(p => p + 1))
  }, [])

  const handleIntroDone = useCallback(() => {
    setTimeout(() => setOrbitEnabled(true), 500)
  }, [])

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Canvas
        key={canvasKey}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        onCreated={handleCreated}
      >
        <PerspectiveCamera makeDefault position={[0, 14, 20]} fov={50} />

        {!orbitEnabled && <IntroCamera onComplete={handleIntroDone} />}

        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 12, 6]}  intensity={2.8} castShadow />
        <directionalLight position={[-6, 6, -4]} intensity={1.0} />
        <directionalLight position={[0, 16, 0]}  intensity={0.8} />
        <pointLight position={[0, 6, -10]} intensity={1.0} color="#00ffcc" />
        <pointLight position={[-8, 2,  4]} intensity={0.6} color="#6644ff" />

        <Suspense fallback={null}>
          <AnimatedKeyboard />
          <Environment files="/hdr/studio-small.hdr" background={false} environmentIntensity={1.0} />
        </Suspense>

        <ContactShadows position={[0, -1, 0]} opacity={0.30} scale={18} blur={3} far={5} />

        {orbitEnabled && (
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.8}
            target={[0, 0, 0]}
          />
        )}
      </Canvas>
    </div>
  )
}
