/**
 * Resonance — Circular Ripple  (Row-Based v3)
 *
 * Uses KEYBOARD_ROWS from keyboardLayout.js to create a ripple that expands
 * row by row from the keyboard centre (row 3/4) outward in BOTH directions,
 * then collapses back. This is the "drop a stone in the keyboard" effect.
 *
 * Row animation using the same y += / y -= GSAP approach from the user's snippet.
 * Row order is symmetric from middle: 3,4 → 2,5 → 1,6 → out and back.
 *
 * Color shift: each lifted row transitions cold→warm (blue→gold) based on its
 * displacement, with zero emissive at rest.
 */
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import ClonedKeyboard from './ClonedKeyboard'
import { KEYBOARD_ROWS, buildMeshMap, resolveLayout } from './keyboardLayout'

// ─── TUNING ─────────────────────────────────────────────────────────────────
const LIFT     = 0.016   // local Y lift per row (×17 = 0.27 world units)
const RISE_DUR = 0.42    // seconds rise
const FALL_DUR = 0.55    // seconds fall (asymmetric — slower return feels heavier)
const ROW_DELAY = 0.09   // seconds between adjacent rows expanding outward
const HOLD      = 1.8    // hold at rest between full cycles
const PEAK_HUE  = new THREE.Color('#ffcc44')
const REST_HUE  = new THREE.Color('#334466')

// ─── CAMERA ─────────────────────────────────────────────────────────────────
function CameraRig() {
  const elapsed = useRef(0)
  useFrame(({ camera }, delta) => {
    elapsed.current += delta
    const t     = elapsed.current
    const cycle = t % 24
    const phase = Math.min(1, cycle / 12)
    const eased = 1 - Math.pow(1 - phase, 2.5)

    // Start top-down, tilt to classic 3/4 product view
    camera.position.x = THREE.MathUtils.lerp(0.3, 0.8, eased)
    camera.position.y = THREE.MathUtils.lerp(7.5, 2.8, eased)
    camera.position.z = THREE.MathUtils.lerp(3.0, 6.0, eased)
    camera.lookAt(0, 0.1, 0)
  })
  return null
}

// ─── MAIN SCENE ─────────────────────────────────────────────────────────────
export default function ResonanceScene() {
  const groupRef     = useRef()
  const collectedRef = useRef(false)
  const tlRef        = useRef(null)

  useEffect(() => () => tlRef.current?.kill(), [])

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    const meshMap = buildMeshMap(groupRef.current)
    const rows    = resolveLayout(KEYBOARD_ROWS, meshMap)

    if (!rows.length) return

    // Store original Y
    rows.flat().forEach(m => {
      m.userData.origY = m.position.y
      m.material.emissive = new THREE.Color(0, 0, 0)
      m.material.emissiveIntensity = 0
    })

    // Build ripple sequence: rows expand symmetrically from centre
    // rows index: 0=fn, 1=numbers, 2=QWERTY, 3=homeRow, 4=ZXCV, 5=modifiers
    // Centre = between row 2 and 3 (QWERTY / homeRow)
    // Expand order (by distance from centre):
    //   step 0: rows 2 & 3  (distance 0)
    //   step 1: rows 1 & 4  (distance 1)
    //   step 2: rows 0 & 5  (distance 2)
    const expandOrder = [
      [2, 3],   // closest to centre
      [1, 4],
      [0, 5],   // furthest
    ]

    function buildCycle() {
      const tl = gsap.timeline({ onComplete: buildCycle })

      expandOrder.forEach((rowPair, step) => {
        const t = step * ROW_DELAY

        rowPair.forEach(rowIdx => {
          const rowMeshes = rows[rowIdx]
          if (!rowMeshes || !rowMeshes.length) return

          const positions  = rowMeshes.map(m => m.position)
          const materials  = rowMeshes.map(m => m.material)

          // Within-row stagger: left-to-right for top rows, right-to-left for bottom
          const stagger = rowIdx <= 2 ? 0.006 : -0.006

          // Rise with golden glow
          tl.to(positions, {
            y:        `+=${LIFT}`,
            duration: RISE_DUR,
            ease:     'power2.out',
            stagger,
          }, t)

          tl.to(materials, {
            emissiveIntensity: 0.40,
            duration: RISE_DUR * 0.5,
            stagger,
            onStart() {
              materials.forEach(mat => mat.emissive.copy(PEAK_HUE))
            },
          }, t)

          // Color return during fall
          tl.to(materials, {
            emissiveIntensity: 0,
            duration: FALL_DUR * 0.7,
            stagger,
          }, t + RISE_DUR * 0.6)

          // Fall — slightly slower, asymmetric
          tl.to(positions, {
            y:        `-=${LIFT}`,
            duration: FALL_DUR,
            ease:     'power2.inOut',
            stagger,
          }, t + RISE_DUR * 0.8)
        })
      })

      // Rest + hard reset (prevent float drift)
      const totalRise = expandOrder.length * ROW_DELAY + RISE_DUR + FALL_DUR
      tl.to({}, { duration: HOLD }, totalRise)
      tl.call(() => {
        rows.flat().forEach(m => { m.position.y = m.userData.origY })
      }, null, totalRise + HOLD)

      tlRef.current = tl
    }

    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.18} />
      <spotLight
        position={[0, 8, 1]}
        angle={0.44}
        penumbra={0.6}
        intensity={4.0}
        castShadow
        color="#d8eeff"
      />
      <directionalLight position={[-5, 3, -4]} intensity={0.45} color="#2244aa" />
      <directionalLight position={[3, 1, 5]}   intensity={0.25} color="#ffe8cc" />
      <CameraRig />
      <group ref={groupRef} scale={17} rotation={[0.28, 0.18, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
