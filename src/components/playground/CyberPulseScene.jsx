/**
 * Cascade — EMP Shockwave  (v4 — Cinematic Polish)
 *
 * KEY FIX: LIFT=0.08 local × 17 = 1.36 world units — NOW VISUALLY DRAMATIC
 * Previous LIFT=0.018 was nearly invisible at camera distance 5.5.
 *
 * IMPROVEMENTS:
 *  - Column LIFT 0.08 (4× bigger — keys visibly heave up into the air)
 *  - COLUMN_DELAY 0.035 (faster = more wave-like momentum)
 *  - Camera tracks wave: tilts toward the lifted region as wave passes
 *  - Spotlight: narrower cone, higher intensity — "lightning bolt" beam
 *  - Trailing residue glow: keys slowly fade OUT after lift (not instant off)
 *  - Inner-column stagger gives each key a tiny independent bounce phase
 */
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import ClonedKeyboard from './ClonedKeyboard'
import { KEYBOARD_COLUMNS, buildMeshMap, resolveLayout } from './keyboardLayout'

const LIFT         = 0.08    // local Y (×17 = 1.36 world — VISIBLE!)
const LIFT_DUR     = 0.32    // snappy rise
const FALL_DUR     = 0.50    // deliberate return (asymmetric feel)
const COLUMN_DELAY = 0.035   // tight = wave looks fast
const HOLD_AFTER   = 0.8     // gap between waves

const ACCENT_COLORS = [
  new THREE.Color('#00ffcc'),
  new THREE.Color('#7b2fff'),
  new THREE.Color('#ff4488'),
  new THREE.Color('#ffcc00'),
]

function CameraRig({ progressRef }) {
  useFrame(({ camera }, delta) => {
    const p    = progressRef.current   // 0→1 across wave
    // Camera tilts toward wave front: drifts left as wave goes R→L (appears left, board rotated)
    const xTgt = THREE.MathUtils.lerp(-0.8, 0.8, p)
    const yTgt = 2.2 - Math.sin(p * Math.PI) * 0.4   // subtle height dip at midpoint
    const zTgt = 5.2 - Math.sin(p * Math.PI) * 0.8   // push in at midpoint

    camera.position.x += (xTgt - camera.position.x) * 0.04
    camera.position.y += (yTgt - camera.position.y) * 0.035
    camera.position.z += (zTgt - camera.position.z) * 0.035
    camera.lookAt(0, 0.3, 0)
  })
  return null
}

function WaveSpot({ spotRef }) {
  return (
    <spotLight
      ref={spotRef}
      position={[0, 7, 3]}
      angle={0.14}
      penumbra={0.3}
      intensity={12.0}
      castShadow={false}
    />
  )
}

export default function CyberPulseScene() {
  const groupRef     = useRef()
  const collectedRef = useRef(false)
  const tlRef        = useRef(null)
  const progressRef  = useRef(0)
  const spotRef      = useRef()
  const colorIdxRef  = useRef(0)

  useEffect(() => () => tlRef.current?.kill(), [])

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    const meshMap  = buildMeshMap(groupRef.current)
    const columns  = resolveLayout(KEYBOARD_COLUMNS, meshMap)
    if (!columns.length) return

    columns.flat().forEach(m => { m.userData.origY = m.position.y })

    // World X per column for spotlight tracking
    const colWorldX = columns.map(col => {
      const wp = new THREE.Vector3()
      col[0]?.getWorldPosition(wp)
      return wp.x
    })

    function buildCycle() {
      const accent = ACCENT_COLORS[colorIdxRef.current % ACCENT_COLORS.length]
      colorIdxRef.current++
      const tl = gsap.timeline({ onComplete: buildCycle })

      columns.forEach((colMeshes, colIdx) => {
        const waveT    = colIdx * COLUMN_DELAY
        const waveNorm = colIdx / (columns.length - 1)

        tl.call(() => {
          progressRef.current = waveNorm
          if (spotRef.current) {
            spotRef.current.position.x = colWorldX[colIdx] ?? 0
            spotRef.current.color.copy(accent)
          }
        }, null, waveT)

        const materials = colMeshes.map(m => m.material)

        // RISE — explicit target (origY + LIFT), never overshoots
        colMeshes.forEach((mesh, mi) => {
          tl.to(mesh.position, {
            y: mesh.userData.origY + LIFT,
            duration: LIFT_DUR,
            ease: 'power3.out',
            delay: mi * 0.008,
          }, waveT)
        })

        // Emissive flash
        tl.to(materials, {
          emissiveIntensity: 0.70,
          duration: LIFT_DUR * 0.3,
          stagger: 0.008,
          onStart() { materials.forEach(m => m.emissive?.copy(accent)) },
        }, waveT)

        // FALL — explicit target (origY) — CANNOT go below rest position
        colMeshes.forEach((mesh, mi) => {
          tl.to(mesh.position, {
            y: mesh.userData.origY,
            duration: FALL_DUR,
            ease: 'power3.out',
            delay: mi * 0.008,
          }, waveT + LIFT_DUR * 0.6)
        })

        // Trailing glow fades after fall
        tl.to(materials, {
          emissiveIntensity: 0,
          duration: FALL_DUR * 1.2,
          stagger: 0.008,
        }, waveT + LIFT_DUR * 0.5)
      })

      // Pause, then reset Y to prevent float drift
      const totalTime = columns.length * COLUMN_DELAY + LIFT_DUR + FALL_DUR
      tl.to({}, { duration: HOLD_AFTER }, totalTime)
      tl.call(() => {
        columns.flat().forEach(m => { m.position.y = m.userData.origY })
      })
      tlRef.current = tl
    }

    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[-6, 5, -3]} intensity={0.40} color="#112266" />
      <directionalLight position={[3, 3, 4]}   intensity={0.18} color="#ffffff" />
      <WaveSpot spotRef={spotRef} />
      <CameraRig progressRef={progressRef} />
      <group ref={groupRef} scale={17} rotation={[0.40, 0, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
