import { useRef, useEffect } from 'react'
import { useControls } from 'leva'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { KeyboardGlossyModel } from './Keyboard_Glossy'
import { KEYBOARD_COLUMNS, KEYBOARD_ROWS, buildMeshMap, resolveLayout }
  from '../playground/keyboardLayout'

// ─── WAVE HOOK ───────────────────────────────────────────────────────────────
// Plays a left-to-right column wave on an interval.
// Pass groupRef — the group containing the keyboard model.
function useColumnWave(groupRef, { 
  lift = 0.08, 
  duration = 0.4, 
  columnDelay = 0.04,
  interval = 4000,
  accentColor = '#00ffcc',
} = {}) {
  const tlRef = useRef(null)
  const readyRef = useRef(false)

  useEffect(() => {
    let timeout
    function runWave() {
      if (!groupRef.current || !readyRef.current) {
        timeout = setTimeout(runWave, 200)
        return
      }
      const meshMap = buildMeshMap(groupRef.current)
      const columns = resolveLayout(KEYBOARD_COLUMNS, meshMap)
      if (!columns.length) { timeout = setTimeout(runWave, 200); return }

      columns.flat().forEach(m => {
        if (!m.userData.origY) m.userData.origY = m.position.y
      })

      const accent = new THREE.Color(accentColor)

      const tl = gsap.timeline({ onComplete: () => { timeout = setTimeout(runWave, interval) } })
      columns.forEach((colMeshes, colIdx) => {
        const t         = colIdx * columnDelay
        const positions = colMeshes.map(m => m.position)
        const materials = colMeshes.map(m => m.material)

        tl.to(positions, { y: `+=${lift}`, duration, ease: 'power2.inOut', stagger: 0.006 }, t)
        tl.to(materials, {
          emissiveIntensity: 0.35, duration: duration * 0.4, stagger: 0.006,
          onStart() { materials.forEach(mat => { if (mat.emissive) mat.emissive.copy(accent) }) },
        }, t)
        tl.to(positions, { y: `-=${lift}`, duration, ease: 'power2.inOut', stagger: 0.006 }, t + duration * 0.6)
        tl.to(materials, { emissiveIntensity: 0, duration: duration * 0.6, stagger: 0.006 }, t + duration * 0.6)
      })
      tlRef.current = tl
    }
    timeout = setTimeout(runWave, 1000)   // initial delay for model load
    return () => { clearTimeout(timeout); tlRef.current?.kill() }
  }, []) // eslint-disable-line

  return readyRef
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function GlossyKeyboardHero() {
  const groupRef = useRef()
  const readyRef = useRef(false)

  const {
    posX, posY, posZ,
    rotX, rotY, rotZ,
    scale,
    emissionColor, emissionIntensity, keycapEmissionIntensity,
    metalness, roughness,
    waveEnabled,
  } = useControls('Glossy Keyboard', {
    posX: { value: 0.2,  min: -10, max: 10, step: 0.1 },
    posY: { value: -0.0, min: -10, max: 10, step: 0.1 },
    posZ: { value: 2.7,  min: -10, max: 10, step: 0.1 },
    rotX: { value: 1.10, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotY: { value: 0.40, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotZ: { value: 0.17, min: -Math.PI, max: Math.PI, step: 0.01 },
    scale: { value: 3.5, min: 0.1, max: 6, step: 0.1 },
    emissionColor:          { value: '#00ffcc' },
    emissionIntensity:      { value: 0.5,  min: 0, max: 10,  step: 0.1 },
    keycapEmissionIntensity:{ value: 0.10, min: 0, max: 5,   step: 0.05 },
    metalness: { value: 0.30, min: 0, max: 1, step: 0.05 },
    roughness:  { value: 0.30, min: 0, max: 1, step: 0.05 },
    waveEnabled: { value: true, label: 'Hero Wave' },
  })

  // Apply materials on change
  useEffect(() => {
    if (!groupRef.current) return
    const emissiveColor = new THREE.Color(emissionColor)
    groupRef.current.traverse((child) => {
      if (!child.isMesh) return
      if (child.name === 'Knob' || child.name === 'knob') {
        child.material = new THREE.MeshStandardMaterial({
          color: child.material.color || new THREE.Color(0xCCCCCC),
          emissive: emissiveColor, emissiveIntensity: 0.1, metalness, roughness,
        })
      } else if (child.name.toLowerCase().includes('emission')) {
        child.material = new THREE.MeshStandardMaterial({
          color: emissiveColor, emissive: emissiveColor,
          emissiveIntensity: emissionIntensity, metalness: 0, roughness: 0.1, toneMapped: false,
        })
      } else if (child.name.startsWith('K_')) {
        child.material = new THREE.MeshStandardMaterial({
          color: child.material.color || new THREE.Color(0x333333),
          emissive: emissiveColor, emissiveIntensity: keycapEmissionIntensity, metalness, roughness,
        })
      } else {
        child.material = new THREE.MeshStandardMaterial({
          color: child.material.color || new THREE.Color(0x1A1A1A), metalness, roughness,
        })
      }
      child.material.needsUpdate = true
    })
    readyRef.current = true
  }, [emissionColor, emissionIntensity, keycapEmissionIntensity, metalness, roughness])

  // Attach the column wave (runs independently when waveEnabled)
  useColumnWave(waveEnabled ? groupRef : { current: null }, {
    lift:         0.06,
    duration:     0.40,
    columnDelay:  0.042,
    interval:     5000,
    accentColor:  emissionColor,
  })

  return (
    <group ref={groupRef} position={[posX, posY, posZ]} rotation={[rotX, rotY, rotZ]} scale={scale}>
      <KeyboardGlossyModel />
    </group>
  )
}
