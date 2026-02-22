/**
 * Resonance — Circular Ripple (Coordinate-Corrected)
 *
 * Everything in LOCAL keycap position space.
 * Parent group scale=17, so local 0.015 = 0.255 world units.
 *
 * Ring expands from keyboard centre in local space.
 * MAX_RADIUS covers the full diagonal of the keyboard.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import ClonedKeyboard from './ClonedKeyboard'

// LOCAL space values — parent scale=17
const AMPLITUDE  = 0.015   // 0.015 × 17 = 0.255 world units
const WAVE_WIDTH = 0.06    // local space bell softness
const WAVE_SPD   = 0.12    // ring expansion speed (local units/sec)
const MAX_RADIUS = 0.30    // approx half-diagonal of keyboard in local units

const COLOR_PEAK = new THREE.Color('#ffcc44')
const COLOR_REST = new THREE.Color('#334466')

function CameraRig() {
  const elapsed = useRef(0)
  useFrame(({ camera }, delta) => {
    elapsed.current += delta
    const t     = elapsed.current
    const cycle = t % 24
    const phase = Math.min(1, cycle / 12)
    const eased = 1 - Math.pow(1 - phase, 2.5)

    // Reveal: top-down → 3/4 product view
    camera.position.x = THREE.MathUtils.lerp(0.3,  0.8, eased)
    camera.position.y = THREE.MathUtils.lerp(7.5,  2.8, eased)
    camera.position.z = THREE.MathUtils.lerp(3.0,  6.2, eased)
    camera.lookAt(0, 0.1, 0)
  })
  return null
}

export default function ResonanceScene() {
  const groupRef     = useRef()
  const keycapsRef   = useRef([])
  const collectedRef = useRef(false)
  const radiusRef    = useRef(0)
  const tmpColor     = new THREE.Color()

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (!collectedRef.current) {
      const found = []
      groupRef.current.traverse((child) => {
        if (!child.isMesh || !child.name?.startsWith('K_')) return
        child.castShadow = true; child.receiveShadow = true
        child.userData.origY     = child.position.y
        child.userData.origColor = child.material.color.clone()
        child.material.emissive  = new THREE.Color(0, 0, 0)
        child.material.emissiveIntensity = 0
        // LOCAL position — consistent with AMPLITUDE space
        child.userData.lx = child.position.x
        child.userData.lz = child.position.z
        found.push(child)
      })
      if (found.length) {
        // Keyboard centre in local space
        const cx = found.reduce((s, d) => s + d.userData.lx, 0) / found.length
        const cz = found.reduce((s, d) => s + d.userData.lz, 0) / found.length
        found.forEach(d => {
          d.dist = Math.sqrt((d.userData.lx - cx) ** 2 + (d.userData.lz - cz) ** 2)
        })
      }
      keycapsRef.current   = found
      collectedRef.current = true
    }

    radiusRef.current += delta * WAVE_SPD
    if (radiusRef.current > MAX_RADIUS + WAVE_WIDTH) radiusRef.current = 0

    const r = radiusRef.current

    keycapsRef.current.forEach((child) => {
      const d    = child.dist - r
      const bell = Math.max(0, 1 - (d / WAVE_WIDTH) ** 2)

      child.position.y = child.userData.origY + bell * AMPLITUDE

      if (bell < 0.5) {
        tmpColor.lerpColors(COLOR_REST, child.userData.origColor, bell * 2)
      } else {
        tmpColor.lerpColors(child.userData.origColor, COLOR_PEAK, (bell - 0.5) * 2)
      }
      child.material.color.copy(tmpColor)
    })
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
