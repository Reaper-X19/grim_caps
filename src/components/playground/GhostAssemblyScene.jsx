/**
 * Genesis — Born from Darkness  (Column-Based Assembly v3)
 *
 * Uses KEYBOARD_COLUMNS layout for precise column-by-column key arrival.
 * Keys fall from above within each column, left→right.
 * Within each column, keys arrive with a tiny row stagger (front→back).
 *
 * After full assembly: a golden scan-line emissive sweep travels L→R
 * across all columns using the same column order.
 *
 * Camera: starts very close/tight then pulls back to reveal the full board.
 * After assembly: slow sinusoidal sway — never orbits behind the keyboard.
 */
import { useRef, useEffect } from 'react'
import { useFrame }           from '@react-three/fiber'
import * as THREE             from 'three'
import gsap                   from 'gsap'
import ClonedKeyboard         from './ClonedKeyboard'
import { KEYBOARD_COLUMNS, buildMeshMap, resolveLayout } from './keyboardLayout'

const DROP_HEIGHT  = 0.65   // local units (×17 ≈ 11 world — fall from high above)
const FALL_DUR     = 0.55   // seconds per key fall
const COL_STAGGER  = 0.065  // seconds between columns
const ROW_STAGGER  = 0.010  // seconds between keys within a column
const SCAN_DUR     = 1.8    // seconds for scan-line sweep

// ─── CAMERA ─────────────────────────────────────────────────────────────────
function CameraRig({ assemblyDoneRef }) {
  const elapsed = useRef(0)
  useFrame(({ camera }, delta) => {
    elapsed.current += delta
    const done     = assemblyDoneRef.current
    const pullTime = done ? 0 : 0

    if (!done) {
      // Pull back reveal during assembly
      const dur    = 5.0                    // match approximate assembly duration
      const p      = Math.min(1, elapsed.current / dur)
      const eased  = 1 - Math.pow(1 - p, 3)
      camera.position.x = THREE.MathUtils.lerp(1.2, 0.8, eased)
      camera.position.y = THREE.MathUtils.lerp(1.0, 2.0, eased)
      camera.position.z = THREE.MathUtils.lerp(3.2, 5.5, eased)
    } else {
      // Gentle sway post-assembly — never goes behind the keyboard
      const sway  = Math.sin(elapsed.current * 0.04) * 0.5
      camera.position.x += (sway - camera.position.x) * 0.008
      camera.position.y += (2.0  - camera.position.y) * 0.008
      camera.position.z += (5.5  - camera.position.z) * 0.008
    }
    camera.lookAt(0, 0.2, 0)
  })
  return null
}

// ─── MAIN SCENE ─────────────────────────────────────────────────────────────
export default function GenesisScene() {
  const groupRef        = useRef()
  const collectedRef    = useRef(false)
  const tlRef           = useRef(null)
  const assemblyDoneRef = useRef(false)

  useEffect(() => () => tlRef.current?.kill(), [])

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    const meshMap = buildMeshMap(groupRef.current)
    const columns = resolveLayout(KEYBOARD_COLUMNS, meshMap)

    // Also grab non-keycap meshes (case, plate, etc.) for fade-in
    const structs = []
    groupRef.current.traverse((child) => {
      if (child.isMesh && !child.name.startsWith('K_')) {
        child.material.transparent = true
        child.material.opacity     = 0
        structs.push(child)
      }
    })

    // Initialise all keycaps: transparent, above their rest position
    columns.flat().forEach(mesh => {
      mesh.userData.origY        = mesh.position.y
      mesh.position.y            = mesh.userData.origY + DROP_HEIGHT
      mesh.material.transparent  = true
      mesh.material.opacity      = 0
      mesh.material.emissive     = new THREE.Color('#00ffaa')
      mesh.material.emissiveIntensity = 0
    })

    const tl = gsap.timeline({
      onComplete: () => { assemblyDoneRef.current = true }
    })

    // Phase 0 — case silhouette fades in first
    structs.forEach(m => {
      tl.to(m.material, { opacity: 0.6, duration: 0.5, ease: 'power2.out' }, 0)
    })

    // Phase 1 — column-by-column key arrival
    let lastKeyTime = 0
    columns.forEach((colMeshes, colIdx) => {
      colMeshes.forEach((mesh, rowIdx) => {
        const t = colIdx * COL_STAGGER + rowIdx * ROW_STAGGER
        lastKeyTime = Math.max(lastKeyTime, t + FALL_DUR)

        // Appear and fall
        tl.to(mesh.material, { opacity: 1, duration: 0.08 }, t)
        tl.to(mesh.position, { y: mesh.userData.origY, duration: FALL_DUR, ease: 'bounce.out' }, t)

        // Teal flash on arrival
        tl.to(mesh.material, { emissiveIntensity: 0.55, duration: 0.06 }, t + FALL_DUR * 0.85)
        tl.to(mesh.material, { emissiveIntensity: 0,    duration: 0.70 }, t + FALL_DUR * 0.91)
      })
    })

    // Phase 2 — case fully opaque after all keys land
    structs.forEach(m => {
      tl.to(m.material, { opacity: 1, duration: 0.4 }, lastKeyTime)
    })

    // Phase 3 — Gold scan-line sweep across all columns
    const scanStart  = lastKeyTime + 0.5
    const goldColor  = new THREE.Color('#ffcc44')
    columns.forEach((colMeshes, colIdx) => {
      const t = scanStart + (colIdx / columns.length) * SCAN_DUR
      colMeshes.forEach(mesh => {
        tl.to(mesh.material, {
          emissiveIntensity: 0.40,
          duration: 0.10,
          onStart() { mesh.material.emissive.copy(goldColor) },
        }, t)
        tl.to(mesh.material, { emissiveIntensity: 0, duration: 0.55 }, t + 0.10)
      })
    })

    tlRef.current = tl
  })

  return (
    <>
      <ambientLight intensity={0.06} />
      <spotLight
        position={[0, 8, 2]}
        angle={0.30}
        penumbra={0.65}
        intensity={5.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#e0ecff"
      />
      <spotLight
        position={[-6, 5, -3]}
        angle={0.45}
        penumbra={0.9}
        intensity={1.2}
        color="#2244ff"
      />
      <directionalLight position={[4, 2, 4]} intensity={0.4} color="#fff5e0" />
      <CameraRig assemblyDoneRef={assemblyDoneRef} />
      <group ref={groupRef} scale={17} rotation={[0.28, 0.18, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
