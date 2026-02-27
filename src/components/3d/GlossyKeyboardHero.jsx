/**
 * GlossyKeyboardHero — v8  (Gravity Drop Reveal + Mouse Parallax)
 *
 * ANIMATION:
 *   1. Keyboard starts ABOVE viewport: y=+4.5, tilted back (rotZ=0.6),
 *      slightly scaled down (0.7×), with subtle X-tilt offset.
 *   2. Phase 1 — GRAVITY DROP (0.8s, power2.in):
 *      Falls from above with accelerating speed (realistic gravity feel).
 *   3. Phase 2 — ELASTIC SETTLE (1.2s, elastic.out):
 *      Overshoots final Y slightly, then bounces to rest.
 *      Rotation and scale ease to final Leva values simultaneously.
 *   4. Phase 3 — GLOW PULSE (0.6s):
 *      Brief emission intensity spike on landing for visual impact.
 *   5. After: ultra-subtle mouse parallax (±0.024 rad range, 0.032 lag).
 *      No idle rotation, no breathing — keyboard responds only to mouse.
 *
 * STRUCTURE (flat — no nested wrapper conflicts):
 *   introRef   → position.y drop + rotation.z tilt
 *     posGroup → Leva position [posX, posY, posZ]
 *       modelRef → quaternion written by useFrame (Leva base + mouse parallax)
 *         <KeyboardGlossyModel />
 */
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

import gsap from 'gsap'
import { KeyboardGlossyModel } from './Keyboard_Glossy'

// Reusable objects (zero GC per frame)
const _qBase   = new THREE.Quaternion()
const _qMouseX = new THREE.Quaternion()
const _qMouseY = new THREE.Quaternion()
const _euler   = new THREE.Euler()
const _axisX   = new THREE.Vector3(1, 0, 0)
const _axisY   = new THREE.Vector3(0, 1, 0)

// Module-level camera shake state shared between component & rig
const _heroShake = { x: 0, y: 0 }

// ─── Camera rig ───────────────────────────────────────────────────────────────
// Exported so the parent page can mount it inside the same <Canvas>
export function HeroCameraRig({ mouse }) {
  useFrame(({ camera }) => {
    const tx = (mouse?.current?.x ?? 0) * 0.10
    const ty = (mouse?.current?.y ?? 0) * 0.05 + 0.05
    camera.position.x += (tx + _heroShake.x - camera.position.x) * 0.030
    camera.position.y += (ty + _heroShake.y - camera.position.y) * 0.030
    // Decay shake
    _heroShake.x *= 0.82
    _heroShake.y *= 0.82
    camera.lookAt(0, 0.1, 0)
  })
  return null
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GlossyKeyboardHero({ mouse }) {
  const modelRef   = useRef()   // keyboard group — quaternion via useFrame
  const introRef   = useRef()   // outer group — GSAP animates position/rotation/scale
  const readyRef   = useRef(false)
  const [landed, setLanded] = useState(false)

  // Mouse parallax smoothed values
  const mouseX = useRef(0)
  const mouseY = useRef(0)

  // Glow pulse ref — multiplied into emission during landing
  const glowMult = useRef(1.0)

  // Production defaults
  const posX = 0.2, posY = -0.0, posZ = 2.7
  const rotX = 1.10, rotY = 0.40, rotZ = 0.17
  const scale = 3.5
  const emissionColor = '#00ffcc'
  const emissionIntensity = 0.5
  const keycapEmissionIntensity = 0.10
  const metalness = 0.30
  const roughness = 0.30

  // ─── Materials + GSAP intro ──────────────────────────────────────────────────
  useEffect(() => {
    if (!modelRef.current) return

    const emissiveColor = new THREE.Color(emissionColor)

    // Material application (runs on every dep change for Leva reactivity)
    const currentGlow = glowMult.current
    modelRef.current.traverse(child => {
      if (!child.isMesh) return
      if (child.name === 'Knob' || child.name === 'knob') {
        child.material = new THREE.MeshStandardMaterial({
          color: child.material.color || new THREE.Color(0xCCCCCC),
          emissive: emissiveColor, emissiveIntensity: 0.1 * currentGlow,
          metalness, roughness,
        })
      } else if (child.name.toLowerCase().includes('emission')) {
        child.material = new THREE.MeshStandardMaterial({
          color: emissiveColor, emissive: emissiveColor,
          emissiveIntensity: emissionIntensity * currentGlow,
          metalness: 0, roughness: 0.1, toneMapped: false,
        })
      } else if (child.name.startsWith('K_')) {
        child.material = new THREE.MeshStandardMaterial({
          color: child.material.color || new THREE.Color(0x333333),
          emissive: emissiveColor,
          emissiveIntensity: keycapEmissionIntensity * currentGlow,
          metalness, roughness,
        })
      } else {
        child.material = new THREE.MeshStandardMaterial({
          color: child.material.color || new THREE.Color(0x1A1A1A),
          metalness, roughness,
        })
      }
      child.material.needsUpdate = true
    })

    // ── GSAP intro — runs once ───────────────────────────────────────────────
    if (!readyRef.current && introRef.current) {
      readyRef.current = true
      const g = introRef.current

      // ── Starting pose: above viewport, tilted back, smaller ────────────
      g.position.set(0, 4.5, 0)       // way above final pos
      g.rotation.set(0.3, 0, 0.6)     // tilted back + sideways
      g.scale.setScalar(0.7)           // 70% scale — grows on landing

      const tl = gsap.timeline()

      // ── Windup anticipation: tilt FURTHER back before the fall ────────────
      tl.to(g.rotation, { z: 0.88, duration: 0.28, ease: 'power2.out' }, 0.0)

      // ── Phase 1: Gravity drop — accelerating fall ─────────────────────────
      // Y drops from 4.5 → -0.3 (slight overshoot below final 0)
      tl.to(g.position, {
        y: -0.3,
        duration: 0.9,
        ease: 'power2.in', // accelerating — feels like gravity
      }, 0.3) // 0.3s delay so keyboard is visible before falling

      // Rotation starts unwinding during fall
      tl.to(g.rotation, {
        x: 0, z: 0.08, // almost settled but not quite
        duration: 0.9,
        ease: 'power2.in',
      }, 0.3)

      // ── Phase 2: Elastic bounce — overshoots and settles ───────────────────
      tl.to(g.position, {
        y: 0,
        duration: 1.6,
        ease: 'elastic.out(1.2, 0.30)',  // snappier multi-bounce
      }, 1.2)

      // Rotation finishes settling
      tl.to(g.rotation, {
        x: 0, y: 0, z: 0,
        duration: 1.2,
        ease: 'power3.out',
      }, 1.2)

      // Scale snaps to full
      tl.to(g.scale, {
        x: 1, y: 1, z: 1,
        duration: 1.0,
        ease: 'back.out(1.4)', // slight overshoot for punch
      }, 1.0)

      // ── Camera JOLT on landing ───────────────────────────────────────────────────
      tl.call(() => {
        _heroShake.y = -0.40
        _heroShake.x = (Math.random() - 0.5) * 0.22
      }, null, 1.22)

      // ── Phase 3: Glow pulse on landing ─────────────────────────────────
      // Emission spikes briefly on impact
      tl.to(glowMult, {
        current: 3.0,
        duration: 0.15,
        ease: 'power2.in',
      }, 1.15)
      tl.to(glowMult, {
        current: 1.0,
        duration: 0.8,
        ease: 'power3.out',
      }, 1.30)

      // ── Mark landed — enables mouse parallax ───────────────────────────
      tl.call(() => setLanded(true), null, 2.6)
    }
  }, [emissionColor, emissionIntensity, keycapEmissionIntensity, metalness, roughness])

  // ─── Per-frame: Leva base rotation + mouse parallax ──────────────────────────
  useFrame(() => {
    if (!modelRef.current) return

    // 1. Base quaternion from Leva
    _euler.set(rotX, rotY, rotZ, 'XYZ')
    _qBase.setFromEuler(_euler)

    // 2. Mouse parallax (only after landing)
    if (landed) {
      const mx = mouse?.current?.x ?? 0
      const my = mouse?.current?.y ?? 0
      mouseX.current += (my * -0.048 - mouseX.current) * 0.040
      mouseY.current += (mx *  0.030 - mouseY.current) * 0.040

      _qMouseX.setFromAxisAngle(_axisX, mouseX.current)
      _qMouseY.setFromAxisAngle(_axisY, mouseY.current)
      _qBase.multiply(_qMouseX).multiply(_qMouseY)
    }

    // 3. Apply
    modelRef.current.quaternion.copy(_qBase)

    // 4. Update emission glow if pulse is active
    if (glowMult.current !== 1.0 && modelRef.current) {
      const emissiveColor = new THREE.Color(emissionColor)
      modelRef.current.traverse(child => {
        if (!child.isMesh) return
        if (child.name.toLowerCase().includes('emission')) {
          child.material.emissiveIntensity = emissionIntensity * glowMult.current
        } else if (child.name.startsWith('K_')) {
          child.material.emissiveIntensity = keycapEmissionIntensity * glowMult.current
        }
      })
    }
  })

  return (
    <group ref={introRef}>
      <group position={[posX, posY, posZ]}>
        <group ref={modelRef} scale={scale}>
          <KeyboardGlossyModel />
        </group>
      </group>
    </group>
  )
}
