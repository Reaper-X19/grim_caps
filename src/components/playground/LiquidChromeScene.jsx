/**
 * Phantom Chrome — Exploded Layer View
 *
 * Replaces the material morph with a stunning keyboard teardown & reassembly:
 *
 *   LAYERS (bottom → top in the model, but we spread them vertically):
 *     0  Weight        (brass weight, bottom)
 *     1  Top_Case      (aluminium case body)
 *     2  PCB           (green circuit board)
 *     3  Plate         (switch mounting plate)
 *     4  Switches_Positions group (all switches)
 *     5  Keycaps K_*   (top layer — legends visible)
 *
 *   ANIMATION:
 *   Phase 1 — EXPLODE:  each layer slides to its spread Y position
 *                        with a staggered delay (bottom layers move first).
 *                        Camera pulls back to see all layers.
 *   Phase 2 — HOLD:     2 seconds to appreciate the layers, slow Y rotation.
 *   Phase 3 — REASSEMBLE: layers snap back in reverse order (keycaps first,
 *                         bottom last). Camera rushes forward.
 *   Phase 4 — HOLD ASSEMBLED: 1.5 sec, then repeat.
 *
 *   LIGHTING:
 *   Coloured strip lights hit each layer edge-on so each layer glows its
 *   own accent colour (gold/teal/blue/purple/white/orange from bottom to top).
 */
import { useRef, useEffect } from 'react'
import { useFrame }           from '@react-three/fiber'
import * as THREE             from 'three'
import gsap                   from 'gsap'
import ClonedKeyboard         from './ClonedKeyboard'

// ─── LAYER CONFIG ────────────────────────────────────────────────────────────
// Each entry: { match, label, spreadY, color }
// match(name) → true if mesh belongs to this layer
// spreadY = LOCAL Y offset when fully exploded (parent scale=17 → ×17 world)
// Spread range: ±0.12 local ≈ ±2 world units → clearly separated layers
const LAYERS = [
  {
    label:   'Weight',
    match:   n => n === 'Weight',
    spreadY: -0.14,
    color:   '#b87333',   // copper/brass
  },
  {
    label:   'Case',
    match:   n => n === 'Top_Case' || n === 'Screen',
    spreadY: -0.09,
    color:   '#a0b8cc',   // aluminium blue
  },
  {
    label:   'PCB',
    match:   n => n === 'PCB',
    spreadY: -0.04,
    color:   '#22dd88',   // PCB green
  },
  {
    label:   'Plate',
    match:   n => n === 'Plate',
    spreadY:  0.01,
    color:   '#8899cc',   // steel blue
  },
  {
    label:   'Knob',
    match:   n => n === 'Knob',
    spreadY:  0.06,
    color:   '#ffcc44',   // gold knob
  },
  {
    label:   'Switches',
    match:   n => n.startsWith('Switch'),
    spreadY:  0.10,
    color:   '#cc44ff',   // switch purple
  },
  {
    label:   'Keycaps',
    match:   n => n.startsWith('K_'),
    spreadY:  0.18,
    color:   '#ffffff',   // keycap white
  },
]

// ─── CAMERA ─────────────────────────────────────────────────────────────────
function CameraRig({ phaseRef }) {
  useFrame(({ camera }, delta) => {
    const phase = phaseRef.current
    let tx, ty, tz
    if (phase === 'assemble' || phase === 'hold') {
      tx = 0.6; ty = 1.6; tz = 5.5
    } else {
      // Exploded — pull back to see all separated layers
      tx = 0.8; ty = 2.5; tz = 8.5
    }
    camera.position.x += (tx - camera.position.x) * 0.025
    camera.position.y += (ty - camera.position.y) * 0.025
    camera.position.z += (tz - camera.position.z) * 0.025
    camera.lookAt(0, 0.2, 0)
  })
  return null
}

// ─── MAIN SCENE ─────────────────────────────────────────────────────────────
export default function LiquidChromeScene() {
  const groupRef     = useRef()
  const rotRef       = useRef()
  const collectedRef = useRef(false)
  const tlRef        = useRef(null)
  const phaseRef     = useRef('hold')

  useEffect(() => () => tlRef.current?.kill(), [])

  // Slow Y rotation of keyboard group (continuous)
  useFrame((_, delta) => {
    if (rotRef.current) rotRef.current.rotation.y += delta * 0.10
  })

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    // Collect meshes and group them by layer
    const layerMeshes = LAYERS.map(() => [])

    // Traverse the group to find each mesh and store origY in userData
    groupRef.current.traverse((child) => {
      if (!child.isMesh) return
      child.userData.origY = child.position.y   // store for reset
      const n = child.name

      for (let i = 0; i < LAYERS.length; i++) {
        if (LAYERS[i].match(n)) {
          layerMeshes[i].push(child)
          break
        }
      }
    })

    // Accent color for each layer's emissive
    const layerColors = LAYERS.map(l => new THREE.Color(l.color))

    function buildCycle() {
      const tl = gsap.timeline({ onComplete: buildCycle })

      // ── PHASE 1: EXPLODE ──────────────────────────────────────────────
      phaseRef.current = 'explode'
      LAYERS.forEach((layer, i) => {
        const meshes = layerMeshes[i]
        if (!meshes.length) return

        const COLOR = layerColors[i]
        const positions = meshes.map(m => m.position)
        const materials = meshes.map(m => m.material)

        // Slide to spread position — bottom first (i=0), top last (i=6)
        const t = i * 0.08
        tl.to(positions, {
          y: layer.spreadY,
          duration: 1.0,
          ease: 'power3.inOut',
          stagger: 0.01,
        }, t)

        // Each layer glows its accent color as it slides out
        tl.to(materials, {
          emissiveIntensity: 0.30,
          duration: 0.5,
          stagger: 0.01,
          onStart() { materials.forEach(mat => { if (mat.emissive) mat.emissive.copy(COLOR) }) },
        }, t + 0.3)
      })

      // ── PHASE 2: HOLD EXPLODED ────────────────────────────────────────
      tl.call(() => { phaseRef.current = 'exploded' }, null, 1.2)
      tl.to({}, { duration: 2.5 }, 1.2)

      // ── PHASE 3: REASSEMBLE — top first (keycaps), bottom last ───────
      tl.call(() => { phaseRef.current = 'assemble' }, null, 3.7)
      const reassembleStart = 3.7
      ;[...LAYERS].reverse().forEach((layer, ri) => {
        const i      = LAYERS.length - 1 - ri
        const meshes = layerMeshes[i]
        if (!meshes.length) return

        const materials = meshes.map(m => m.material)
        const t         = reassembleStart + ri * 0.10

        // Tween each mesh back to its stored origY individually
        meshes.forEach((mesh, mi) => {
          tl.to(mesh.position, {
            y: mesh.userData.origY,
            duration: 0.55,
            ease: 'expo.inOut',
            delay: mi * 0.005,
          }, t)
        })

        tl.to(materials, {
          emissiveIntensity: 0,
          duration: 0.35,
          stagger: 0.01,
        }, t + 0.20)
      })

      // Hard-reset all Y values to origY (prevent float drift)
      const resetTime = reassembleStart + LAYERS.length * 0.10 + 0.6
      tl.call(() => {
        groupRef.current?.traverse((child) => {
          if (!child.isMesh) return
          if (child.userData.origY !== undefined) child.position.y = child.userData.origY
          if (child.material?.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = 0
          }
        })
        phaseRef.current = 'hold'
      }, null, resetTime)

      // ── PHASE 4: HOLD ASSEMBLED ───────────────────────────────────────
      tl.to({}, { duration: 1.5 }, resetTime)
      tlRef.current = tl
    }

    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.18} />
      {/* Top-down product light */}
      <spotLight
        position={[0, 9, 2]}
        angle={0.38}
        penumbra={0.65}
        intensity={3.5}
        castShadow
        color="#ffffff"
      />
      {/* Coloured edge lights — hit layers edge-on when exploded */}
      <pointLight position={[0,  4, 5]} intensity={1.2} color="#00ffcc" />
      <pointLight position={[0, -4, 5]} intensity={1.0} color="#b87333" />
      <pointLight position={[-6, 0, 2]} intensity={0.8} color="#8899cc" />
      <pointLight position={[6,  1, 2]} intensity={0.8} color="#cc44ff" />
      <CameraRig phaseRef={phaseRef} />
      {/* Slow-rotate the whole keyboard for cinematic polish */}
      <group ref={rotRef}>
        <group ref={groupRef} scale={17} rotation={[0.28, 0, 0]}>
          <ClonedKeyboard />
        </group>
      </group>
    </>
  )
}
