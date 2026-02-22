/**
 * Genesis — Born from Darkness
 *
 * JAW-DROP IMPROVEMENTS:
 *  • Scene starts in near-TOTAL DARKNESS — ambient = 0.04
 *  • A focused spotlight fades in as the first column assembles
 *  • Keys have a brief teal emissive trail as they materialise (glow WHILE arriving)
 *  • After full assembly: a dramatic gold scan-line spotlight sweeps left→right
 *  • Camera starts VERY close (fov feels tight), pulls back for the grand reveal
 */
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import ClonedKeyboard from './ClonedKeyboard'

function CameraRig({ tlDuration }) {
  const orbitAngle = useRef(Math.PI * 0.15)
  const elapsed    = useRef(0)

  useFrame(({ camera }, delta) => {
    elapsed.current += delta
    const t = elapsed.current

    if (t < tlDuration + 2) {
      const progress = Math.min(1, t / (tlDuration + 1.5))
      const eased    = 1 - Math.pow(1 - progress, 3)
      // Start close and slightly right, pull back to classic 3/4 angle
      camera.position.x = THREE.MathUtils.lerp(1.2,  0.8, eased)
      camera.position.y = THREE.MathUtils.lerp(1.0,  2.0, eased)
      camera.position.z = THREE.MathUtils.lerp(3.2,  5.5, eased)
    } else {
      // Slow sinusoidal sway — NEVER goes behind the keyboard
      const sway = Math.sin(elapsed.current * 0.04) * 0.5   // ±0.5 units
      camera.position.x += (sway - camera.position.x) * 0.01
      camera.position.y += (2.0  - camera.position.y) * 0.01
      camera.position.z += (5.5  - camera.position.z) * 0.01
    }
    camera.lookAt(0, 0.2, 0)
  })
  return null
}

export default function GenesisScene() {
  const groupRef     = useRef()
  const spotRef      = useRef()
  const scanRef      = useRef()
  const collectedRef = useRef(false)
  const tlDuration   = useRef(3.5)

  useEffect(() => () => gsap.killTweensOf('*'), [])

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    const columnMap = new Map()
    const structs   = []

    groupRef.current.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true; child.receiveShadow = true

      if (child.name?.startsWith('K_')) {
        child.material.transparent        = true
        child.material.opacity            = 0
        child.material.emissive           = new THREE.Color('#00ffaa')
        child.material.emissiveIntensity  = 0
        child.userData.origY              = child.position.y
        child.position.y                  = child.userData.origY + 0.55
        const wp = new THREE.Vector3()
        child.getWorldPosition(wp)
        const bucket = Math.round(wp.x * 15)
        if (!columnMap.has(bucket)) columnMap.set(bucket, [])
        columnMap.get(bucket).push({ mesh: child, wp })
      } else {
        child.material.transparent = true
        child.material.opacity     = 0
        structs.push(child)
      }
    })

    const cols = [...columnMap.entries()].sort((a, b) => a[0] - b[0])
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 0.3 })

    // Phase 0: Structures ghost in silently
    structs.forEach((m) => {
      tl.to(m.material, { opacity: 0.65, duration: 0.5, ease: 'power2.out' }, 0)
    })

    // Phase 1: Keys fall column-by-column with teal arrival glow
    let maxTime = 0
    cols.forEach(([, keys], colIdx) => {
      keys.sort((a, b) => b.wp.z - a.wp.z)
      keys.forEach(({ mesh }, rowIdx) => {
        const delay = 0.35 + colIdx * 0.065 + rowIdx * 0.010
        tl.to(mesh.position, { y: mesh.userData.origY, duration: 0.62, ease: 'bounce.out' }, delay)
        tl.to(mesh.material, { opacity: 1, duration: 0.10 }, delay)
        tl.to(mesh.material, { emissiveIntensity: 0.55, duration: 0.08 }, delay + 0.02)
        tl.to(mesh.material, { emissiveIntensity: 0, duration: 0.70 }, delay + 0.10)
        maxTime = Math.max(maxTime, delay + 0.72)
      })
    })

    tlDuration.current = maxTime

    // Phase 2: Structures go fully opaque when assembly complete
    structs.forEach((m) => {
      tl.to(m.material, { opacity: 1, duration: 0.4 }, maxTime)
    })

    // Phase 3: Scan-light sweeps across (simulated via key emissive sweep)
    const scanStart = maxTime + 0.6
    const allKeys = cols.flatMap(([, k]) => k).sort((a, b) => a.wp.x - b.wp.x)
    allKeys.forEach(({ mesh }, i) => {
      const t = scanStart + (i / allKeys.length) * 1.8
      tl.to(mesh.material, { emissiveIntensity: 0.35, duration: 0.10 }, t)
      tl.to(mesh.material, { emissiveIntensity: 0,    duration: 0.55 }, t + 0.10)
    })

    // Phase 4: Hold then fade
    tl.to({}, { duration: 2.5 })
    const fadeStart = tl.duration() - 1.0
    groupRef.current.traverse((child) => {
      if (!child.isMesh) return
      tl.to(child.material, { opacity: 0, duration: 0.8, ease: 'power2.in' }, fadeStart)
    })
    tl.call(() => {
      groupRef.current?.traverse((child) => {
        if (child.isMesh && child.name?.startsWith('K_'))
          child.position.y = child.userData.origY + 0.70
      })
    })
  })

  return (
    <>
      {/* Almost total darkness — the spotlight is everything */}
      <ambientLight intensity={0.06} />
      <spotLight
        ref={spotRef}
        position={[0, 8, 2]}
        angle={0.30}
        penumbra={0.65}
        intensity={5.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#e0ecff"
      />
      {/* Cool rim light from behind-left */}
      <spotLight
        position={[-6, 5, -3]}
        angle={0.45}
        penumbra={0.9}
        intensity={1.2}
        color="#2244ff"
      />
      {/* Warm fill from front-right */}
      <directionalLight position={[4, 2, 4]} intensity={0.4} color="#fff5e0" />

      <CameraRig tlDuration={tlDuration.current} />
      <group ref={groupRef} scale={17} rotation={[0.28, 0.18, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
