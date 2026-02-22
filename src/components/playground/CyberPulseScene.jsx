/**
 * Cascade — EMP Shockwave  (Column-Based Wave v3)
 *
 * Uses the EXACT column layout from keyboardLayout.js — the same named-mesh
 * approach from the user's animation snippet, but as a looping time animation
 * instead of a ScrollTrigger.
 *
 * Each physical column (L→R) gets:
 *   1. Keycaps lift  y += LIFT  with power2.inOut
 *   2. Keycaps fall  y -= LIFT  (return to original)
 *   3. (A spotlight tracks the wave front in world space for lighting drama)
 *
 * Wave timing: the peak of each column = columnIndex * COLUMN_DELAY.
 * Total cycle ≈ NUM_COLS * COLUMN_DELAY + LIFT_DUR + FALL_DUR + HOLD
 */
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import ClonedKeyboard from './ClonedKeyboard'
import { KEYBOARD_COLUMNS, buildMeshMap, resolveLayout } from './keyboardLayout'

// ─── TUNING ─────────────────────────────────────────────────────────────────
const LIFT        = 0.018   // local Y lift (×17 scale ≈ 0.31 world units)
const LIFT_DUR    = 0.40    // seconds to complete rise
const FALL_DUR    = 0.38    // seconds to complete return
const COLUMN_DELAY = 0.055  // seconds between adjacent column peaks (wave speed)
const HOLD_AFTER  = 1.4     // pause at end before next cycle

const ACCENT_COLORS = ['#00ffcc', '#7b2fff', '#ff4488']

// ─── CAMERA ─────────────────────────────────────────────────────────────────
function CameraRig({ progressRef }) {
  useFrame(({ camera }) => {
    const p    = progressRef.current           // 0 → 1 across wave
    const zTgt = 5.8 - Math.sin(p * Math.PI) * 1.0
    camera.position.x += (0.7    - camera.position.x) * 0.02
    camera.position.y += (2.2    - camera.position.y) * 0.02
    camera.position.z += (zTgt   - camera.position.z) * 0.02
    camera.lookAt(0, 0.2, 0)
  })
  return null
}

// ─── WAVE SPOTLIGHT ─────────────────────────────────────────────────────────
function WaveSpot({ spotRef }) {
  return (
    <spotLight
      ref={spotRef}
      position={[0, 5, 2]}
      angle={0.22}
      penumbra={0.55}
      intensity={7.0}
      castShadow={false}
    />
  )
}

// ─── MAIN SCENE ─────────────────────────────────────────────────────────────
export default function CyberPulseScene() {
  const groupRef     = useRef()
  const collectedRef = useRef(false)
  const tlRef        = useRef(null)
  const progressRef  = useRef(0)
  const spotRef      = useRef()
  const colorIdxRef  = useRef(0)

  useEffect(() => () => tlRef.current?.kill(), [])

  // Resolve columns once after mount, then kick off the GSAP loop
  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    const meshMap  = buildMeshMap(groupRef.current)
    const columns  = resolveLayout(KEYBOARD_COLUMNS, meshMap)

    if (!columns.length) return

    // Store each mesh's original Y so we can always reset cleanly
    columns.flat().forEach(mesh => {
      mesh.userData.origY = mesh.position.y
    })

    // Build world-X offsets for spotlight tracking
    // (only needs to be computed once)
    const colWorldX = columns.map(col => {
      if (!col.length) return 0
      const wp = new THREE.Vector3()
      col[0].getWorldPosition(wp)
      return wp.x
    })
    const minWX = Math.min(...colWorldX)
    const maxWX = Math.max(...colWorldX)

    function buildCycle() {
      const accentHex = ACCENT_COLORS[colorIdxRef.current % ACCENT_COLORS.length]
      const accent    = new THREE.Color(accentHex)
      colorIdxRef.current++

      const tl = gsap.timeline({ onComplete: buildCycle })

      columns.forEach((colMeshes, colIdx) => {
        const waveT       = colIdx * COLUMN_DELAY
        const waveNorm    = colIdx / (columns.length - 1)     // 0→1

        // Move spotlight to this column's world X at peak
        tl.call(() => {
          progressRef.current = waveNorm
          if (spotRef.current) {
            const wx = colWorldX[colIdx] ?? 0
            spotRef.current.position.x = wx
            spotRef.current.color.copy(accent)
          }
        }, null, waveT)

        // Lift all keycaps in this column
        const positions = colMeshes.map(m => m.position)
        tl.to(positions, {
          y:        `+=${LIFT}`,
          duration: LIFT_DUR,
          ease:     'power2.inOut',
          stagger:  0.008,           // tiny row stagger within column for organic feel
        }, waveT)

        // Emissive flash on the rise
        const materials = colMeshes.map(m => m.material)
        tl.to(materials, {
          emissiveIntensity: 0.50,
          duration: LIFT_DUR * 0.4,
          stagger:  0.008,
          onStart() { materials.forEach(mat => mat.emissive.copy(accent)) },
        }, waveT)

        // Return keycaps to original position
        tl.to(positions, {
          y:        `-=${LIFT}`,
          duration: FALL_DUR,
          ease:     'power2.inOut',
          stagger:  0.008,
        }, waveT + LIFT_DUR * 0.7)

        // Fade emissive
        tl.to(materials, {
          emissiveIntensity: 0,
          duration: FALL_DUR * 0.8,
          stagger:  0.008,
        }, waveT + LIFT_DUR * 0.7)
      })

      // Hold at end before looping
      tl.to({}, { duration: HOLD_AFTER })

      // Hard-reset Y values to origY so floating point drift can't accumulate
      tl.call(() => {
        columns.flat().forEach(m => { m.position.y = m.userData.origY })
      })

      tlRef.current = tl
    }

    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[-5, 6, -4]} intensity={0.35} color="#1133aa" />
      <directionalLight position={[3, 3, 4]}   intensity={0.22} />
      <WaveSpot spotRef={spotRef} />
      <CameraRig progressRef={progressRef} />
      <group ref={groupRef} scale={17} rotation={[0.28, 0.18, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
