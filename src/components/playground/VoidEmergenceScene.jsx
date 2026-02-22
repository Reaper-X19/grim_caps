/**
 * Shatter — Scatter & Reform  (v2 — Wide Burst + Reverse Convergence)
 *
 * CHANGES FROM v1:
 *  • Explosion radius: 0.45-0.85 → 0.85-1.60 local (14.5-27 world) — fills viewport
 *  • Keycaps explode WITH upward bias (elev bias +0.15) for a shower-burst feel
 *  • SCATTER HOLD: 2.2s — keys tumble in place (scatterRef per-key spinY)
 *  • CONVERGENCE (was "snap"): slow 2.2s power2.out — keys drift back gracefully
 *    like a reverse explosion in slow motion, NOT a sudden snap
 *  • Stagger on convergence: each key starts at its own random offset (0-0.4s)
 *    so they don't all arrive at the same time — ripple of landing
 *  • Camera: pulls far back during explode (z=11), then slowly glides back in
 *  • Keys still have emissive during flight, fades on landing
 */
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import ClonedKeyboard from './ClonedKeyboard'

const CAM = {
  idle:    { x: 0.3, y: 2.0, z: 5.5 },
  explode: { x: 0.8, y: 3.5, z: 11.0 },   // far back — see all scattered keys
  converge:{ x: 0.5, y: 2.5, z: 8.0 },   // slowly glide in during convergence
  hold:    { x: 0.2, y: 1.8, z: 5.0 },
}

const flashState = { intensity: 0 }

function CameraRig({ phaseRef, shakeRef }) {
  useFrame(({ camera }) => {
    const tgt   = CAM[phaseRef.current] ?? CAM.idle
    const alpha = phaseRef.current === 'explode' ? 0.12 : 0.04
    camera.position.x += (tgt.x + shakeRef.current.x - camera.position.x) * alpha
    camera.position.y += (tgt.y + shakeRef.current.y - camera.position.y) * alpha
    camera.position.z += (tgt.z + shakeRef.current.z - camera.position.z) * alpha
    shakeRef.current.x *= 0.78
    shakeRef.current.y *= 0.78
    shakeRef.current.z *= 0.78
    camera.lookAt(0, 0.2, 0)
  })
  return null
}

function FlashLight() {
  const lightRef = useRef()
  useFrame(() => {
    if (!lightRef.current) return
    lightRef.current.intensity = flashState.intensity
    flashState.intensity      *= 0.78
  })
  return <pointLight ref={lightRef} position={[0, 0.5, 0]} color="#ffffff" distance={30} decay={2} intensity={0} />
}

export default function ShatterScene() {
  const groupRef      = useRef()
  const collectedRef  = useRef(false)
  const phaseRef      = useRef('idle')
  const shakeRef      = useRef({ x: 0, y: 0, z: 0 })
  const scatterRef    = useRef([])

  useEffect(() => () => gsap.killTweensOf('*'), [])

  // Slow tumble while scattered
  useFrame((_, delta) => {
    if (phaseRef.current !== 'explode') return
    scatterRef.current.forEach(({ mesh, spinY }) => {
      mesh.rotation.y += spinY * delta
    })
  })

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    const keycaps = []
    groupRef.current.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true; child.receiveShadow = true
      if (child.name?.startsWith('K_')) {
        child.userData.origPos = { x: child.position.x, y: child.position.y, z: child.position.z }
        child.userData.origRot = { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z }
        child.material.emissive = new THREE.Color(0, 0, 0)
        child.material.emissiveIntensity = 0
        keycaps.push(child)
      }
    })

    // Random per-key spin for the tumble phase
    scatterRef.current = keycaps.map(mesh => ({
      mesh,
      spinY: (Math.random() - 0.5) * 1.4,
    }))

    function buildCycle() {
      const tl = gsap.timeline({
        onComplete: () => {
          keycaps.forEach((m) => {
            m.position.set(m.userData.origPos.x, m.userData.origPos.y, m.userData.origPos.z)
            m.rotation.set(m.userData.origRot.x, m.userData.origRot.y, m.userData.origRot.z)
            m.material.emissiveIntensity = 0
          })
          phaseRef.current = 'idle'
          setTimeout(buildCycle, 800)
        }
      })

      // ── PHASE 1: EXPLOSION (t=0) ─────────────────────────────────────────
      tl.call(() => {
        phaseRef.current = 'explode'
        flashState.intensity = 22.0
        shakeRef.current = {
          x: (Math.random() - 0.5) * 2.2,
          y: (Math.random() - 0.5) * 1.2,
          z: 2.0,
        }
      }, null, 0)

      keycaps.forEach((mesh) => {
        // True 3D uniform scatter — normalized random direction
        let nx = (Math.random() - 0.5) * 2
        let ny = (Math.random() - 0.5) * 2 + 0.12  // slight upward bias to clear keyboard body
        let nz = (Math.random() - 0.5) * 2
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
        nx /= len; ny /= len; nz /= len

        const dist = 0.22 + Math.random() * 0.28    // 0.22–0.50 local → 3.7–8.5 world
        const ox   = mesh.userData.origPos

        tl.to(mesh.position, {
          x: ox.x + nx * dist,
          y: ox.y + ny * dist,
          z: ox.z + nz * dist,
          duration: 1.6, ease: 'power3.out',
        }, 0)
        tl.to(mesh.rotation, {
          x: mesh.userData.origRot.x + (Math.random() - 0.5) * Math.PI * 4.0,
          y: mesh.userData.origRot.y + (Math.random() - 0.5) * Math.PI * 6.0,
          z: mesh.userData.origRot.z + (Math.random() - 0.5) * Math.PI * 3.0,
          duration: 1.6, ease: 'power2.out',
        }, 0)
        // Emissive glow while airborne
        tl.to(mesh.material, { emissiveIntensity: 0.28, duration: 0.5 }, 0.20)
      })

      // ── PHASE 2: SCATTER HOLD (keys tumble freely via useFrame) ──────────
      const HOLD_START = 1.7
      tl.to({}, { duration: 2.2 }, HOLD_START)   // 2.2s admire the chaos

      // ── PHASE 3: CONVERGENCE — slow reverse burst ─────────────────────────
      const CONV_START = HOLD_START + 2.2
      tl.call(() => { phaseRef.current = 'converge' }, null, CONV_START)

      keycaps.forEach((mesh) => {
        // Random stagger so they don't all arrive together (0 to 0.55s offset)
        const staggerT = CONV_START + Math.random() * 0.55
        tl.to(mesh.position, {
          x: mesh.userData.origPos.x,
          y: mesh.userData.origPos.y,
          z: mesh.userData.origPos.z,
          duration: 2.0,          // slow — 2× longer than original
          ease: 'power2.inOut',   // ease in gently, settle gracefully
        }, staggerT)
        tl.to(mesh.rotation, {
          x: mesh.userData.origRot.x,
          y: mesh.userData.origRot.y,
          z: mesh.userData.origRot.z,
          duration: 2.0,
          ease: 'power2.inOut',
        }, staggerT)
        // Emissive fades as each key lands
        tl.to(mesh.material, { emissiveIntensity: 0, duration: 0.40 }, staggerT + 1.65)
      })

      // ── PHASE 4: HOLD ASSEMBLED ───────────────────────────────────────────
      const ASSEMBLE_END = CONV_START + 0.55 + 2.0 + 0.20
      tl.call(() => { phaseRef.current = 'hold' }, null, ASSEMBLE_END)
      tl.to({}, { duration: 2.0 }, ASSEMBLE_END)
    }

    buildCycle()
  })

  return (
    <>
      <ambientLight intensity={0.18} />
      <spotLight
        position={[0, 8, 2]}
        angle={0.38}
        penumbra={0.65}
        intensity={3.5}
        castShadow
        color="#ffffff"
      />
      <pointLight position={[-5, 3, -2]} intensity={0.9} color="#5533ff" />
      <pointLight position={[ 5, 2, -2]} intensity={0.7} color="#ff3366" />
      <FlashLight />
      <CameraRig phaseRef={phaseRef} shakeRef={shakeRef} />
      <group ref={groupRef} scale={17} rotation={[0.40, 0, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
