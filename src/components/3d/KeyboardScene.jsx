/**
 * KeyboardScene — Model Reveal Animation
 *
 * The keyboard animates from Image2 values → Image1 values (user-provided).
 * Camera is FIXED. Only the model moves.
 *
 * Technique: an outer <group> (IntroWrapper) starts at the DELTA between
 * Image2 and Image1 transforms, then GSAP tweens it to identity.
 * Since KeyboardModel (inner) is set to Image1 defaults, the combined
 * transform produces Image2 at t=0 and Image1 at t=end.
 *
 * Math (outer scale s, inner position p_inner):
 *   world_pos = outer_pos + s * p_inner
 *   At t=0: outer_pos = Image2_pos - s * p_inner_Image1
 *   At t=end: outer_pos = [0,0,0], s = 1 → world_pos = Image1_pos
 *
 * OrbitControls target = Image1 world position (keyboard final center).
 *
 * CRITICAL: `introComplete` is passed to KeyboardModel so that shader/texture
 * logic waits until the GSAP animation finishes. This prevents bounding-box
 * calculations from using mid-tween matrixWorld values, which would produce
 * wrong UV mappings for the keycap shader.
 */
import { Suspense, useRef, useEffect, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  ContactShadows,
} from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import KeyboardModel from './KeyboardModel'

// ─── Image1: FINAL Three.js values ────────────────────────────────────────────
// (Leva posY=0.61 → Three.js Z; Leva posZ=-1.0 → Three.js Y)
const FINAL = { px: 0, py: -0.5, pz: 0.61, rx: 0.30, ry: 0, rz: 0, s: 27 }

// ─── Image2: START Three.js values ────────────────────────────────────────────
// (Leva posY=-5.0 → Three.js Z; Leva posZ=-3.4 → Three.js Y)
const START = { px: 0, py: -3.4, pz: -5.0, rx: -0.5, ry: 0.01, rz: 0, s: 7.4 }

// ─── Outer wrapper START values ────────────────────────────────────────────────
// scale_wrap = START.s / FINAL.s so that (scale_wrap * FINAL.s) = START.s
// pos_wrap = START.pos - scale_wrap * FINAL.pos  so that (pos_wrap + scale_wrap * FINAL.pos) = START.pos
// rotX_wrap = START.rx - FINAL.rx (additive for X-dominant rotations)
const SW = START.s / FINAL.s // 7.4 / 30.5 ≈ 0.2426
const WRAP = {
  px: START.px - SW * FINAL.px, // 0
  py: START.py - SW * FINAL.py, // -3.4 - (0.2426 * -2.5) = -2.793
  pz: START.pz - SW * FINAL.pz, // -5.0 - (0.2426 * 0.61) = -5.148
  rx: START.rx - FINAL.rx,      // -0.5 - 0.30 = -0.80
  ry: 0, rz: 0, s: SW,
}

// ─── IntroWrapper ─────────────────────────────────────────────────────────────
// Outer group with NO JSX transform props — only GSAP writes to it.
// Starts at WRAP values, tweens to identity. KeyboardModel (inner) holds
// Image1 Leva defaults permanently.
function IntroWrapper({ onComplete }) {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) return
    const g = ref.current

    // Set start state
    g.position.set(WRAP.px, WRAP.py, WRAP.pz)
    g.rotation.set(WRAP.rx, WRAP.ry, WRAP.rz)
    g.scale.setScalar(WRAP.s)

    // ── GSAP timeline: WRAP → identity ────────────────────────────────────
    const tl = gsap.timeline({
      onComplete: () => {
        // Signal that animation is done — matrixWorld is now stable
        if (onComplete) onComplete()
      }
    })

    // Position float-in: 3.6s, power4.out (explosive start, feather end)
    tl.to(g.position, { x: 0, y: 0, z: 0, duration: 3.6, ease: 'power4.out' }, 0)

    // Rotation settle: 3.2s, power3.out
    tl.to(g.rotation, { x: 0, y: 0, z: 0, duration: 3.2, ease: 'power3.out' }, 0)

    // Scale snap-in: 2.8s, power4.out — keyboard "grows" toward camera
    tl.to(g.scale, { x: 1, y: 1, z: 1, duration: 2.8, ease: 'power4.out' }, 0.15)

    return () => { tl.kill() }
  }, [onComplete])

  // No position/rotation/scale JSX props → React won't override GSAP values
  return (
    <group ref={ref}>
      <KeyboardModel introComplete={false} />
    </group>
  )
}

// ─── AnimatedKeyboard ─────────────────────────────────────────────────────────
// Workflow: textures apply invisibly → gentle reveal animation plays.
// The keyboard starts slightly below and scaled down, then smoothly rises
// to its final position. No extreme off-screen positions that could flash.
function AnimatedKeyboard() {
  const ref = useRef()
  const tlRef = useRef(null)
  const [textureReady, setTextureReady] = useState(false)
  const animStartedRef = useRef(false)

  const handleTextureReady = useCallback(() => {
    setTextureReady(true)
  }, [])

  // Gentle reveal after textures are applied
  useEffect(() => {
    if (!textureReady || !ref.current || animStartedRef.current) return

    let raf1, raf2
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!ref.current || animStartedRef.current) return
        animStartedRef.current = true
        const g = ref.current

        // Start: slightly below center, scaled down, fully transparent
        g.position.set(0, -1.5, 0)
        g.scale.setScalar(0.6)

        // Make all meshes transparent (will fade in)
        g.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.transparent = true
            child.material.opacity = 0
          }
        })
        g.visible = true

        const tl = gsap.timeline()

        // Fade in all materials
        const meshes = []
        g.traverse(child => {
          if (child.isMesh && child.material) meshes.push(child.material)
        })
        meshes.forEach(mat => {
          tl.to(mat, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
        })

        // Slide up to final position
        tl.to(g.position, { y: 0, duration: 2.0, ease: 'power3.out' }, 0)

        // Scale up to full size
        tl.to(g.scale, { x: 1, y: 1, z: 1, duration: 2.0, ease: 'power3.out' }, 0.1)

        tlRef.current = tl
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      if (tlRef.current) tlRef.current.kill()
    }
  }, [textureReady])

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (tlRef.current) tlRef.current.kill() }
  }, [])

  return (
    <group ref={ref} visible={false}>
      <KeyboardModel introComplete={true} onTextureReady={handleTextureReady} />
    </group>
  )
}

// ─── Studio Lights ────────────────────────────────────────────────────────────
function StudioLights() {
  return (
    <>
      <directionalLight
        position={[5, 10, 7]}
        intensity={3.0}
        color="#fff5ee"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-7, 4, 5]}  intensity={1.1} color="#d5e8ff" />
      <directionalLight position={[-1, 7, -9]} intensity={1.8} color="#b0c5ff" />
      <directionalLight position={[0, 14, 1]}  intensity={0.6} color="#ffffff" />
      <pointLight position={[-5, 2, 6]}   intensity={0.9}  color="#00ffcc" distance={22} decay={2} />
      <pointLight position={[7, 0.5, 7]}  intensity={0.45} color="#ffcc88" distance={18} decay={2} />
      <pointLight position={[0, -1.5, 4]} intensity={0.35} color="#7733ff" distance={14} decay={2} />
      <ambientLight intensity={0.28} color="#c0d4ff" />
    </>
  )
}

// ─── Responsive Camera Hook ───────────────────────────────────────────────────
function useResponsiveCamera() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return isMobile
    ? { position: [0, 6.0, 14.0], fov: 60 }
    : { position: [0, 4.5, 9.0], fov: 40 }
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
export default function KeyboardScene() {
  const cam = useResponsiveCamera()
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        dpr={[1, 2]}
        shadows
      >
        {/* Camera — zooms out on mobile for smaller keyboard appearance */}
        <PerspectiveCamera makeDefault position={cam.position} fov={cam.fov} near={0.1} far={200} />

        <StudioLights />

        <Suspense fallback={null}>
          <AnimatedKeyboard />
          <Environment
            files="/hdr/studio-small.hdr"
            background={false}
            environmentIntensity={0.85}
          />
        </Suspense>

        {/* Shadow plane at keyboard final floor level */}
        <ContactShadows
          position={[FINAL.px, FINAL.py - 0.9, FINAL.pz]}
          opacity={0.5}
          scale={25}
          blur={4}
          far={8}
          color="#000033"
        />

        {/*
          OrbitControls target = Image1 final keyboard world position.
          This ensures orbiting pivots around the visible keyboard.
          Enabled from the start — user can orbit even during intro.
        */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={4}
          maxDistance={20}
          minPolarAngle={Math.PI * 0.05}
          maxPolarAngle={Math.PI * 0.52}
          enablePan={false}
          target={[FINAL.px, FINAL.py, FINAL.pz]}
        />
      </Canvas>
    </div>
  )
}
