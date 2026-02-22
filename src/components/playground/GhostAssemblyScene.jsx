/**
 * Genesis — Born from Darkness  (v3 — Looping)
 *
 * LOOP: after the full assembly + gold scan + 2s admire pause,
 * all keycaps fade OUT while slowly floating up to their start
 * positions then the whole sequence replays from scratch.
 *
 * ANIMATION:
 *  • Pitch-black scene with tight overhead spot
 *  • Keys appear invisible, pre-spun, high above the board
 *  • Column-by-column: fall + spin-decelerate simultaneously
 *  • bounce.out on position, power2.out on rotation → Y spin slows
 *    before the bounce completes = coin landing physics
 *  • Teal flash on impact (0.85 intensity)
 *  • Gold scan-line L→R after assembly
 *  • 2s admire hold → keys fade+float back up → loop
 */
import { useRef, useEffect } from 'react'
import { useFrame }           from '@react-three/fiber'
import * as THREE             from 'three'
import gsap                   from 'gsap'
import ClonedKeyboard         from './ClonedKeyboard'
import { KEYBOARD_COLUMNS, buildMeshMap, resolveLayout } from './keyboardLayout'

const DROP_HEIGHT  = 1.20    // local (×17 = 20.4 world — dramatic sky-fall)
const FALL_DUR     = 0.80    // seconds per key
const COL_STAGGER  = 0.110   // 16 cols × 0.110 = 1.76s spread
const ROW_STAGGER  = 0.018   // within each column
const SPIN_REVS    = 3.0     // 1080° during fall
const SCAN_DUR     = 2.2     // gold scan
const ADMIRE_DUR   = 2.0     // hold assembled
const FADEOUT_DUR  = 1.0     // keys float back up / fade

function CameraRig({ phaseRef }) {
  const elapsed = useRef(0)
  useFrame(({ camera }, delta) => {
    elapsed.current += delta
    const phase = phaseRef.current
    let tx, ty, tz

    if (phase === 'idle') {
      // Tight close-up before assembly starts
      tx = 0.8; ty = 0.8; tz = 3.0
    } else if (phase === 'assembling') {
      // Slow pull-back as columns arrive
      const sway = Math.sin(elapsed.current * 0.12) * 0.3
      tx = 0.6 + sway; ty = 1.8; tz = 5.5
    } else {
      // Admire & scan: gentle sway
      const sway = Math.sin(elapsed.current * 0.04) * 0.4
      tx = sway; ty = 2.0; tz = 5.5
    }

    camera.position.x += (tx - camera.position.x) * 0.012
    camera.position.y += (ty - camera.position.y) * 0.012
    camera.position.z += (tz - camera.position.z) * 0.012
    camera.lookAt(0, 0.2, 0)
  })
  return null
}

export default function GenesisScene() {
  const groupRef     = useRef()
  const collectedRef = useRef(false)
  const tlRef        = useRef(null)
  const phaseRef     = useRef('idle')

  useEffect(() => () => tlRef.current?.kill(), [])

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    const meshMap  = buildMeshMap(groupRef.current)
    const columns  = resolveLayout(KEYBOARD_COLUMNS, meshMap)

    // Non-keycap structural meshes (case, plate, PCB…)
    const structs = []
    groupRef.current.traverse(child => {
      if (child.isMesh && !child.name.startsWith('K_') &&
          !child.name.toLowerCase().includes('emission')) {
        child.material.transparent = true
        child.material.opacity     = 0
        structs.push(child)
      }
    })

    const allKeycaps = columns.flat()
    const goldColor  = new THREE.Color('#ffcc44')

    const tealColor  = new THREE.Color('#00ffaa')

    // ── Helpers ──────────────────────────────────────────────────────────
    function resetKeycaps() {
      allKeycaps.forEach(mesh => {
        mesh.material.opacity      = 0
        mesh.material.emissiveIntensity = 0
        mesh.material.emissive.copy(tealColor)
        mesh.position.y  = mesh.userData.origY + DROP_HEIGHT
        mesh.rotation.y  = mesh.userData.origRotY + Math.PI * 2 * SPIN_REVS
      })
    }

    function resetStructs(opacity = 0) {
      structs.forEach(m => { m.material.opacity = opacity })
    }

    // Store originals on first pass
    allKeycaps.forEach(mesh => {
      mesh.userData.origY    = mesh.position.y
      mesh.userData.origRotY = mesh.rotation.y
      mesh.material.transparent = true
      mesh.material.opacity     = 0
      mesh.material.emissive    = tealColor.clone()
      mesh.material.emissiveIntensity = 0
    })
    resetKeycaps()

    // ── Main cycle ───────────────────────────────────────────────────────
    function buildCycle() {
      tlRef.current?.kill()
      const tl = gsap.timeline()
      tlRef.current = tl

      phaseRef.current = 'idle'

      // Phase 0: Case silhouette materialises from darkness
      structs.forEach(m => {
        tl.to(m.material, { opacity: 0.30, duration: 0.9, ease: 'power1.inOut' }, 0.2)
      })

      // Phase 1: Column-by-column key FALL + SPIN
      let lastKeyTime = 0
      phaseRef.current = 'assembling'
      columns.forEach((colMeshes, colIdx) => {
        colMeshes.forEach((mesh, rowIdx) => {
          const t = 0.5 + colIdx * COL_STAGGER + rowIdx * ROW_STAGGER
          lastKeyTime = Math.max(lastKeyTime, t + FALL_DUR)

          tl.to(mesh.material, { opacity: 1, duration: 0.04 }, t)
          tl.to(mesh.position, { y: mesh.userData.origY, duration: FALL_DUR, ease: 'bounce.out' }, t)
          tl.to(mesh.rotation, { y: mesh.userData.origRotY, duration: FALL_DUR, ease: 'power2.out' }, t)
          // Impact flash
          tl.to(mesh.material, { emissiveIntensity: 0.85, duration: 0.04 }, t + FALL_DUR * 0.88)
          tl.to(mesh.material, { emissiveIntensity: 0,    duration: 0.90 }, t + FALL_DUR * 0.92)
        })
      })

      // Phase 2: Case fully opaque
      structs.forEach(m => {
        tl.to(m.material, { opacity: 1, duration: 0.5 }, lastKeyTime + 0.2)
      })

      // Phase 3: Gold scan L→R
      const scanStart = lastKeyTime + 0.6
      tl.call(() => { phaseRef.current = 'assembled' }, null, scanStart)
      columns.forEach((colMeshes, colIdx) => {
        const t = scanStart + (colIdx / columns.length) * SCAN_DUR
        colMeshes.forEach(mesh => {
          tl.to(mesh.material, {
            emissiveIntensity: 0.45,
            duration: 0.08,
            onStart() { mesh.material.emissive.copy(goldColor) },
          }, t)
          tl.to(mesh.material, {
            emissiveIntensity: 0,
            duration: 0.65,
            onComplete() { mesh.material.emissive.copy(tealColor) },
          }, t + 0.08)
        })
      })

      // Phase 4: Admire assembled board
      const admireStart = scanStart + SCAN_DUR + 0.2
      tl.to({}, { duration: ADMIRE_DUR }, admireStart)

      // Phase 5: Fade out keycaps + float back up → then restart
      const fadeStart = admireStart + ADMIRE_DUR
      allKeycaps.forEach(mesh => {
        tl.to(mesh.material, { opacity: 0, duration: FADEOUT_DUR, ease: 'power2.in' }, fadeStart)
        // Float back up slightly as they dematerialise
        tl.to(mesh.position, {
          y: mesh.userData.origY + DROP_HEIGHT * 0.15,   // float up 15% of full height
          duration: FADEOUT_DUR,
          ease: 'power2.in',
        }, fadeStart)
      })
      structs.forEach(m => {
        tl.to(m.material, { opacity: 0, duration: FADEOUT_DUR * 0.8, ease: 'power2.in' }, fadeStart)
      })

      // After fadeout: hard-reset and restart
      tl.call(() => {
        resetKeycaps()
        resetStructs(0)
        setTimeout(buildCycle, 200)   // brief pause then loop
      }, null, fadeStart + FADEOUT_DUR + 0.1)
    }

    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.04} />
      <spotLight
        position={[0, 9, 2]}
        angle={0.26}
        penumbra={0.70}
        intensity={6.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#d0eaff"
      />
      <spotLight
        position={[-7, 4, -4]}
        angle={0.50}
        penumbra={0.95}
        intensity={1.0}
        color="#1122ff"
      />
      <directionalLight position={[4, 2, 4]} intensity={0.3} color="#fff5e0" />
      <CameraRig phaseRef={phaseRef} />
      <group ref={groupRef} scale={17} rotation={[0.40, 0, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
