/**
 * Shatter — Scatter & Reform  (Clean Rewrite)
 *
 * STORY:
 *   Explosion → Hover → Snap back → Hold
 *
 * JAW-DROP DETAILS:
 *  • Keys rotate on all 3 axes during flight (glass shards tumbling)
 *  • A white point-light FLASH fires at t=0 and exponentially decays
 *  • Camera phaseRef updated by GSAP callbacks (zero drift from animation)
 *  • Camera shake at explosion via a decaying offset ref
 *  • Light drops extremely low during hold phase (moody, close-up)
 *  • Ambient = 0.20, single strong overhead spot — contrast is king
 */
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import ClonedKeyboard from './ClonedKeyboard'

// Camera target per phase
const CAM = {
  idle:    { x: 0.5, y: 2.0, z: 5.2 },
  explode: { x: 1.0, y: 3.0, z: 9.0 },
  snap:    { x: 0.4, y: 1.8, z: 5.0 },
  hold:    { x: 0.2, y: 1.6, z: 4.6 },
}

// Flash point light intensity (decays in useFrame)
const flashState = { intensity: 0 }

function CameraRig({ phaseRef, shakeRef }) {
  useFrame(({ camera }) => {
    const tgt   = CAM[phaseRef.current] ?? CAM.idle
    const alpha = phaseRef.current === 'explode' ? 0.14 : 0.05
    camera.position.x += (tgt.x + shakeRef.current.x - camera.position.x) * alpha
    camera.position.y += (tgt.y + shakeRef.current.y - camera.position.y) * alpha
    camera.position.z += (tgt.z + shakeRef.current.z - camera.position.z) * alpha
    shakeRef.current.x *= 0.80
    shakeRef.current.y *= 0.80
    shakeRef.current.z *= 0.80
    camera.lookAt(0, 0, 0)
  })
  return null
}

function FlashLight() {
  const lightRef = useRef()
  useFrame(() => {
    if (!lightRef.current) return
    lightRef.current.intensity = flashState.intensity
    flashState.intensity      *= 0.80   // exponential decay ~16 frames
  })
  return <pointLight ref={lightRef} position={[0, 0.5, 0]} color="#ffffff" distance={25} decay={2} intensity={0} />
}

export default function ShatterScene() {
  const groupRef     = useRef()
  const collectedRef = useRef(false)
  const phaseRef     = useRef('idle')
  const shakeRef     = useRef({ x: 0, y: 0, z: 0 })

  useEffect(() => () => gsap.killTweensOf('*'), [])

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

    function buildCycle() {
      const tl = gsap.timeline({
        onComplete: () => {
          keycaps.forEach((m) => {
            m.position.set(m.userData.origPos.x, m.userData.origPos.y, m.userData.origPos.z)
            m.rotation.set(m.userData.origRot.x, m.userData.origRot.y, m.userData.origRot.z)
            m.material.emissiveIntensity = 0
          })
          phaseRef.current = 'idle'
          setTimeout(buildCycle, 600)
        }
      })

      // PHASE 1: Explosion — all at once
      tl.call(() => {
        phaseRef.current = 'explode'
        flashState.intensity = 10.0
        shakeRef.current = {
          x: (Math.random() - 0.5) * 1.0,
          y: (Math.random() - 0.5) * 0.5,
          z: 0.8,
        }
      }, null, 0)

      keycaps.forEach((mesh) => {
        const angle = Math.random() * Math.PI * 2
        const elev  = (Math.random() - 0.30) * Math.PI * 0.6
        const dist  = 0.25 + Math.random() * 0.30
        const ox    = mesh.userData.origPos
        tl.to(mesh.position, {
          x: ox.x + Math.cos(angle) * Math.cos(elev) * dist,
          y: ox.y + Math.sin(elev)  * dist + 0.08,
          z: ox.z + Math.sin(angle) * Math.cos(elev) * dist,
          duration: 1.6, ease: 'power3.out',
        }, 0)
        tl.to(mesh.rotation, {
          x: mesh.userData.origRot.x + (Math.random() - 0.5) * Math.PI * 2.5,
          y: mesh.userData.origRot.y + (Math.random() - 0.5) * Math.PI * 3.5,
          z: mesh.userData.origRot.z + (Math.random() - 0.5) * Math.PI * 1.5,
          duration: 1.6, ease: 'power2.out',
        }, 0)
        tl.to(mesh.material, { emissiveIntensity: 0.25, duration: 0.4 }, 0.15)
      })

      // PHASE 2: Camera rush-in before keys snap back
      tl.call(() => { phaseRef.current = 'snap' }, null, 2.0)

      // PHASE 3: Snap back — expo.in rush
      keycaps.forEach((mesh) => {
        const d = Math.random() * 0.08
        tl.to(mesh.position, {
          x: mesh.userData.origPos.x,
          y: mesh.userData.origPos.y,
          z: mesh.userData.origPos.z,
          duration: 0.55, ease: 'expo.in',
        }, 2.10 + d)
        tl.to(mesh.rotation, {
          x: mesh.userData.origRot.x,
          y: mesh.userData.origRot.y,
          z: mesh.userData.origRot.z,
          duration: 0.55, ease: 'expo.in',
        }, 2.10 + d)
        tl.to(mesh.material, { emissiveIntensity: 0, duration: 0.20 }, 2.50)
      })

      // PHASE 4: Hold assembled
      tl.call(() => { phaseRef.current = 'hold' }, null, 3.4)
      tl.to({}, { duration: 1.5 })
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
      <group ref={groupRef} scale={17} rotation={[0.28, 0.20, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
