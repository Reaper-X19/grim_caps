/**
 * KeyboardScene — Configurator 3D Canvas (v2)
 *
 * ANIMATION:
 *   • Cinematic intro: camera starts far (z=18, y=8) and dolly-drifts to
 *     final position (z=8, y=6) over 2.5s with power3.out — keyboard
 *     appears to "materialize" as the camera settles
 *   • Auto-orbit: gentle slow Y-orbit (±15° swing, period 12s) after intro
 *   • Mouse parallax: subtle X/Y drift based on cursor position
 *   • OrbitControls REMOVED — user interacts via clicking keys, not dragging
 */
import { Suspense, useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import KeyboardModel from './KeyboardModel'

// ─── Animated Camera Rig ──────────────────────────────────────────────────────
function CameraRig({ mouse }) {
  const elapsed  = useRef(0)
  const introDone = useRef(false)

  // Intro: from (0, 8, 18) → (0, 6, 8) over 2.5s
  const startPos = useRef({ x: 0, y: 8, z: 18 })
  const targetPos = { x: 0, y: 6, z: 8 }

  useFrame(({ camera }, delta) => {
    elapsed.current += delta
    const t = Math.min(elapsed.current / 2.5, 1)   // 0→1 over 2.5s

    // power3.out easing
    const ease = 1 - Math.pow(1 - t, 3)

    const mx = mouse?.current?.x ?? 0
    const my = mouse?.current?.y ?? 0

    // Intro lerp
    const baseX = startPos.current.x + (targetPos.x - startPos.current.x) * ease
    const baseY = startPos.current.y + (targetPos.y - startPos.current.y) * ease
    const baseZ = startPos.current.z + (targetPos.z - startPos.current.z) * ease

    // Auto-orbit (after intro settles)
    const orbitPhase = Math.max(0, elapsed.current - 2.5)
    const orbitX = Math.sin(orbitPhase * 0.22) * 1.8

    // Mouse parallax
    const mouseX = mx * 1.2
    const mouseY = my * 0.5

    camera.position.x += (baseX + orbitX + mouseX - camera.position.x) * 0.032
    camera.position.y += (baseY + mouseY - camera.position.y) * 0.032
    camera.position.z += (baseZ - camera.position.z) * 0.032
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ─── Scene ────────────────────────────────────────────────────────────────────
export default function KeyboardScene() {
  const [canvasKey, setCanvasKey] = useState(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  const handleCreated = useCallback(({ gl }) => {
    const canvas = gl.domElement
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault() })
    canvas.addEventListener('webglcontextrestored', () => setCanvasKey(p => p + 1))
  }, [])

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,   // -1 to +1
      y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
    }
  }, [])

  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <Canvas
        key={canvasKey}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        onCreated={handleCreated}
      >
        <PerspectiveCamera makeDefault position={[0, 8, 18]} fov={50} />

        {/* Cinematic intro + auto-orbit + mouse parallax  */}
        <CameraRig mouse={mouseRef} />

        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={2.5} />
        <directionalLight position={[-5, 8, -5]} intensity={1.2} />
        <directionalLight position={[0, 15, 0]}  intensity={1.0} />
        <pointLight position={[0, 8, -10]} intensity={0.8} color="#00ffcc" />

        <Suspense fallback={null}>
          <KeyboardModel />
          <Environment files="/hdr/studio-small.hdr" background={false} environmentIntensity={1.0} />
        </Suspense>

        <ContactShadows position={[0, -1, 0]} opacity={0.25} scale={15} blur={3} far={4} />
      </Canvas>
    </div>
  )
}
