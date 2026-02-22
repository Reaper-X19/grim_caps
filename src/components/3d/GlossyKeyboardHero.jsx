/**
 * GlossyKeyboardHero — Cinematic Hero Keyboard (v2)
 *
 * CINEMATIC INTRO:
 *   1. Keyboard starts FAR below (y: -4 local → 0), opacity 0
 *   2. 1.4s power3.out rise — "emerges from the void"
 *   3. Emission sweep L→R once assembled (instead of immediate glow)
 *   4. Settle into gentle Y-float (breathing)
 *
 * MOUSE PARALLAX:
 *   Mouse X → keyboard rotation Y  (left/right tilt)
 *   Mouse Y → keyboard rotation X  (forward/back tilt)
 *   Smooth lerp so it trails the cursor, never snaps
 *   Strength tunable — subtle enough to feel immersive, not nauseating
 *
 * NO ORBIT CONTROLS — camera is locked
 */
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import gsap from 'gsap'
import { KeyboardGlossyModel } from './Keyboard_Glossy'
import { KEYBOARD_COLUMNS, buildMeshMap, resolveLayout } from '../playground/keyboardLayout'

// ─── Camera with mouse parallax ──────────────────────────────────────────────
export function HeroCameraRig({ mouse }) {
  useFrame(({ camera }) => {
    // Gently push camera toward mouse-driven look target
    const tx = mouse.current.x * 0.35
    const ty = mouse.current.y * 0.18 + 0.05
    camera.position.x += (tx - camera.position.x) * 0.035
    camera.position.y += (ty - camera.position.y) * 0.035
    camera.lookAt(0, 0.1, 0)
  })
  return null
}

// ─── Column wave (fixed: absolute origY targets) ─────────────────────────────
function useColumnWave(groupRef, {
  lift = 0.06,
  duration = 0.4,
  columnDelay = 0.042,
  interval = 5000,
  accentColor = '#00ffcc',
} = {}) {
  useEffect(() => {
    let timeout
    let tl = null
    function runWave() {
      if (!groupRef.current) { timeout = setTimeout(runWave, 200); return }
      const columns = resolveLayout(KEYBOARD_COLUMNS, buildMeshMap(groupRef.current))
      if (!columns.length) { timeout = setTimeout(runWave, 200); return }

      columns.flat().forEach(m => {
        if (m.userData.origY === undefined) m.userData.origY = m.position.y
      })
      const accent = new THREE.Color(accentColor)
      tl = gsap.timeline({ onComplete: () => { timeout = setTimeout(runWave, interval) } })
      columns.forEach((colMeshes, ci) => {
        const t = ci * columnDelay
        const mats = colMeshes.map(m => m.material)
        colMeshes.forEach(m => {
          tl.to(m.position, { y: m.userData.origY + lift, duration, ease: 'power2.out' }, t)
          tl.to(m.position, { y: m.userData.origY, duration, ease: 'power2.inOut' }, t + duration * 0.6)
        })
        tl.to(mats, {
          emissiveIntensity: 0.35, duration: duration * 0.4, stagger: 0.005,
          onStart() { mats.forEach(mt => mt.emissive?.copy(accent)) },
        }, t)
        tl.to(mats, { emissiveIntensity: 0, duration: duration * 0.7, stagger: 0.005 }, t + duration * 0.55)
      })
    }
    timeout = setTimeout(runWave, 2800)   // wait for intro animation to finish
    return () => { clearTimeout(timeout); tl?.kill() }
  }, []) // eslint-disable-line
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GlossyKeyboardHero({ mouse }) {
  const groupRef    = useRef()
  const wrapperRef  = useRef()   // wrapper for intro animation
  const readyRef    = useRef(false)
  const mouseRotRef = useRef({ x: 0, y: 0 })  // smoothed rotation from mouse

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
    emissionIntensity:      { value: 0.5,  min: 0, max: 10, step: 0.1 },
    keycapEmissionIntensity:{ value: 0.10, min: 0, max: 5,  step: 0.05 },
    metalness: { value: 0.30, min: 0, max: 1, step: 0.05 },
    roughness:  { value: 0.30, min: 0, max: 1, step: 0.05 },
    waveEnabled: { value: true, label: 'Hero Wave' },
  })

  // Apply materials
  useEffect(() => {
    if (!groupRef.current) return
    const emissiveColor = new THREE.Color(emissionColor)
    groupRef.current.traverse(child => {
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

    // ── Cinematic intro (runs only once) ──────────────────────────────
    if (!readyRef.current && wrapperRef.current) {
      readyRef.current = true
      const wrapper = wrapperRef.current

      // Start from below, invisible
      wrapper.position.y = -4
      wrapper.rotation.z = -0.15

      // Rise from void
      gsap.timeline()
        .to(wrapper.position, { y: 0, duration: 1.6, ease: 'power3.out' }, 0)
        .to(wrapper.rotation, { z: 0,  duration: 1.6, ease: 'power3.out' }, 0)
        // Slight dramatic rotation swing during rise
        .from(wrapper.rotation, { y: -0.3, duration: 1.4, ease: 'power2.out' }, 0.1)
    }
  }, [emissionColor, emissionIntensity, keycapEmissionIntensity, metalness, roughness])

  // Mouse → smooth rotation, plus breathing float
  useFrame(({ clock }) => {
    if (!wrapperRef.current) return

    // Mouse parallax (max ±0.12 rad tilt)
    const mouseX = mouse?.current?.x ?? 0
    const mouseY = mouse?.current?.y ?? 0
    mouseRotRef.current.x += (mouseY * -0.10 - mouseRotRef.current.x) * 0.06
    mouseRotRef.current.y += (mouseX *  0.14 - mouseRotRef.current.y) * 0.06

    // Breathing float
    const breathe = Math.sin(clock.elapsedTime * 0.55) * 0.04

    wrapperRef.current.rotation.x = mouseRotRef.current.x
    wrapperRef.current.rotation.y = mouseRotRef.current.y
    wrapperRef.current.position.y = breathe
  })

  useColumnWave(waveEnabled ? groupRef : { current: null }, {
    lift: 0.06, duration: 0.40, columnDelay: 0.042,
    interval: 5000, accentColor: emissionColor,
  })

  return (
    // wrapperRef: animated by intro GSAP and mouse parallax useFrame
    <group ref={wrapperRef}>
      <group ref={groupRef} position={[posX, posY, posZ]} rotation={[rotX, rotY, rotZ]} scale={scale}>
        <KeyboardGlossyModel />
      </group>
    </group>
  )
}
