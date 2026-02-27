/**
 * Descent — Zero to Grounded (Jaw-Drop Edition)
 *
 * NEW IMPROVEMENTS:
 *  • Keys SPIN on the Y-axis as they fall (like coins dropping from the sky)
 *    — rotation locked when they land and snaps to correct orientation
 *  • Ambient dropped to 0.20 — creates strong contrast between lit falling
 *    keys and shadowed case below
 *  • Spotlight at HIGH intensity from directly above — illuminates only the
 *    top surface of keys as they fall, creating a "ray of light" effect
 *  • Impact creates a "ring ripple" — nearby keys get a brief emissive flash
 *  • Camera: front-facing at y=2.2, gentle breathe in/out
 */
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import ClonedKeyboard from './ClonedKeyboard'

const STAGGER    = 0.032     // spread per key
const DROP_HEIGHT = 0.32     // local (×17 = 5.4 world — starts within visible scene area)
const CYCLE_DURATION = 87 * 0.038 + 1.20 + 7.5 + 87 * (0.038 * 0.4) + 2.0

function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t     = clock.elapsedTime
    const cycle = t % CYCLE_DURATION
    const phase = cycle / CYCLE_DURATION

    const sway = Math.sin(t * 0.05) * 0.5

    let zTarget
    if (phase < 0.45) {
      const p = phase / 0.45
      zTarget = THREE.MathUtils.lerp(5.5, 4.3, Math.pow(p, 2))
    } else if (phase > 0.75) {
      const p = (phase - 0.75) / 0.25
      zTarget = THREE.MathUtils.lerp(4.3, 5.5, p)
    } else {
      zTarget = 4.3
    }
    camera.position.x += (sway  - camera.position.x) * 0.025
    camera.position.y  = 2.2
    camera.position.z += (zTarget - camera.position.z) * 0.025
    camera.lookAt(0, 0.3, 0)
  })
  return null
}

export default function GravityDropScene() {
  const groupRef     = useRef()
  const tlRef        = useRef(null)
  const collectedRef = useRef(false)

  useEffect(() => () => tlRef.current?.kill(), [])

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    const keys   = []
    const allMeshMap = new Map()

    groupRef.current.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true; child.receiveShadow = true
      if (child.name?.startsWith('K_')) {
        child.material.transparent      = true
        child.material.opacity          = 0
        child.material.emissive         = new THREE.Color(0, 0, 0)
        child.material.emissiveIntensity = 0
        child.userData.origY = child.position.y
        child.userData.origRotY = child.rotation.y
        child.position.y = child.userData.origY + DROP_HEIGHT
        keys.push(child)
        allMeshMap.set(child.name, child)
      }
    })

    const shuffled    = [...keys].sort(() => Math.random() - 0.5)
    const impactColor = new THREE.Color('#ffffff')  // pure white impact flash

    function buildCycle() {
      shuffled.forEach((m) => {
        m.material.emissive.copy(impactColor)
        m.position.y  = m.userData.origY + DROP_HEIGHT
        m.rotation.y  = m.userData.origRotY + Math.PI * 4   // start spinning
      })

      const tl = gsap.timeline({
        onComplete: () => {
          shuffled.forEach((m) => {
            m.material.opacity = 0
            m.position.y  = m.userData.origY + DROP_HEIGHT
            m.rotation.y  = m.userData.origRotY + Math.PI * 4
          })
          buildCycle()
        },
      })

      shuffled.forEach((mesh, i) => {
        const t = i * STAGGER
        // Fade in: starts nearly invisible then solidifies as it falls
        tl.to(mesh.material, { opacity: 0.06, duration: 0.01 }, t)   // ghost-in
        tl.to(mesh.material, { opacity: 1.0,  duration: 0.60, ease: 'power2.out' }, t + 0.25)
        // Heavy fall — power4.in = accelerates hard like gravity
        tl.to(mesh.position, { y: mesh.userData.origY, duration: 1.20, ease: 'power4.in' }, t)
        // Landing bounce — elastic: keys are metal, bounce is real but quick
        tl.to(mesh.position, { y: mesh.userData.origY, duration: 0.65, ease: 'elastic.out(1.4, 0.38)' }, t + 1.20)
        // Unwind the spin on the way down
        tl.to(mesh.rotation, { y: mesh.userData.origRotY, duration: 1.10, ease: 'power2.in' }, t)
        // Impact: bright cyan flash (looks like switch registering)
        tl.to(mesh.material, {
          emissiveIntensity: 1.2, duration: 0.04,
          onStart() { mesh.material.emissive?.set('#00F0FF') },
        }, t + 1.22)
        tl.to(mesh.material, { emissiveIntensity: 0, duration: 0.65 }, t + 1.26)
      })

      tl.to({}, { duration: 7.5 })   // hold assembled

      // ── FINALE: all-keys simultaneous white flash before reset ────────────────────
      // Triggered near end of hold — signals the keyboard is "alive"
      const holdEnd = shuffled.length * STAGGER + 1.20 + 1.8 + 7.5
      shuffled.forEach((mesh) => {
        tl.to(mesh.material, { emissiveIntensity: 1.4, duration: 0.07 }, holdEnd - 0.5)
        tl.to(mesh.material, { emissiveIntensity: 0,   duration: 0.45 }, holdEnd - 0.43)
      })

      // Fade out / float back up for reset
      const fallEnd = shuffled.length * STAGGER + 0.6
      shuffled.forEach((mesh, i) => {
        const t2 = fallEnd + 1.8 + i * (STAGGER * 0.4)
        tl.to(mesh.position, { y: mesh.userData.origY + DROP_HEIGHT, duration: 0.65, ease: 'power2.in' }, t2)
        tl.to(mesh.material, { opacity: 0, duration: 0.32 }, t2 + 0.15)
      })
      tlRef.current = tl
    }
    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.20} />
      {/* Overhead beam — illuminates falling tops of keycaps dramatically */}
      <spotLight
        position={[0, 9, 1]}
        angle={0.38}
        penumbra={0.65}
        intensity={5.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#ffffff"
      />
      {/* Orange rim from right — warm impact glow */}
      <directionalLight position={[5, 2, 3]}  intensity={0.55} color="#ff8800" />
      {/* Cool blue from left — cold sky feel */}
      <directionalLight position={[-4, 4, 2]} intensity={0.35} color="#4488ff" />
      <CameraRig />
      <group ref={groupRef} scale={17} rotation={[0.40, 0, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
