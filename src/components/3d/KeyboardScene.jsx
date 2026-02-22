/**
 * KeyboardScene — Configurator 3D Canvas (v3 — Cinematic Reveal)
 *
 * ANIMATION:
 *   Phase 1 — "Distant Overview" (t=0 to t=0.5)
 *     Camera at z=22, y=2 — keyboard appears small, nearly flat (rotX≈0.15)
 *     Model starts rotated FLAT (rotX=0.15) — like a top-down product shot
 *
 *   Phase 2 — "Approach" (t=0.5 to t=3.0)
 *     Camera dollies in: z=22→8, y=2→6 with power3.out
 *     Model tilts to configured angle: rotX=0.15→0.55 (rises toward viewer)
 *     Emission strip fades in as it approaches
 *
 *   Phase 3 — "Active" (t≥3.0)
 *     Camera settles at final position
 *     OrbitControls enable with damping
 *     User can now drag, zoom, rotate freely
 *
 * FX:
 *   - Slow scale pulse on the model during approach (1.0→1.02→1.0)
 *   - Dramatic lighting with coloured point lights
 *   - NO mouse parallax (user needs precise clicking on keys)
 */
import { Suspense, useState, useCallback, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import KeyboardModel from './KeyboardModel'

// ─── Cinematic intro camera ────────────────────────────────────────────────────
function IntroCamera({ onComplete }) {
  const { camera } = useThree()
  const orbitRef    = useRef(null)   // receives orbitControls instance from parent via callback
  const elapsed     = useRef(0)
  const doneRef     = useRef(false)

  useEffect(() => {
    // Set start position immediately
    camera.position.set(0, 2, 22)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useFrame((_, delta) => {
    if (doneRef.current) return
    elapsed.current += delta
    const t = Math.min(elapsed.current, 3.0)

    // Ease: cubic out  (matches power3.out)
    const progress = t / 3.0
    const ease = 1 - Math.pow(1 - progress, 3)

    // Camera path: z: 22→8,  y: 2→6
    const targetZ = 22 + (8  - 22) * ease
    const targetY =  2 + (6  -  2) * ease

    camera.position.z = targetZ
    camera.position.y = targetY
    camera.position.x += (0 - camera.position.x) * 0.08   // snap to centre
    camera.lookAt(0, 0, 0)

    if (t >= 3.0 && !doneRef.current) {
      doneRef.current = true
      onComplete?.()
    }
  })
  return null
}

// ─── Model wrapper with rotation intro ────────────────────────────────────────
function AnimatedKeyboard() {
  const introRef = useRef()

  useEffect(() => {
    if (!introRef.current) return
    const obj = introRef.current

    // Start nearly flat, rise to final angle, then settle
    obj.rotation.x = 0.10
    obj.rotation.y = -0.20
    obj.scale.set(0.92, 0.92, 0.92)

    gsap.timeline()
      // Rise to configured angle with a slight swing
      .to(obj.rotation, { x: 0.55, y: 0.05, duration: 2.8, ease: 'power3.out' }, 0.4)
      // Float in from slightly below
      .from(obj.position, { y: -0.3, duration: 2.0, ease: 'power3.out' }, 0.3)
      // Scale up — keyboard "approaches" camera
      .to(obj.scale, { x: 1, y: 1, z: 1, duration: 2.6, ease: 'power3.out' }, 0.3)
      // Subtle landing bob
      .to(obj.rotation, { x: 0.52, duration: 0.14, ease: 'power2.in' }, 3.0)
      .to(obj.rotation, { x: 0.55, duration: 0.40, ease: 'elastic.out(1,0.4)' }, 3.14)
  }, [])

  return (
    <group ref={introRef}>
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
    // Small delay so the landing bob finishes before orbit activates
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
        <PerspectiveCamera makeDefault position={[0, 2, 22]} fov={50} />

        {/* Cinematic intro camera — hands off once done */}
        {!orbitEnabled && <IntroCamera onComplete={handleIntroDone} />}

        {/* ── Lighting — product reveal quality ── */}
        <ambientLight intensity={0.55} />
        {/* Main key light */}
        <directionalLight position={[8, 12, 6]} intensity={2.8} castShadow />
        {/* Fill */}
        <directionalLight position={[-6, 6, -4]} intensity={1.0} />
        {/* Top rim */}
        <directionalLight position={[0, 16, 0]}  intensity={0.8} />
        {/* Accent colours */}
        <pointLight position={[0, 6, -10]} intensity={1.2} color="#00ffcc" />
        <pointLight position={[-8, 2,  4]} intensity={0.7} color="#6644ff" />
        <pointLight position={[ 8, 0,  4]} intensity={0.5} color="#ffffff" />

        <Suspense fallback={null}>
          <AnimatedKeyboard />
          <Environment files="/hdr/studio-small.hdr" background={false} environmentIntensity={1.0} />
        </Suspense>

        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.35}
          scale={18}
          blur={3.5}
          far={5}
        />

        {/* OrbitControls activate only after intro completes */}
        {orbitEnabled && (
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            minDistance={4}
            maxDistance={18}
            maxPolarAngle={Math.PI / 1.8}
            target={[0, 0, 0]}
          />
        )}
      </Canvas>
    </div>
  )
}
