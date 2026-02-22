/**
 * Genesis — Born from Darkness  (Void + Rotation Rewrite)
 *
 * Restores the original void/materialize aesthetic:
 *   • Scene is PITCH BLACK — no ambient, only a narrow overhead spotlight
 *   • Keys start INVISIBLE (opacity 0), positioned above their rest pos,
 *     spinning on Y-axis (like coins falling from the void)
 *   • Column by column they descend, spinning fast then decelerating on impact
 *   • On landing: teal emissive FLASH, opacity snaps to 1
 *   • After full assembly: gold scan-line sweeps L→R
 *
 * Camera starts very close (intimate darkness), pulls back slowly to reveal
 * the complete assembled board, then settles to gentle sway.
 */
import { useRef, useEffect } from 'react'
import { useFrame }           from '@react-three/fiber'
import * as THREE             from 'three'
import gsap                   from 'gsap'
import ClonedKeyboard         from './ClonedKeyboard'
import { KEYBOARD_COLUMNS, buildMeshMap, resolveLayout } from './keyboardLayout'

const DROP_HEIGHT  = 1.20    // local units (×17 ≈ 20.4 world — dramatic fall from HIGH above)
const FALL_DUR     = 0.80    // seconds per key fall — long enough to see spin
const COL_STAGGER  = 0.110   // 16 cols × 0.110 = 1.76s spread — viewer can track each column
const ROW_STAGGER  = 0.018   // seconds within column
const SPIN_REVS    = 3.0     // 1080° — clearly visible rotation
const SCAN_DUR     = 2.2     // gold scan duration

function CameraRig({ assemblyDoneRef, assemblyDuration }) {
  const elapsed = useRef(0)
  useFrame(({ camera }, delta) => {
    elapsed.current += delta
    if (!assemblyDoneRef.current) {
      const p     = Math.min(1, elapsed.current / (assemblyDuration + 1.0))
      const eased = 1 - Math.pow(1 - p, 3)
      camera.position.x = THREE.MathUtils.lerp(1.0, 0.8, eased)
      camera.position.y = THREE.MathUtils.lerp(0.8, 2.0, eased)
      camera.position.z = THREE.MathUtils.lerp(3.0, 5.5, eased)
    } else {
      const sway  = Math.sin(elapsed.current * 0.04) * 0.4
      camera.position.x += (sway - camera.position.x) * 0.008
      camera.position.y += (2.0  - camera.position.y) * 0.008
      camera.position.z += (5.5  - camera.position.z) * 0.008
    }
    camera.lookAt(0, 0.2, 0)
  })
  return null
}

export default function GenesisScene() {
  const groupRef        = useRef()
  const collectedRef    = useRef(false)
  const tlRef           = useRef(null)
  const assemblyDoneRef = useRef(false)
  const assemblyDurRef  = useRef(5.0)

  useEffect(() => () => tlRef.current?.kill(), [])

  useFrame(() => {
    if (!groupRef.current || collectedRef.current) return
    collectedRef.current = true

    const meshMap = buildMeshMap(groupRef.current)
    const columns = resolveLayout(KEYBOARD_COLUMNS, meshMap)

    // Non-keycap structural meshes (case, plate, etc.) — fade in first
    const structs = []
    groupRef.current.traverse((child) => {
      if (child.isMesh && !child.name.startsWith('K_') &&
          !child.name.toLowerCase().includes('emission')) {
        child.material.transparent = true
        child.material.opacity     = 0
        structs.push(child)
      }
    })

    // Initialise keycaps: invisible, above, pre-spun
    const allKeycaps = columns.flat()
    allKeycaps.forEach(mesh => {
      mesh.userData.origY    = mesh.position.y
      mesh.userData.origRotY = mesh.rotation.y
      mesh.position.y        = mesh.userData.origY + DROP_HEIGHT
      mesh.rotation.y        = mesh.userData.origRotY + Math.PI * 2 * SPIN_REVS
      mesh.material.transparent  = true
      mesh.material.opacity      = 0
      mesh.material.emissive     = new THREE.Color('#00ffaa')
      mesh.material.emissiveIntensity = 0
    })

    const tl = gsap.timeline({
      onComplete: () => { assemblyDoneRef.current = true }
    })

    // Phase 0: Case silhouette emerges from total darkness (ambient only)
    structs.forEach(m => {
      tl.to(m.material, { opacity: 0.4, duration: 0.8, ease: 'power1.inOut' }, 0.2)
    })

    // Phase 1: Column-by-column key FALL — spinning Y, bounce landing
    let lastKeyTime = 0
    columns.forEach((colMeshes, colIdx) => {
      colMeshes.forEach((mesh, rowIdx) => {
        const t = 0.4 + colIdx * COL_STAGGER + rowIdx * ROW_STAGGER
        lastKeyTime = Math.max(lastKeyTime, t + FALL_DUR)

        // Snap visible in one frame just before fall
        tl.to(mesh.material, { opacity: 1, duration: 0.04 }, t)

        // FALL — position and spin together
        tl.to(mesh.position, {
          y: mesh.userData.origY,
          duration: FALL_DUR,
          ease: 'bounce.out',
        }, t)
        tl.to(mesh.rotation, {
          y: mesh.userData.origRotY,
          duration: FALL_DUR,
          ease: 'power2.out',   // spin decelerates faster than bounce
        }, t)

        // Teal FLASH on landing — brighter pop
        tl.to(mesh.material, { emissiveIntensity: 0.85, duration: 0.04 }, t + FALL_DUR * 0.88)
        tl.to(mesh.material, { emissiveIntensity: 0,    duration: 0.90 }, t + FALL_DUR * 0.92)
      })
    })

    assemblyDurRef.current = lastKeyTime

    // Phase 2: Case fully opaque
    structs.forEach(m => {
      tl.to(m.material, { opacity: 1, duration: 0.5 }, lastKeyTime + 0.2)
    })

    // Phase 3: Gold scan-line L→R
    const goldColor  = new THREE.Color('#ffcc44')
    const scanStart  = lastKeyTime + 0.6
    columns.forEach((colMeshes, colIdx) => {
      const t = scanStart + (colIdx / columns.length) * SCAN_DUR
      colMeshes.forEach(mesh => {
        tl.to(mesh.material, {
          emissiveIntensity: 0.40,
          duration: 0.08,
          onStart() { mesh.material.emissive.copy(goldColor) },
        }, t)
        tl.to(mesh.material, { emissiveIntensity: 0, duration: 0.60 }, t + 0.08)
      })
    })

    tlRef.current = tl
  })

  return (
    <>
      {/* Near-total darkness — only tight overhead beam */}
      <ambientLight intensity={0.04} />
      <spotLight
        position={[0, 9, 2]}
        angle={0.26}
        penumbra={0.70}
        intensity={6.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#d0eaff"
      />
      {/* Subtle blue rim from behind-left for silhouette */}
      <spotLight
        position={[-7, 4, -4]}
        angle={0.50}
        penumbra={0.95}
        intensity={1.0}
        color="#1122ff"
      />
      <directionalLight position={[4, 2, 4]} intensity={0.3} color="#fff5e0" />
      <CameraRig assemblyDoneRef={assemblyDoneRef} assemblyDuration={assemblyDurRef.current} />
      <group ref={groupRef} scale={17} rotation={[0.28, 0.18, 0]}>
        <ClonedKeyboard />
      </group>
    </>
  )
}
