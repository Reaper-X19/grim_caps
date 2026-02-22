/**
 * Phantom Chrome — Keyboard Teardown (Exploded View v7 — Perfect Order)
 *
 * EXPLODE: outside-in (like peeling a box open — bread goes first, shows filling):
 *   t=0.00  Keycaps + Weight    (outermost — peel off lid and base together)
 *   t=0.14  Switches + Case     (next layer in)
 *   t=0.26  Plate               (middle structural)
 *   t=0.36  PCB                 (inner)
 *   t=0.44  Emission plate      (innermost — last exposed, glows bright)
 *
 * REASSEMBLE: inside-out sandwich (inner fills first, bread closes last):
 *   Step1: PCB + Emission snap in
 *   Step2: Plate seats down
 *   Step3: Case wraps around
 *   Step4: Switches mount
 *   Step5: KEYCAP WAVE — L→R column cascade with teal flash on each landing
 *           Weight rises simultaneously from below
 *
 * SPREAD = 0.055 local × 17 = 0.935 world per gap → all 7 layers visible
 * Switches move as the entire Switches_Positions GROUP (atomic flat layer)
 */
import { useRef, useEffect } from 'react'
import { useFrame }           from '@react-three/fiber'
import * as THREE             from 'three'
import gsap                   from 'gsap'
import ClonedKeyboard         from './ClonedKeyboard'
import { KEYBOARD_COLUMNS, buildMeshMap, resolveLayout } from './keyboardLayout'

const SPREAD = 0.055   // local per gap (×17 = 0.935 world)

const LAYER_DEFS = [
  { id: 'keycaps',  delta: +SPREAD * 3,   color: '#c8d8ff', matchMesh:  n => n.startsWith('K_') || n === 'Knob' || n === 'Screen' },
  { id: 'switches', delta: +SPREAD * 2,   color: '#cc44ff', matchGroup: 'Switches_Positions' },
  { id: 'plate',    delta: +SPREAD * 1,   color: '#8899cc', matchMesh:  n => n === 'Plate' },
  { id: 'emission', delta: +SPREAD * 0.3, color: '#00ffcc', matchMesh:  n => n.toLowerCase().includes('emission') },
  { id: 'pcb',      delta: -SPREAD * 1,   color: '#22dd88', matchMesh:  n => n === 'PCB' },
  { id: 'case',     delta: -SPREAD * 2,   color: '#a0b8cc', matchMesh:  n => n === 'Top_Case' },
  { id: 'weight',   delta: -SPREAD * 3,   color: '#b87333', matchMesh:  n => n === 'Weight' },
]

// Explode order: outermost first
const EXPLODE_STEPS = [
  { ids: ['keycaps', 'weight'],  t: 0.00, dur: 0.70 },
  { ids: ['switches', 'case'],   t: 0.14, dur: 0.60 },
  { ids: ['plate'],              t: 0.26, dur: 0.55 },
  { ids: ['pcb'],                t: 0.36, dur: 0.55 },
  { ids: ['emission'],           t: 0.44, dur: 0.50 },
]

// Reassemble: inner fills first (excludes keycaps/weight — handled as wave)
const REASSEMBLE_STEPS = [
  ['pcb', 'emission'],
  ['plate'],
  ['case'],
  ['switches'],
  // keycaps = column wave, weight = simultaneous → handled separately
]
const STEP_DELAY   = 0.38
const COL_DELAY    = 0.032   // seconds between keycap columns (L→R wave)

function CameraRig({ phaseRef }) {
  useFrame(({ camera }) => {
    const exploded = phaseRef.current === 'explode' || phaseRef.current === 'exploded'
    // Pull back and look at keyboard centre — slightly higher when exploded
    const tx = 0.2,  ty = exploded ? 3.0 : 1.8,  tz = exploded ? 10.0 : 5.5
    const lookY = exploded ? 0.5 : 0.2
    camera.position.x += (tx - camera.position.x) * 0.03
    camera.position.y += (ty - camera.position.y) * 0.03
    camera.position.z += (tz - camera.position.z) * 0.03
    camera.lookAt(0, lookY, 0)
  })
  return null
}

export default function LiquidChromeScene() {
  const groupRef     = useRef()
  const rotRef       = useRef()
  const collectedRef = useRef(false)
  const tlRef        = useRef(null)
  const phaseRef     = useRef('hold')
  const rotSpeedRef  = useRef(0.08)

  useEffect(() => () => tlRef.current?.kill(), [])

  // Rotation slows to stop during exploded hold (clean layer view)
  useFrame((_, delta) => {
    if (rotRef.current) {
      const target = (phaseRef.current === 'exploded') ? 0 : 0.08
      rotSpeedRef.current += (target - rotSpeedRef.current) * 0.04
      rotRef.current.rotation.y += delta * rotSpeedRef.current
    }
  })

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    // ── Collect objects per layer ────────────────────────────────────────
    const layerObjs = LAYER_DEFS.map(() => [])
    const layerIdx  = {}
    LAYER_DEFS.forEach((def, i) => { layerIdx[def.id] = i })

    // Pass 1: find the Switches_Positions group
    groupRef.current.traverse(obj => {
      const si = LAYER_DEFS.findIndex(d => d.matchGroup && obj.name === d.matchGroup)
      if (si !== -1) {
        obj.userData.origY = obj.position.y
        layerObjs[si].push(obj)
      }
    })

    // Pass 2: meshes (skip descendants of Switches_Positions)
    groupRef.current.traverse(child => {
      if (!child.isMesh) return
      let ancestor = child.parent, inSwitches = false
      while (ancestor && ancestor !== groupRef.current) {
        if (ancestor.name === 'Switches_Positions') { inSwitches = true; break }
        ancestor = ancestor.parent
      }
      if (inSwitches) return

      child.userData.origY = child.position.y
      for (let i = 0; i < LAYER_DEFS.length; i++) {
        const def = LAYER_DEFS[i]
        if (def.matchMesh && def.matchMesh(child.name)) {
          layerObjs[i].push(child)
          return
        }
      }
    })

    // Build column-ordered keycap layout for the wave reassembly
    const meshMap = buildMeshMap(groupRef.current)
    const columns = resolveLayout(KEYBOARD_COLUMNS, meshMap)   // columns of K_* meshes L→R

    // ── Helpers ──────────────────────────────────────────────────────────
    function glowObj(tl, obj, color, intensity, startT, dur) {
      const C = new THREE.Color(color)
      if (obj.isMesh && obj.material) {
        tl.to(obj.material, {
          emissiveIntensity: intensity,
          duration: dur,
          onStart() { if (obj.material.emissive) obj.material.emissive.copy(C) },
        }, startT)
      } else {
        obj.traverse(c => {
          if (c.isMesh && c.material) {
            tl.to(c.material, {
              emissiveIntensity: intensity,
              duration: dur,
              onStart() { if (c.material.emissive) c.material.emissive.set(color) },
            }, startT)
          }
        })
      }
    }

    function killGlow(tl, obj, startT, dur) {
      if (obj.isMesh && obj.material) {
        tl.to(obj.material, { emissiveIntensity: 0, duration: dur }, startT)
      } else {
        obj.traverse(c => {
          if (c.isMesh && c.material) {
            tl.to(c.material, { emissiveIntensity: 0, duration: dur }, startT)
          }
        })
      }
    }

    // ── Cycle ─────────────────────────────────────────────────────────────
    function buildCycle() {
      tlRef.current?.kill()
      const tl = gsap.timeline({ onComplete: buildCycle })
      tlRef.current = tl

      // ── PHASE 1: EXPLODE (outside → in) ────────────────────────────────
      phaseRef.current = 'explode'
      EXPLODE_STEPS.forEach(({ ids, t, dur }) => {
        ids.forEach(id => {
          const idx  = layerIdx[id]
          const def  = LAYER_DEFS[idx]
          const objs = layerObjs[idx]
          objs.forEach(obj => {
            tl.to(obj.position, { y: obj.userData.origY + def.delta, duration: dur, ease: 'power3.inOut' }, t)
            glowObj(tl, obj, def.color, 0.28, t + 0.2, 0.40)
          })
        })
      })

      // ── PHASE 2: HOLD EXPLODED ─────────────────────────────────────────
      const holdStart = 0.85
      tl.call(() => { phaseRef.current = 'exploded' }, null, holdStart)
      tl.to({}, { duration: 2.8 }, holdStart)

      // ── PHASE 3: REASSEMBLE — inner fills first ────────────────────────
      const rStart = holdStart + 2.8
      tl.call(() => { phaseRef.current = 'assemble' }, null, rStart)

      REASSEMBLE_STEPS.forEach((stepIds, si) => {
        const st = rStart + si * STEP_DELAY
        stepIds.forEach(id => {
          const objs = layerObjs[layerIdx[id]]
          objs.forEach(obj => {
            tl.to(obj.position, { y: obj.userData.origY, duration: 0.42, ease: 'expo.out' }, st)
            killGlow(tl, obj, st + 0.38, 0.28)
          })
        })
      })

      // ── PHASE 4: KEYCAP WAVE (L→R cascade) + Weight rises ──────────────
      const keyStart = rStart + REASSEMBLE_STEPS.length * STEP_DELAY
      const tealColor = '#00ffcc'

      // Weight rises simultaneously with first keycap column
      const weightObjs = layerObjs[layerIdx['weight']]
      weightObjs.forEach(obj => {
        tl.to(obj.position, { y: obj.userData.origY, duration: 0.60, ease: 'power3.out' }, keyStart)
        killGlow(tl, obj, keyStart + 0.55, 0.35)
      })

      // Keycap column wave
      columns.forEach((colMeshes, colIdx) => {
        const wT = keyStart + colIdx * COL_DELAY
        colMeshes.forEach((mesh, mi) => {
          tl.to(mesh.position, {
            y: mesh.userData.origY,
            duration: 0.40,
            ease: 'power3.out',
            delay: mi * 0.004,
          }, wT)
          // Teal flash on landing
          tl.to(mesh.material, {
            emissiveIntensity: 0.40,
            duration: 0.05,
            onStart() { if (mesh.material.emissive) mesh.material.emissive.set(tealColor) },
          }, wT + 0.36 + mi * 0.004)
          tl.to(mesh.material, { emissiveIntensity: 0, duration: 0.55 }, wT + 0.41 + mi * 0.004)
        })
      })

      // Also handle Knob/Screen (part of keycaps layer, non-K_ meshes)
      const knobObjs = layerObjs[layerIdx['keycaps']].filter(o => !o.name.startsWith('K_'))
      knobObjs.forEach(obj => {
        tl.to(obj.position, { y: obj.userData.origY, duration: 0.45, ease: 'power3.out' }, keyStart)
        killGlow(tl, obj, keyStart + 0.40, 0.30)
      })

      // Hard-reset all Y to prevent float accumulation
      const waveEnd = keyStart + columns.length * COL_DELAY + 0.50
      tl.call(() => {
        groupRef.current?.traverse(obj => {
          if (obj.userData.origY !== undefined) obj.position.y = obj.userData.origY
          if (obj.isMesh && obj.material?.emissiveIntensity !== undefined)
            obj.material.emissiveIntensity = 0
        })
        phaseRef.current = 'hold'
      }, null, waveEnd)

      tl.to({}, { duration: 2.0 }, waveEnd)
    }

    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.18} />
      <spotLight
        position={[0, 10, 3]}
        angle={0.38}
        penumbra={0.60}
        intensity={4.0}
        castShadow
        color="#ffffff"
      />
      {/* Accent lights that pop during exploded hold */}
      <pointLight position={[0,   5, 6]} intensity={1.6} color="#00ffcc" />
      <pointLight position={[0,  -5, 6]} intensity={1.4} color="#b87333" />
      <pointLight position={[-8,  0, 3]} intensity={0.9} color="#8899cc" />
      <pointLight position={[ 8,  1, 3]} intensity={0.9} color="#cc44ff" />
      <CameraRig phaseRef={phaseRef} />
      <group ref={rotRef} position={[0, -0.3, 0]}>
        <group ref={groupRef} scale={17} rotation={[0.30, 0.10, 0]}>
          <ClonedKeyboard />
        </group>
      </group>
    </>
  )
}
