/**
 * GlossyKeyboardHero — Cinematic Hero Keyboard (v5)
 *
 * ON LOAD:
 *   1. Keyboard rises from below (power3.out, 1.55s) — same cinematic entry
 *   2. Simultaneously: ONE full 360° Y-rotation via GSAP (power3.inOut, 1.8s)
 *      Ends exactly at y=0 (facing camera) — mathematically precise
 *   3. Landing thud at t=1.5s: squash-and-stretch on introRef
 *
 * IDLE (after t=2.15s):
 *   Subtle rocking oscillation: sin(t * 0.35) * 0.12 rad (≈ ±7°)
 *   NOT a continuous revolution — just a gentle, lifelike sway
 *   Mouse X also contributes to the Y-look (very subtle)
 *
 * LAYER STACK (zero conflicts):
 *   floatRef   → useFrame: breathing Y-position only
 *   introRef   → GSAP:     rise + squash/stretch (position.y, scale)
 *   spinRef    → GSAP (360° intro) + useFrame (idle sway) — sequential, no overlap
 *   mouseWrapRef→ useFrame: mouse X-tilt only
 *   groupRef   → Leva controls
 */
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import gsap from 'gsap'
import { KeyboardGlossyModel } from './Keyboard_Glossy'

// ─── Camera rig ───────────────────────────────────────────────────────────────
export function HeroCameraRig({ mouse }) {
  useFrame(({ camera }) => {
    const tx = (mouse?.current?.x ?? 0) * 0.12
    const ty = (mouse?.current?.y ?? 0) * 0.07 + 0.05
    camera.position.x += (tx - camera.position.x) * 0.035
    camera.position.y += (ty - camera.position.y) * 0.035
    camera.lookAt(0, 0.1, 0)
  })
  return null
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GlossyKeyboardHero({ mouse }) {
  const groupRef      = useRef()
  const mouseWrapRef  = useRef()
  const spinRef       = useRef()
  const introRef      = useRef()
  const floatRef      = useRef()

  const readyRef      = useRef(false)
  const introDoneRef  = useRef(false)
  const idleStartRef  = useRef(0)     // clock.elapsedTime when idle began
  const mouseRotX     = useRef(0)

  const {
    posX, posY, posZ,
    rotX, rotY, rotZ,
    scale,
    emissionColor, emissionIntensity, keycapEmissionIntensity,
    metalness, roughness,
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
  })

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

    if (!readyRef.current && introRef.current && spinRef.current) {
      readyRef.current = true

      // Reset starting poses
      introRef.current.position.y = -3.5
      introRef.current.rotation.z = -0.12
      introRef.current.scale.set(1, 1, 1)
      spinRef.current.rotation.y   = 0

      const tl = gsap.timeline()

      // ── Rise from below (introRef) ──────────────────────────────────────
      tl.to(introRef.current.position, { y: 0, duration: 1.55, ease: 'power3.out' }, 0)
      tl.to(introRef.current.rotation, { z: 0, duration: 1.55, ease: 'power3.out' }, 0)

      // ── ONE full 360° spin (spinRef) — ends exactly at y = 2π ≡ 0 ──────
      tl.to(spinRef.current.rotation, {
        y: Math.PI * 2,        // exactly one revolution
        duration: 1.80,
        ease: 'power3.inOut',  // accelerate → decelerate — cinematic
      }, 0)

      // ── Landing thud (introRef — scale & position, GSAP only) ──────────
      tl.to(introRef.current.position, { y: -0.10, duration: 0.10, ease: 'power3.in'  }, 1.50)
      tl.to(introRef.current.position, { y: 0,     duration: 0.55, ease: 'elastic.out(1, 0.40)' }, 1.60)
      tl.to(introRef.current.scale, { x: 1.022, y: 0.960, z: 1.022, duration: 0.10, ease: 'power3.in' }, 1.50)
      tl.to(introRef.current.scale, { x: 1,     y: 1,     z: 1,     duration: 0.42, ease: 'elastic.out(1, 0.5)' }, 1.60)

      // ── After landing: reset spinRef.y to 0 precisely, begin idle ──────
      tl.call(() => {
        if (spinRef.current) spinRef.current.rotation.y = 0  // clean centre position
        introDoneRef.current = true
      }, null, 2.15)
    }
  }, [emissionColor, emissionIntensity, keycapEmissionIntensity, metalness, roughness])

  useFrame(({ clock }) => {
    // ── Idle sway: subtle ±7° oscillation — only after intro ───────────────
    if (spinRef.current && introDoneRef.current) {
      // Record when idle started so sin starts from 0 (keyboard faces forward)
      if (idleStartRef.current === 0) idleStartRef.current = clock.elapsedTime
      const t = clock.elapsedTime - idleStartRef.current
      // Smooth sway: gentle pendulum — NOT a continuous revolution
      const mouseYaw = (mouse?.current?.x ?? 0) * 0.04   // tiny mouse influence
      spinRef.current.rotation.y = Math.sin(t * 0.35) * 0.12 + mouseYaw
    }

    // ── Mouse X-tilt (mouseWrapRef) ─────────────────────────────────────────
    if (mouseWrapRef.current) {
      const my = mouse?.current?.y ?? 0
      mouseRotX.current += (my * -0.035 - mouseRotX.current) * 0.06
      mouseWrapRef.current.rotation.x = mouseRotX.current
    }

    // ── Breathing float (floatRef — separate, never touched by GSAP) ───────
    if (floatRef.current && introDoneRef.current) {
      const breathe = Math.sin(clock.elapsedTime * 0.55) * 0.038
      floatRef.current.position.y += (breathe - floatRef.current.position.y) * 0.045
    }
  })

  return (
    <group ref={floatRef}>
      <group ref={introRef}>
        <group ref={spinRef}>
          <group ref={mouseWrapRef}>
            <group ref={groupRef} position={[posX, posY, posZ]} rotation={[rotX, rotY, rotZ]} scale={scale}>
              <KeyboardGlossyModel />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
