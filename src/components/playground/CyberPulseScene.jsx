/**
 * Cascade — EMP Shockwave (Coordinate-Corrected)
 *
 * All displacement math is in LOCAL keycap position space.
 * Parent group has scale=17 — so local 0.018 = 0.306 world units (visible lift)
 *
 * Wave travels left→right across local X range of the keyboard.
 * Spotlight tracks wave in WORLD space for lighting drama.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import ClonedKeyboard from './ClonedKeyboard'

// LOCAL space values (parent scale=17)
const LIFT     = 0.018   // local → ×17 = 0.306 world units
const WAVE_W   = 0.10    // bell half-width in local X units
const WAVE_SPD = 0.35    // local-units/sec wave travel speed
const ACCENT   = [
  new THREE.Color('#00ffcc'),
  new THREE.Color('#7b2fff'),
  new THREE.Color('#ff4488'),
]

function WaveCameraRig({ progressRef }) {
  useFrame(({ camera }) => {
    const p     = progressRef.current   // 0→1
    const zTgt  = 5.8 - Math.sin(p * Math.PI) * 1.0
    camera.position.x += (0.7   - camera.position.x) * 0.02
    camera.position.y += (2.2   - camera.position.y) * 0.02
    camera.position.z += (zTgt  - camera.position.z) * 0.02
    camera.lookAt(0, 0.2, 0)
  })
  return null
}

function WaveSpot({ waveXRef, accentRef }) {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    // waveXRef is in LOCAL x; world x = local × 17 (approx, ignoring rotation twist)
    ref.current.position.set(waveXRef.current * 17, 5, 2)
    ref.current.color.copy(accentRef.current)
  })
  return (
    <spotLight
      ref={ref}
      position={[0, 5, 2]}
      angle={0.25}
      penumbra={0.55}
      intensity={7.0}
      castShadow={false}
    />
  )
}

export default function CyberPulseScene() {
  const groupRef     = useRef()
  const keycapsRef   = useRef([])
  const collectedRef = useRef(false)
  const tRef         = useRef(0)
  const colorIdx     = useRef(0)
  const waveXRef     = useRef(-0.30)
  const progressRef  = useRef(0)
  const accentRef    = useRef(ACCENT[0].clone())

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (!collectedRef.current) {
      const found = []
      groupRef.current.traverse((child) => {
        if (!child.isMesh || !child.name?.startsWith('K_')) return
        child.castShadow = true; child.receiveShadow = true
        child.material.emissive = new THREE.Color(0, 0, 0)
        child.material.emissiveIntensity = 0
        child.userData.origY = child.position.y
        child.userData.lx    = child.position.x   // local X — consistent space
        found.push(child)
      })
      found.sort((a, b) => a.userData.lx - b.userData.lx)
      keycapsRef.current   = found
      collectedRef.current = true
    }

    const keys = keycapsRef.current
    if (!keys.length) return

    const minX = keys[0].userData.lx
    const maxX = keys[keys.length - 1].userData.lx
    const span  = maxX - minX || 1

    // Advance wave in local X space
    tRef.current += delta
    const totalTravel = span + WAVE_W * 4   // extra so wave enters/exits fully
    const cycle       = (tRef.current * WAVE_SPD) % totalTravel
    const waveX       = minX - WAVE_W * 2 + cycle   // starts off-left, exits off-right
    waveXRef.current  = waveX

    const progress = (waveX - minX) / span
    progressRef.current = Math.max(0, Math.min(1, progress))

    if (cycle < delta * WAVE_SPD * 2) {
      colorIdx.current = (colorIdx.current + 1) % ACCENT.length
      accentRef.current.copy(ACCENT[colorIdx.current])
    }
    const accentColor = ACCENT[colorIdx.current]

    keys.forEach((mesh) => {
      const d    = mesh.userData.lx - waveX
      const bell = Math.max(0, 1 - (d / WAVE_W) ** 2)
      mesh.position.y = mesh.userData.origY + bell * LIFT
      mesh.material.emissive.copy(accentColor)
      // Leading glow + soft trailing residue
      const trail = -d > 0 && -d < WAVE_W * 2
        ? Math.max(0, 1 - (-d) / (WAVE_W * 2)) * 0.12
        : 0
      mesh.material.emissiveIntensity = bell * 0.55 + trail
    })
  })

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[-5, 6, -4]} intensity={0.35} color="#1133aa" />
      <directionalLight position={[3, 3, 4]}   intensity={0.22} />
      <WaveSpot waveXRef={waveXRef} accentRef={accentRef} />
      <WaveCameraRig progressRef={progressRef} />
      <group ref={groupRef} scale={17} rotation={[0.28, 0.18, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
