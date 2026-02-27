/**
 * Phantom Chrome — Keyboard Teardown (Exploded View v8)
 *
 * Layer order (top → bottom in exploded view):
 *   Keycaps + Knob   +SPREAD*3
 *   Switches         +SPREAD*2
 *   PCB (green)      +SPREAD*1
 *   Plate (steel)    +SPREAD*0.3  ← 4th from bottom (was 3rd)
 *   Gold piece       -SPREAD*1    ← 3rd from bottom (was 4th)  !!!USER FIX!!!
 *   Case             -SPREAD*2
 *   Weight           -SPREAD*3    (bottom)
 *
 * ROTATION TWEEN:
 *   Assembled:  rotation.x = 0.40, rotation.y = 0.10  (slanted product angle)
 *   Exploding:  tween → rotation.x = 0.05, rotation.y = 0  (flat = layers horizontal)
 *   Reassembly: tween → rotation.x = 0.40, rotation.y = 0.10  (slanted again)
 */
import { useRef, useEffect } from 'react'
import { useFrame }           from '@react-three/fiber'
import * as THREE             from 'three'
import gsap                   from 'gsap'
import ClonedKeyboard         from './ClonedKeyboard'
import { KEYBOARD_COLUMNS, buildMeshMap, resolveLayout } from './keyboardLayout'

const SPREAD = 0.038

const LAYER_DEFS = [
  { id: 'keycaps',      delta: +SPREAD * 3,   color: '#c8d8ff', matchMesh:  n => n.startsWith('K_') || n === 'Knob' || n === 'Screen' },
  { id: 'switches',    delta: +SPREAD * 2,   color: '#cc44ff', matchGroup: 'Switches_Positions' },
  { id: 'pcb',         delta: +SPREAD * 1,   color: '#22dd88', matchMesh:  n => n === 'PCB' },
  { id: 'emission',    delta: +SPREAD * 0.3, color: '#aaddff', matchMesh:  n => n.toLowerCase().includes('emission') },
  { id: 'plate',       delta: -SPREAD * 0.8, color: '#9ab0cc', matchMesh:  n => n === 'Plate' },
  { id: 'topcase',     delta: -SPREAD * 1.6, color: '#a0b8cc', matchMesh:  n => n === 'Top_Case' },
  // Bottom Case (gold housing) = Cube005 + Cube005_1 — confirmed from GLTF
  { id: 'bottomcase',  delta: -SPREAD * 2.3, color: '#c8a84b', matchMesh:  n => n === 'Cube005' || n === 'Cube005_1' },
  { id: 'weight',      delta: -SPREAD * 3,   color: '#b87333', matchMesh:  n => n === 'Weight' },
]

// Explode: outermost first (slower — each layer clearly readable)
const EXPLODE_STEPS = [
  { ids: ['keycaps', 'weight'],          t: 0.00, dur: 1.20 },
  { ids: ['switches', 'topcase'],        t: 0.24, dur: 1.02 },
  { ids: ['bottomcase'],                 t: 0.41, dur: 0.99 },
  { ids: ['pcb'],                        t: 0.54, dur: 0.94 },
  { ids: ['plate'],                      t: 0.68, dur: 0.88 },
  { ids: ['emission'],                   t: 0.80, dur: 0.85 },
]

// Reassemble: inner fills first
const REASSEMBLE_STEPS = [
  ['emission', 'pcb'],
  ['plate'],
  ['topcase'],
  ['bottomcase'],   // bottom case last before switches
  ['switches'],
]
const STEP_DELAY = 0.65    // was 0.38
const COL_DELAY  = 0.055   // was 0.032

// Assembled vs exploded rotation targets
const ROT_ASSEMBLED = { x: 0.40, y: 0.10 }
const ROT_FLAT      = { x: 0.05, y: 0.00 }

// Camera: phases-aware — orbital sweep while floating, front-face on reassembly
function CameraRig({ phaseRef }) {
  const elapsed = useRef(0)
  useFrame(({ camera, clock }, delta) => {
    elapsed.current += delta
    const t     = clock.elapsedTime
    const phase = phaseRef.current
    let tx, ty, tz

    if (phase === 'floating') {
      // Slow arc ±20° so viewer sees PCB, plate & switches from multiple angles
      const arc = Math.sin(t * 0.22) * 0.36
      tx = Math.sin(arc) * 5.2
      ty = 2.6 + Math.sin(t * 0.15) * 0.3
      tz = Math.cos(arc) * 5.2
    } else if (phase === 'exploded' || phase === 'explode') {
      // Brief transition drift before settling into full orbit
      const drift = Math.sin(t * 0.09) * 0.8
      tx = drift; ty = 2.8; tz = 10.0
    } else if (phase === 'assemble') {
      // Front-face return during reassembly
      tx = 0; ty = 2.0; tz = 5.0
    } else {
      // Hold assembled: slow sway at comfortable viewing angle
      tx = Math.sin(elapsed.current * 0.16) * 1.4
      tz = 5.5 + Math.cos(elapsed.current * 0.16) * 0.5
      ty = 1.6
    }

    camera.position.x += (tx - camera.position.x) * 0.022
    camera.position.y += (ty - camera.position.y) * 0.022
    camera.position.z += (tz - camera.position.z) * 0.022
    camera.lookAt(0, 0.1, 0)
  })
  return null
}

export default function LiquidChromeScene() {
  const groupRef     = useRef()
  const floatRef     = useRef(null)
  const collectedRef = useRef(false)
  const tlRef        = useRef(null)
  const phaseRef     = useRef('hold')
  const layerObjsRef = useRef([])   // exposed to useFrame for oscillation

  useEffect(() => () => tlRef.current?.kill(), [])

  // Breathing float on assembled hold + layer oscillation while floating
  useFrame(({ clock }) => {
    if (!floatRef.current) return
    const targetY = (phaseRef.current === 'hold') ? Math.sin(clock.elapsedTime * 0.70) * 0.08 : 0
    floatRef.current.position.y += (targetY - floatRef.current.position.y) * 0.04

    // Per-layer sinusoidal drift while exploded (zero-gravity feel)
    // Only runs after GSAP explode tweens are 100% done ('floating' phase)
    if (phaseRef.current === 'floating') {
      const t = clock.elapsedTime
      layerObjsRef.current.forEach((objs, li) => {
        if (!objs.length) return
        // Each layer: different speed + phase + amplitude
        const freq  = 0.45 + li * 0.08
        const phase = li * (Math.PI * 0.55)
        const drift = Math.sin(t * freq + phase) * 0.012  // 0.012 local × 17 = 0.20 world — clearly visible
        const def   = LAYER_DEFS[li]
        objs.forEach(obj => {
          if (obj.userData.origY === undefined) return
          obj.position.y = (obj.userData.origY + def.delta) + drift
        })
      })
    }
  })

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    // Set initial assembled rotation
    groupRef.current.rotation.x = ROT_ASSEMBLED.x
    groupRef.current.rotation.y = ROT_ASSEMBLED.y

    // ── Collect objects per layer ─────────────────────────────────────────
    const layerObjs = LAYER_DEFS.map(() => [])
    const layerIdx  = {}
    LAYER_DEFS.forEach((def, i) => { layerIdx[def.id] = i })

    groupRef.current.traverse(obj => {
      const si = LAYER_DEFS.findIndex(d => d.matchGroup && obj.name === d.matchGroup)
      if (si !== -1) { obj.userData.origY = obj.position.y; layerObjs[si].push(obj) }
    })

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
        if (def.matchMesh && def.matchMesh(child.name)) { layerObjs[i].push(child); return }
      }
    })

    const meshMap = buildMeshMap(groupRef.current)
    const columns = resolveLayout(KEYBOARD_COLUMNS, meshMap)

    // ── Helpers ───────────────────────────────────────────────────────────
    function glowObj(tl, obj, color, intensity, startT, dur) {
      const C = new THREE.Color(color)
      if (obj.isMesh && obj.material) {
        tl.to(obj.material, {
          emissiveIntensity: intensity, duration: dur,
          onStart() { if (obj.material.emissive) obj.material.emissive.copy(C) },
        }, startT)
      } else {
        obj.traverse(c => {
          if (c.isMesh && c.material)
            tl.to(c.material, {
              emissiveIntensity: intensity, duration: dur,
              onStart() { if (c.material.emissive) c.material.emissive.set(color) },
            }, startT)
        })
      }
    }

    function killGlow(tl, obj, startT, dur) {
      if (obj.isMesh && obj.material) {
        tl.to(obj.material, { emissiveIntensity: 0, duration: dur }, startT)
      } else {
        obj.traverse(c => {
          if (c.isMesh && c.material)
            tl.to(c.material, { emissiveIntensity: 0, duration: dur }, startT)
        })
      }
    }

    // Expose layer objects to the breathing useFrame for oscillation
    layerObjsRef.current = layerObjs

    // ── Cycle ─────────────────────────────────────────────────────────────
    function buildCycle() {
      tlRef.current?.kill()
      const tl = gsap.timeline({ onComplete: buildCycle })
      tlRef.current = tl

      // Tween keyboard rotation to near-flat BEFORE layers separate
      tl.to(groupRef.current.rotation, {
        x: ROT_FLAT.x, y: ROT_FLAT.y,
        duration: 0.70, ease: 'power2.inOut',
      }, 0)

      phaseRef.current = 'explode'

      // ── PHASE 1: EXPLODE ───────────────────────────────────────────────
      EXPLODE_STEPS.forEach(({ ids, t, dur }) => {
        ids.forEach(id => {
          const idx  = layerIdx[id]
          const def  = LAYER_DEFS[idx]
          const objs = layerObjs[idx]
          objs.forEach(obj => {
            tl.to(obj.position, { y: obj.userData.origY + def.delta, duration: dur, ease: 'power3.inOut' }, t)
            glowObj(tl, obj, def.color, 0.30, t + 0.2, 0.40)
          })
        })
      })

      // ── PHASE 2: HOLD ─────────────────────────────────────────────────
      const holdStart = 0.85
      tl.call(() => { phaseRef.current = 'exploded' }, null, holdStart)
      // After tweens fully settle, switch to 'floating' for layer oscillation
      tl.call(() => { phaseRef.current = 'floating' }, null, holdStart + 1.8)
      tl.to({}, { duration: 4.5 }, holdStart)

      // ── PHASE 3: REASSEMBLE ───────────────────────────────────────────
      const rStart = holdStart + 4.5
      tl.call(() => { phaseRef.current = 'assemble' }, null, rStart)

      REASSEMBLE_STEPS.forEach((stepIds, si) => {
        const st = rStart + si * STEP_DELAY
        stepIds.forEach(id => {
          layerObjs[layerIdx[id]].forEach(obj => {
            // Elastic snap for satisfying assembly feel
            tl.to(obj.position, { y: obj.userData.origY, duration: 0.65, ease: 'elastic.out(1.2, 0.55)' }, st)
            killGlow(tl, obj, st + 0.55, 0.35)
          })
        })
      })

      // ── PHASE 4: KEYCAP WAVE + WEIGHT ────────────────────────────────
      const keyStart = rStart + REASSEMBLE_STEPS.length * STEP_DELAY
      const tealColor = '#00F0FF'

      // Tween rotation back to slanted just as keys start landing
      tl.to(groupRef.current.rotation, {
        x: ROT_ASSEMBLED.x, y: ROT_ASSEMBLED.y,
        duration: columns.length * COL_DELAY + 0.65,
        ease: 'power2.inOut',
      }, keyStart)

      // Weight rises with first column
      layerObjs[layerIdx['weight']].forEach(obj => {
        tl.to(obj.position, { y: obj.userData.origY, duration: 0.60, ease: 'power3.out' }, keyStart)
        killGlow(tl, obj, keyStart + 0.55, 0.35)
      })

      // Keycap L→R wave
      columns.forEach((colMeshes, colIdx) => {
        const wT = keyStart + colIdx * COL_DELAY
        colMeshes.forEach((mesh, mi) => {
          tl.to(mesh.position, { y: mesh.userData.origY, duration: 0.40, ease: 'power3.out', delay: mi * 0.004 }, wT)
          tl.to(mesh.material, {
            emissiveIntensity: 0.40, duration: 0.05,
            onStart() { if (mesh.material.emissive) mesh.material.emissive.set(tealColor) },
          }, wT + 0.36 + mi * 0.004)
          tl.to(mesh.material, { emissiveIntensity: 0, duration: 0.55 }, wT + 0.41 + mi * 0.004)
        })
      })

      // Knob/Screen
      layerObjs[layerIdx['keycaps']].filter(o => !o.name.startsWith('K_')).forEach(obj => {
        tl.to(obj.position, { y: obj.userData.origY, duration: 0.45, ease: 'power3.out' }, keyStart)
        killGlow(tl, obj, keyStart + 0.40, 0.30)
      })

      // Hard reset + hold
      const waveEnd = keyStart + columns.length * COL_DELAY + 0.55
      tl.call(() => {
        groupRef.current?.traverse(obj => {
          if (obj.userData.origY !== undefined) obj.position.y = obj.userData.origY
          if (obj.isMesh && obj.material?.emissiveIntensity !== undefined)
            obj.material.emissiveIntensity = 0
        })
        phaseRef.current = 'hold'
      }, null, waveEnd)
      tl.to({}, { duration: 4.0 }, waveEnd)
    }

    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.18} />
      <spotLight position={[0, 10, 3]} angle={0.38} penumbra={0.60} intensity={4.0} castShadow color="#ffffff" />
      <pointLight position={[0,   5, 6]} intensity={1.6} color="#00F0FF" />
      <pointLight position={[0,  -5, 6]} intensity={1.4} color="#b87333" />
      <pointLight position={[-8,  0, 3]} intensity={0.9} color="#8899cc" />
      <pointLight position={[ 8,  1, 3]} intensity={0.9} color="#cc44ff" />
      <CameraRig phaseRef={phaseRef} />
      <group ref={floatRef}>
        <group ref={groupRef} scale={17} position={[0, -0.15, 0]}>
          <ClonedKeyboard />
        </group>
      </group>
    </>
  )
}
