/**
 * Phantom Chrome — Keyboard Teardown (Exploded View v6 — Perfect Edition)
 *
 * THE KEY PHYSICS FIX:
 *   SPREAD = 0.055 local × 17 = 0.935 world per gap
 *   Total spread (6 gaps): ~5.6 world → all layers visible in frame at z=11
 *
 *   Switch layer = the entire Switches_Positions GROUP moved as one unit,
 *   not individual switch meshes. This gives a clean flat layer.
 *
 * LAYER ORDER (top → bottom, exploded view):
 *   7. Keycaps (K_*) + Knob + Screen    +SPREAD×3
 *   6. Switches (Switches_Positions grp) +SPREAD×2
 *   5. Plate                             +SPREAD×1
 *   4. Emission strips                   +SPREAD×0.3
 *   3. PCB                               -SPREAD×1
 *   2. Case (Top_Case)                   -SPREAD×2
 *   1. Weight                            -SPREAD×3  ← same magnitude as keycaps
 *
 * EXPLODE:  inside-out (Plate+PCB crack open first, Keycaps+Weight LAST)
 * REASSEMBLE (sandwich): fills first, bread closes LAST simultaneously
 *   Step1: PCB + Emission  Step2: Plate  Step3: Case  Step4: Switches
 *   Step5: Keycaps + Weight (bread lid drops + base rises simultaneously)
 */
import { useRef, useEffect } from 'react'
import { useFrame }           from '@react-three/fiber'
import * as THREE             from 'three'
import gsap                   from 'gsap'
import ClonedKeyboard         from './ClonedKeyboard'

const SPREAD = 0.055   // local per gap (×17 = 0.935 world — perfectly spaced on screen)

const LAYER_DEFS = [
  // 0 = TOP
  { id: 'keycaps',  delta: +SPREAD * 3,    color: '#e0e8ff', matchMesh: n => n.startsWith('K_') || n === 'Knob' || n === 'Screen' },
  { id: 'switches', delta: +SPREAD * 2,    color: '#cc44ff', matchGroup: 'Switches_Positions' },
  { id: 'plate',    delta: +SPREAD * 1,    color: '#8899cc', matchMesh: n => n === 'Plate' },
  { id: 'emission', delta: +SPREAD * 0.3,  color: '#00ffcc', matchMesh: n => n.toLowerCase().includes('emission') },
  { id: 'pcb',      delta: -SPREAD * 1,    color: '#22dd88', matchMesh: n => n === 'PCB' },
  { id: 'case',     delta: -SPREAD * 2,    color: '#a0b8cc', matchMesh: n => n === 'Top_Case' },
  // 6 = BOTTOM
  { id: 'weight',   delta: -SPREAD * 3,    color: '#b87333', matchMesh: n => n === 'Weight' },
]

const REASSEMBLE_STEPS = [
  ['pcb', 'emission'],
  ['plate'],
  ['case'],
  ['switches'],
  ['keycaps', 'weight'],   // bread closes last
]
const STEP_DELAY = 0.38

function CameraRig({ phaseRef }) {
  useFrame(({ camera }) => {
    const exploded = phaseRef.current === 'explode' || phaseRef.current === 'exploded'
    const tx = 0.4,  ty = exploded ? 3.5 : 2.0,  tz = exploded ? 11.0 : 5.8
    camera.position.x += (tx - camera.position.x) * 0.025
    camera.position.y += (ty - camera.position.y) * 0.025
    camera.position.z += (tz - camera.position.z) * 0.025
    camera.lookAt(0, 0.2, 0)
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

  // Slow Y rotation — PAUSED during explode hold for clean layer visibility
  useFrame((_, delta) => {
    if (rotRef.current) {
      const target = (phaseRef.current === 'exploded') ? 0 : 0.08
      rotSpeedRef.current += (target - rotSpeedRef.current) * 0.03
      rotRef.current.rotation.y += delta * rotSpeedRef.current
    }
  })

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    // ── Collect objects per layer ────────────────────────────────────────
    // layerObjs[i] = array of Three.js objects (meshes OR groups) to move
    const layerObjs = LAYER_DEFS.map(() => [])
    const layerIdx  = {}
    LAYER_DEFS.forEach((def, i) => { layerIdx[def.id] = i })

    // First pass: find the Switches_Positions group
    groupRef.current.traverse(obj => {
      const switchDefIdx = LAYER_DEFS.findIndex(d => d.matchGroup && obj.name === d.matchGroup)
      if (switchDefIdx !== -1) {
        obj.userData.origY = obj.position.y
        layerObjs[switchDefIdx].push(obj)
      }
    })

    // Second pass: meshes (skip children of Switches_Positions)
    groupRef.current.traverse(child => {
      if (!child.isMesh) return
      // Skip meshes inside Switches_Positions (they move with their group)
      let ancestor = child.parent
      let isInsideSwitches = false
      while (ancestor && ancestor !== groupRef.current) {
        if (ancestor.name === 'Switches_Positions') { isInsideSwitches = true; break }
        ancestor = ancestor.parent
      }
      if (isInsideSwitches) return

      child.userData.origY = child.position.y

      for (let i = 0; i < LAYER_DEFS.length; i++) {
        const def = LAYER_DEFS[i]
        if (def.matchMesh && def.matchMesh(child.name)) {
          layerObjs[i].push(child)
          return
        }
      }
    })

    // ── Build cycle ──────────────────────────────────────────────────────
    function buildCycle() {
      tlRef.current?.kill()
      const tl = gsap.timeline({ onComplete: buildCycle })
      tlRef.current = tl

      // ── PHASE 1: EXPLODE (inside-out, outmost last) ────────────────────
      phaseRef.current = 'explode'
      const explodeGroups = [
        { ids: ['plate', 'pcb'],        t: 0.00, dur: 0.55 },
        { ids: ['emission', 'case'],    t: 0.12, dur: 0.55 },
        { ids: ['switches'],            t: 0.22, dur: 0.55 },
        { ids: ['keycaps', 'weight'],   t: 0.38, dur: 0.70 },  // outermost = dramatic
      ]

      explodeGroups.forEach(({ ids, t, dur }) => {
        ids.forEach(id => {
          const idx  = layerIdx[id]
          const def  = LAYER_DEFS[idx]
          const objs = layerObjs[idx]
          const C    = new THREE.Color(def.color)

          objs.forEach(obj => {
            tl.to(obj.position, { y: obj.userData.origY + def.delta, duration: dur, ease: 'power3.inOut' }, t)
            // Emissive glow only on mesh materials
            if (obj.isMesh && obj.material) {
              tl.to(obj.material, {
                emissiveIntensity: 0.28,
                duration: 0.42,
                onStart() { if (obj.material.emissive) obj.material.emissive.copy(C) },
              }, t + 0.18)
            } else {
              // Traverse children for glow on the switches group
              obj.traverse(child => {
                if (child.isMesh && child.material) {
                  tl.to(child.material, {
                    emissiveIntensity: 0.28,
                    duration: 0.42,
                    onStart() { if (child.material.emissive) child.material.emissive.set(def.color) },
                  }, t + 0.18)
                }
              })
            }
          })
        })
      })

      // ── PHASE 2: HOLD EXPLODED ─────────────────────────────────────────
      const holdStart = 0.75
      tl.call(() => { phaseRef.current = 'exploded' }, null, holdStart)
      tl.to({}, { duration: 3.0 }, holdStart)

      // ── PHASE 3: REASSEMBLE — sandwich style ──────────────────────────
      const rStart = holdStart + 3.0
      tl.call(() => { phaseRef.current = 'assemble' }, null, rStart)

      REASSEMBLE_STEPS.forEach((stepIds, si) => {
        const st     = rStart + si * STEP_DELAY
        const isLast = si === REASSEMBLE_STEPS.length - 1

        stepIds.forEach(id => {
          const idx  = layerIdx[id]
          const objs = layerObjs[idx]

          objs.forEach(obj => {
            tl.to(obj.position, {
              y: obj.userData.origY,
              duration: isLast ? 0.60 : 0.42,
              ease:     isLast ? 'back.out(1.2)' : 'expo.out',
            }, st)

            // Kill glow
            if (obj.isMesh && obj.material) {
              tl.to(obj.material, { emissiveIntensity: 0, duration: 0.28 }, st + (isLast ? 0.55 : 0.38))
            } else {
              obj.traverse(child => {
                if (child.isMesh && child.material) {
                  tl.to(child.material, { emissiveIntensity: 0, duration: 0.28 }, st + (isLast ? 0.55 : 0.38))
                }
              })
            }
          })
        })
      })

      // Hard-reset all Y values to prevent float accumulation
      const doneTime = rStart + REASSEMBLE_STEPS.length * STEP_DELAY + 0.65
      tl.call(() => {
        const resetObjs = (obj) => {
          if ('origY' in (obj.userData ?? {})) obj.position.y = obj.userData.origY
          if (obj.isMesh && obj.material?.emissiveIntensity !== undefined)
            obj.material.emissiveIntensity = 0
        }
        groupRef.current?.traverse(resetObjs)
        // Also reset the switches group itself
        layerObjs[layerIdx['switches']]?.forEach(g => {
          g.position.y = g.userData.origY
          g.traverse(c => { if (c.isMesh && c.material) c.material.emissiveIntensity = 0 })
        })
        phaseRef.current = 'hold'
      }, null, doneTime)

      tl.to({}, { duration: 1.8 }, doneTime)
    }

    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.18} />
      <spotLight position={[0, 10, 2]} angle={0.40} penumbra={0.65} intensity={3.5} castShadow color="#ffffff" />
      <pointLight position={[0,  6, 5]} intensity={1.6} color="#00ffcc" />
      <pointLight position={[0, -6, 5]} intensity={1.4} color="#b87333" />
      <pointLight position={[-8, 0, 2]} intensity={1.0} color="#8899cc" />
      <pointLight position={[8,  1, 2]} intensity={1.0} color="#cc44ff" />
      <CameraRig phaseRef={phaseRef} />
      <group ref={rotRef}>
        <group ref={groupRef} scale={17} rotation={[0.28, 0, 0]}>
          <ClonedKeyboard />
        </group>
      </group>
    </>
  )
}
