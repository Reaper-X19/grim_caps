/**
 * Phantom Chrome — Keyboard Teardown (Exploded View v5 — Sandwich Edition)
 *
 * LAYER ORDER (top → bottom in exploded view):
 *   7. Keycaps (K_*) + Knob + Screen    → +SPREAD*3   (bread top)
 *   6. Switches (Switch* group)          → +SPREAD*2
 *   5. Plate                             → +SPREAD*1
 *   4. Emission strips                   → +SPREAD*0.25 (just above rest)
 *   3. PCB                               → -SPREAD*1
 *   2. Case (Top_Case)                   → -SPREAD*2
 *   1. Weight                            → -SPREAD*3   (bread bottom)
 *
 * SPREAD = 0.10 local × 17 = 1.70 world units per gap = clearly separated
 *
 * EXPLODE order: inside-out (Plate & PCB first, then Case & Switches,
 *                then Keycaps & Weight last — dramatic "burst open" feel)
 *
 * REASSEMBLE: sandwich style — middle fills first, then bread closes last
 *   Step 1: PCB → Case → Emission plate → Plate (inner layers click in)
 *   Step 2: Switches (above Plate)
 *   Step 3 (SIMULTANEOUS): Keycaps + Knob drop from TOP, Weight rises from BOTTOM
 *
 * All offsets are DELTA from mesh.userData.origY so every mesh moves
 * exactly the same visual distance regardless of its rest position.
 */
import { useRef, useEffect } from 'react'
import { useFrame }           from '@react-three/fiber'
import * as THREE             from 'three'
import gsap                   from 'gsap'
import ClonedKeyboard         from './ClonedKeyboard'

// ─── LAYER DEFINITIONS ───────────────────────────────────────────────────────
// spreadFactor: multiplier for the base SPREAD unit
// match(name): returns true if the mesh belongs to this layer
// color: accent emissive during the explode hold
const SPREAD = 0.10  // local units per gap (×17 = 1.70 world — clearly visible)

const LAYERS = [
  // Index 0 = TOP (keycaps are the bread lid)
  {
    id:       'keycaps',
    label:    'Keycaps + Knob',
    match:    n => n.startsWith('K_') || n === 'Knob' || n === 'Screen',
    delta:    +SPREAD * 3,
    color:    '#e0e8ff',  // cool white
  },
  {
    id:       'switches',
    label:    'Switches',
    match:    n => n.startsWith('Switch'),
    delta:    +SPREAD * 2,
    color:    '#cc44ff',  // purple
  },
  {
    id:       'plate',
    label:    'Plate',
    match:    n => n === 'Plate',
    delta:    +SPREAD * 1,
    color:    '#8899cc',  // steel blue
  },
  {
    id:       'emission',
    label:    'Emission plate',
    match:    n => n.toLowerCase().includes('emission'),
    delta:    +SPREAD * 0.25,
    color:    '#00ffcc',  // teal
  },
  {
    id:       'pcb',
    label:    'PCB',
    match:    n => n === 'PCB',
    delta:    -SPREAD * 1,
    color:    '#22dd88',  // PCB green
  },
  {
    id:       'case',
    label:    'Case',
    match:    n => n === 'Top_Case',
    delta:    -SPREAD * 2,
    color:    '#a0b8cc',  // aluminium
  },
  // Index 6 = BOTTOM (weight is the bread base)
  {
    id:       'weight',
    label:    'Weight',
    match:    n => n === 'Weight',
    delta:    -SPREAD * 3,
    color:    '#b87333',  // brass/copper
  },
]

// ─── REASSEMBLE ORDER (sandwich: fills first, bread closes last) ─────────────
// Each entry = array of layer IDs to reassemble in this step
const REASSEMBLE_STEPS = [
  ['pcb', 'emission'],           // step 0: bottom inner layers snap in first
  ['plate'],                     // step 1: plate seats onto PCB
  ['case'],                      // step 2: case wraps around
  ['switches'],                  // step 3: switches mount (above plate)
  ['keycaps', 'weight'],         // step 4: SIMULTANEOUSLY — lid drops + base rises
]
const STEP_DELAY = 0.40  // seconds between reassembly steps

// ─── CAMERA ─────────────────────────────────────────────────────────────────
function CameraRig({ phaseRef }) {
  useFrame(({ camera }) => {
    const phase = phaseRef.current
    let tx, ty, tz

    if (phase === 'hold' || phase === 'assemble') {
      tx = 0.5;  ty = 1.8;  tz = 5.8
    } else {
      // Exploded — pull back to see all separated layers
      tx = 0.6;  ty = 3.0;  tz = 10.0
    }
    camera.position.x += (tx - camera.position.x) * 0.028
    camera.position.y += (ty - camera.position.y) * 0.028
    camera.position.z += (tz - camera.position.z) * 0.028
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

  // Slow continuous Y rotation
  useFrame((_, delta) => {
    if (rotRef.current) rotRef.current.rotation.y += delta * 0.08
  })

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    // Collect meshes per layer
    const layerMeshes = LAYERS.map(() => [])
    groupRef.current.traverse(child => {
      if (!child.isMesh) return
      child.userData.origY = child.position.y
      for (let i = 0; i < LAYERS.length; i++) {
        if (LAYERS[i].match(child.name)) {
          layerMeshes[i].push(child)
          return
        }
      }
    })

    // Build a layer-id → index lookup
    const layerIdx = {}
    LAYERS.forEach((l, i) => { layerIdx[l.id] = i })

    function buildCycle() {
      const tl = gsap.timeline({ onComplete: buildCycle })

      // ── PHASE 1: EXPLODE (inside-out) ─────────────────────────────────
      // Order: Plate & PCB first (middle fills), then Case & Switches, then Keycaps & Weight
      phaseRef.current = 'explode'
      const explodeOrder = [
        ['plate', 'pcb'],        // t=0    innermost first
        ['emission', 'case'],    // t=0.10
        ['switches'],            // t=0.20
        ['keycaps', 'weight'],   // t=0.35 outermost last (dramatic burst)
      ]
      explodeOrder.forEach((group, gi) => {
        const et = gi === 3 ? 0.35 : gi * 0.10
        group.forEach(lid => {
          const idx   = layerIdx[lid]
          const layer = LAYERS[idx]
          const meshes = layerMeshes[idx]
          if (!meshes?.length) return

          const COLOR = new THREE.Color(layer.color)
          meshes.forEach(m => {
            tl.to(m.position, {
              y:        m.userData.origY + layer.delta,
              duration: lid === 'keycaps' || lid === 'weight' ? 0.70 : 0.55,
              ease:     'power3.inOut',
            }, et + Math.random() * 0.02)
            tl.to(m.material, {
              emissiveIntensity: 0.30,
              duration: 0.40,
              onStart() { if (m.material.emissive) m.material.emissive.copy(COLOR) },
            }, et + 0.15)
          })
        })
      })

      // ── PHASE 2: HOLD EXPLODED ─────────────────────────────────────────
      const holdStart = 0.70
      tl.call(() => { phaseRef.current = 'exploded' }, null, holdStart)
      tl.to({}, { duration: 2.8 }, holdStart)

      // ── PHASE 3: REASSEMBLE — sandwich style ──────────────────────────
      const reassembleStart = holdStart + 2.8
      tl.call(() => { phaseRef.current = 'assemble' }, null, reassembleStart)

      REASSEMBLE_STEPS.forEach((step, si) => {
        const st = reassembleStart + si * STEP_DELAY
        const isLast = si === REASSEMBLE_STEPS.length - 1

        step.forEach(lid => {
          const idx   = layerIdx[lid]
          const meshes = layerMeshes[idx]
          if (!meshes?.length) return

          meshes.forEach(m => {
            // Snap back to origY
            tl.to(m.position, {
              y:        m.userData.origY,
              duration: isLast ? 0.65 : 0.45,
              ease:     isLast ? 'back.out(1.3)' : 'expo.out',
            }, st + Math.random() * 0.02)
            tl.to(m.material, {
              emissiveIntensity: 0,
              duration: 0.30,
            }, st + (isLast ? 0.60 : 0.40))
          })
        })
      })

      // Hard Y reset to prevent any float accumulation
      const totalTime = reassembleStart + REASSEMBLE_STEPS.length * STEP_DELAY + 0.70
      tl.call(() => {
        groupRef.current?.traverse(child => {
          if (!child.isMesh) return
          if (child.userData.origY !== undefined) child.position.y = child.userData.origY
          if (child.material?.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = 0
          }
        })
        phaseRef.current = 'hold'
      }, null, totalTime)

      // ── PHASE 4: HOLD ASSEMBLED ───────────────────────────────────────
      tl.to({}, { duration: 1.8 }, totalTime)
      tlRef.current = tl
    }

    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.18} />
      {/* Top-down product light */}
      <spotLight
        position={[0, 10, 2]}
        angle={0.40}
        penumbra={0.65}
        intensity={3.5}
        castShadow
        color="#ffffff"
      />
      {/* Layer-edge accent lights — hit layers edge-on when exploded */}
      <pointLight position={[0,  5, 5]} intensity={1.5} color="#00ffcc" />
      <pointLight position={[0, -5, 5]} intensity={1.2} color="#b87333" />
      <pointLight position={[-7, 0, 2]} intensity={0.9} color="#8899cc" />
      <pointLight position={[7,  1, 2]} intensity={0.9} color="#cc44ff" />
      <CameraRig phaseRef={phaseRef} />
      <group ref={rotRef}>
        <group ref={groupRef} scale={17} rotation={[0.28, 0, 0]}>
          <ClonedKeyboard />
        </group>
      </group>
    </>
  )
}
