/**
 * Phantom Chrome — Material Metamorphosis (Jaw-Drop Edition)
 *
 * NEW IMPROVEMENTS:
 *  • Emissive intensity CUT to near-zero across all presets — chrome should
 *    REFLECT, not emit. Reflection comes from the rim lights, not material glow.
 *  • Materials darkened slightly so contrast between matte black and chrome is
 *    absolutely max — pitch black → gleaming silver → deep rich violet
 *  • Rim lights made MUCH stronger (1.8/1.4) so chrome actually shines
 *  • Camera: adds a slight elevation oscillation — dips low then rises to frame
 *    the board at different angles during the spin, more "product photo" feel
 *  • Rotation speed bumped from 0.18 → 0.22 rad/s for more urgency
 *  • morph duration tightened from 2.5s → 1.8s — snappier transitions
 */
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import ClonedKeyboard from './ClonedKeyboard'

const PRESETS = [
  { r: 0.06, g: 0.06, b: 0.08, roughness: 0.85, metalness: 0.05, eI: 0.00 },
  { r: 0.52, g: 0.54, b: 0.58, roughness: 0.25, metalness: 0.60, eI: 0.00 },
  { r: 0.78, g: 0.80, b: 0.82, roughness: 0.02, metalness: 0.60, eI: 0.01 },
  { r: 0.38, g: 0.12, b: 0.70, roughness: 0.06, metalness: 0.55, eI: 0.00 },
]

function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime
    // Gentle elevation arc — dips to show side profile, rises for top-down
    const elevation = 1.8 + Math.sin(t * 0.12) * 0.55
    const sway      = Math.sin(t * 0.04) * 0.6 + 0.8
    camera.position.x += (sway      - camera.position.x) * 0.015
    camera.position.y += (elevation - camera.position.y) * 0.015
    camera.position.z  = 5.5
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function LiquidChromeScene() {
  const rotRef       = useRef()
  const rimL1        = useRef()
  const rimL2        = useRef()
  const rimL3        = useRef()
  const meshesRef    = useRef([])
  const collectedRef = useRef(false)
  const proxy        = useRef({ ...PRESETS[0], eR: 0, eG: 0, eB: 0 })
  const tlRef        = useRef(null)

  useEffect(() => {
    const p  = proxy.current
    const tl = gsap.timeline({ repeat: -1 })
    PRESETS.forEach((_, i) => {
      const next = PRESETS[(i + 1) % PRESETS.length]
      tl.to(p, {
        ...next,
        eR: 0, eG: 0, eB: 0,
        duration: 2.8,
        ease: 'power2.inOut',
      })
      tl.to({}, { duration: 1.2 })
    })
    tlRef.current = tl
    return () => tl.kill()
  }, [])

  useFrame((_, delta) => {
    if (!rotRef.current) return

    // Spin keyboard
    rotRef.current.rotation.y += delta * 0.16

    // 3 rim lights: two orbit opposite each other, one top
    const angle = rotRef.current.rotation.y
    if (rimL1.current) rimL1.current.position.set(Math.sin(angle) * 5, 1.2, Math.cos(angle) * 5)
    if (rimL2.current) rimL2.current.position.set(Math.sin(angle + Math.PI) * 5, 0.8, Math.cos(angle + Math.PI) * 5)
    if (rimL3.current) rimL3.current.position.set(Math.sin(angle + Math.PI * 0.5) * 4, 3, Math.cos(angle + Math.PI * 0.5) * 4)

    // Collect and create materials once
    if (!collectedRef.current) {
      const p = proxy.current
      const found = []
      rotRef.current.traverse((child) => {
        if (!child.isMesh) return
        child.castShadow = true; child.receiveShadow = true
        child.material = new THREE.MeshStandardMaterial({
          color:    new THREE.Color(p.r, p.g, p.b),
          emissive: new THREE.Color(0, 0, 0),
          emissiveIntensity: 0,
          roughness: p.roughness,
          metalness: p.metalness,
        })
        found.push(child)
      })
      meshesRef.current    = found
      collectedRef.current = true
    }

    // Drive materials from GSAP proxy
    const p = proxy.current
    meshesRef.current.forEach((mesh) => {
      mesh.material.color.setRGB(p.r, p.g, p.b)
      mesh.material.roughness  = p.roughness
      mesh.material.metalness  = p.metalness
      mesh.material.emissiveIntensity = p.eI ?? 0
    })
  })

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 6, 3]}   intensity={0.8} />
      <directionalLight position={[-3, 4, -3]}  intensity={0.4} />
      {/* 3 strong orbiting rim lights — where the chrome magic lives */}
      <pointLight ref={rimL1} position={[5, 1.2, 5]} intensity={1.2} color="#ffffff" />
      <pointLight ref={rimL2} position={[-5, 0.8, -5]} intensity={0.9} color="#cce8ff" />
      <pointLight ref={rimL3} position={[0, 3, 4]}   intensity={0.8} color="#ffe8cc" />
      <CameraRig />
      <group ref={rotRef}>
        <ClonedKeyboard scale={17} rotation={[0.28, 0, 0]} />
      </group>
    </>
  )
}
