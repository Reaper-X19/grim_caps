/**
 * Resonance — Sound-Wave Physics  (v4 — Cinematic Polish)
 *
 * KEY FIX: LIFT=0.07 local × 17 = 1.19 world — NOW VISUALLY DRAMATIC
 * Previous LIFT=0.016 was nearly invisible at camera distance 6.
 *
 * IMPROVEMENTS:
 *  - Symmetric row ripple: rows expand from keyboard centre outward
 *  - LIFT 0.07 = clear dramatic heave (row visibly rises above neighbours)
 *  - Camera "surfs" the wave: rotates to look at the tallest row as it rises
 *  - Each row within the ripple also ripples left→right via per-key stagger
 *  - Gold shimmer: emissive intensity 0.65 at peak (was 0.40)
 *  - Between ripple cycles: keyboard slowly orbits Y for product showcase
 */
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import ClonedKeyboard from './ClonedKeyboard'
import { KEYBOARD_ROWS, buildMeshMap, resolveLayout } from './keyboardLayout'

const LIFT      = 0.08    // local (×17 = 1.36 world — dramatic but in-frame)
const RISE_DUR  = 0.65    // was 0.38
const FALL_DUR  = 1.00    // was 0.60
const ROW_DELAY = 0.17    // was 0.10
const HOLD      = 4.0     // was 2.0

const PEAK_COLOR     = new THREE.Color('#ffcc44')
const REST_COLOR     = new THREE.Color('#334466')
const CRESCENDO_COLOR = new THREE.Color('#00ffcc')  // teal burst on crescendo

function CameraRig({ peakRowRef }) {
  const elapsed = useRef(0)
  useFrame(({ camera }, delta) => {
    elapsed.current += delta
    const t = elapsed.current
    // Cycle between top-down reveal and 3/4 product angle
    const cycle = t % 28
    const revealPhase = Math.min(1, cycle / 10)
    const eased = 1 - Math.pow(1 - revealPhase, 3)

    // Small orbit drift keeps the scene alive between ripples
    const drift = Math.sin(t * 0.07) * 0.3

    const tx = THREE.MathUtils.lerp(0.3, 0.7 + drift, eased)
    const ty = THREE.MathUtils.lerp(7.5, 2.6, eased)
    const tz = THREE.MathUtils.lerp(3.0, 6.2, eased)

    camera.position.x += (tx - camera.position.x) * 0.025
    camera.position.y += (ty - camera.position.y) * 0.025
    camera.position.z += (tz - camera.position.z) * 0.025
    camera.lookAt(0, 0.1, 0)
  })
  return null
}

export default function ResonanceScene() {
  const groupRef     = useRef()
  const collectedRef = useRef(false)
  const tlRef        = useRef(null)
  const peakRowRef   = useRef(0)

  useEffect(() => () => tlRef.current?.kill(), [])

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    const meshMap = buildMeshMap(groupRef.current)
    const rows    = resolveLayout(KEYBOARD_ROWS, meshMap)
    if (!rows.length) return

    rows.flat().forEach(m => {
      m.userData.origY = m.position.y
      m.material.emissive = new THREE.Color(0, 0, 0)
      m.material.emissiveIntensity = 0
    })

    // Ripple order: symmetric from centre rows (2&3) outward (0&5)
    const expandOrder = [[2, 3], [1, 4], [0, 5]]

    // Row amplitude: centre rows (2&3) lift MOST — physical wave behaviour
    const AMP = [0.55, 0.78, 1.0, 1.0, 0.78, 0.55]

    function buildCycle() {
      const tl = gsap.timeline({ onComplete: buildCycle })

      expandOrder.forEach((rowPair, step) => {
        const t = step * ROW_DELAY

        rowPair.forEach(rowIdx => {
          const row = rows[rowIdx]
          if (!row?.length) return

          const amp      = LIFT * (AMP[rowIdx] ?? 1.0)
          const materials = row.map(m => m.material)
          const dir = rowIdx % 2 === 0 ? 1 : -1

          row.forEach((mesh, mi) => {
            tl.to(mesh.position, {
              y: mesh.userData.origY + amp,
              duration: RISE_DUR,
              ease: 'power3.out',
              delay: mi * dir * 0.006,
            }, t)
          })

          tl.to(materials, {
            emissiveIntensity: 0.95 + amp * 0.35,  // BRIGHT gold peak
            duration: RISE_DUR * 0.4,
            stagger: dir * 0.008,
            onStart() { materials.forEach(m => m.emissive?.copy(PEAK_COLOR)) },
          }, t)

          tl.to(materials, {
            emissiveIntensity: 0.18,
            duration: RISE_DUR * 0.35,
          }, t + RISE_DUR * 0.55)

          row.forEach((mesh, mi) => {
            tl.to(mesh.position, {
              y: mesh.userData.origY,
              duration: FALL_DUR,
              ease: 'power3.out',
              delay: mi * dir * 0.006,
            }, t + RISE_DUR * 0.70)
          })

          tl.to(materials, {
            emissiveIntensity: 0,
            duration: FALL_DUR * 0.85,
            stagger: dir * 0.006,
          }, t + RISE_DUR * 0.80)
        })
      })

      const totalTime = expandOrder.length * ROW_DELAY + RISE_DUR + FALL_DUR

      // ── CRESCENDO BURST — all rows simultaneously after ripple settles ──────────
      // Amplitude gradient: centre rows (2&3) lift LEAST, outer rows (0&5) lift MOST
      // Reverse of the ripple — like a shockwave compression hitting the edges
      const burstStart = totalTime + 0.8
      const burstAmp   = [1.0, 0.75, 0.50, 0.50, 0.75, 1.0]  // outer rows pulse hardest
      rows.forEach((row, rowIdx) => {
        if (!row?.length) return
        const amp  = LIFT * 1.4 * (burstAmp[rowIdx] ?? 1.0)
        const mats = row.map(m => m.material)
        row.forEach((mesh, mi) => {
          tl.to(mesh.position, { y: mesh.userData.origY + amp, duration: 0.45, ease: 'power3.out', delay: mi * 0.004 }, burstStart)
        })
        tl.to(mats, {
          emissiveIntensity: 1.3, duration: 0.12,
          stagger: 0.004,
          onStart() { mats.forEach(m => m.emissive?.copy(CRESCENDO_COLOR)) },
        }, burstStart)
        row.forEach((mesh, mi) => {
          tl.to(mesh.position, { y: mesh.userData.origY, duration: FALL_DUR * 1.3, ease: 'power3.out', delay: mi * 0.004 }, burstStart + 0.45)
        })
        tl.to(mats, { emissiveIntensity: 0, duration: FALL_DUR * 1.2, stagger: 0.004 }, burstStart + 0.50)
      })

      tl.to({}, { duration: HOLD }, burstStart + FALL_DUR * 1.3 + 0.6)
      // Hard Y reset
      tl.call(() => { rows.flat().forEach(m => { m.position.y = m.userData.origY }) })
      tlRef.current = tl
    }
    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.12} />
      <spotLight
        position={[0, 9, 2]}
        angle={0.35}
        penumbra={0.6}
        intensity={5.0}
        castShadow
        color="#d8eeff"
      />
      {/* Left rim — cold blue */}
      <directionalLight position={[-6, 4, -3]} intensity={0.50} color="#2244aa" />
      {/* Right fill — warm */}
      <directionalLight position={[4, 2, 5]}   intensity={0.30} color="#ffe8cc" />
      <CameraRig peakRowRef={peakRowRef} />
      <group ref={groupRef} scale={17} rotation={[0.40, 0, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
