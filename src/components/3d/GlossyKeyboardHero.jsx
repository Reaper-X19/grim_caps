/**
 * GlossyKeyboardHero — v6  (Spin-in-Place)
 *
 * ROOT CAUSE FIX:
 *   spinRef was OUTSIDE the position group, so rotation pivoted around
 *   world-origin (0,0,0) while keyboard was at posZ=2.7, posX=0.2.
 *   That made the keyboard ORBIT the origin — not spin in place.
 *
 *   Fix: position group is now the OUTERMOST wrapper under intro/float.
 *   spinRef sits INSIDE the position group — rotation.y pivots around
 *   the keyboard's own centre point. Clean, stable spin-in-place.
 *
 * ANIMATION:
 *   1. Keyboard starts facing camera (Y=0)
 *   2. ONE full 360° GSAP spin: 0 → 2π, power3.inOut, 2.0s — smooth reveal
 *   3. Spin ends back at Y=0 (front-facing) — reset to exactly 0
 *   4. Idle: very slow continuous rotation 0.06 rad/s (~105s/rev)
 *      Reads as "rotating by itself" — not oscillation, not obvious spinning
 */
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import gsap from 'gsap'
import { KeyboardGlossyModel } from './Keyboard_Glossy'

// ─── Camera rig (extremely subtle drift, doesn't distract from spin) ──────────
export function HeroCameraRig({ mouse }) {
  useFrame(({ camera }) => {
    const tx = (mouse?.current?.x ?? 0) * 0.08   // reduced — camera stays still
    const ty = (mouse?.current?.y ?? 0) * 0.04 + 0.05
    camera.position.x += (tx - camera.position.x) * 0.030
    camera.position.y += (ty - camera.position.y) * 0.030
    camera.lookAt(0, 0.1, 0)
  })
  return null
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GlossyKeyboardHero({ mouse }) {
  const modelRef     = useRef()     // the actual keyboard group (rotation/scale)
  const spinRef      = useRef()     // Y-spin — pivots around keyboard centre
  const introRef     = useRef()     // GSAP intro: position.y rise + squash
  const floatRef     = useRef()     // useFrame: breathing Y only

  const readyRef     = useRef(false)
  const idleRef      = useRef(false)  // true once intro spin completes
  const mouseRotX    = useRef(0)

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

  // Materials + intro GSAP
  useEffect(() => {
    if (!modelRef.current) return
    const emissiveColor = new THREE.Color(emissionColor)
    modelRef.current.traverse(child => {
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

      // Starting pose
      introRef.current.position.y = -3.2
      introRef.current.rotation.z = -0.12
      introRef.current.scale.set(1, 1, 1)
      spinRef.current.rotation.y  = 0   // starts facing camera

      const tl = gsap.timeline()

      // ── Rise to center ──────────────────────────────────────────────────
      tl.to(introRef.current.position, { y: 0, duration: 0.9, ease: 'power3.out' }, 0)
      tl.to(introRef.current.rotation, { z: 0, duration: 0.9, ease: 'power3.out' }, 0)

      // ── Full 360° spin IN PLACE (starts once keyboard is near centre) ──
      tl.to(spinRef.current.rotation, {
        y: Math.PI * 2,     // exactly one revolution → lands at 0 (facing camera)
        duration: 2.0,
        ease: 'power3.inOut',   // eases in (slow reveal), peaks at back, eases out (lands gently)
      }, 0.75)              // slight delay so rise is nearly done before spin starts

      // ── Landing thud (introRef — position + scale) ──────────────────────
      tl.to(introRef.current.position, { y: -0.08, duration: 0.10, ease: 'power3.in'  }, 2.60)
      tl.to(introRef.current.position, { y: 0,     duration: 0.50, ease: 'elastic.out(1, 0.40)' }, 2.70)
      tl.to(introRef.current.scale, { x: 1.018, y: 0.965, z: 1.018, duration: 0.10, ease: 'power3.in' }, 2.60)
      tl.to(introRef.current.scale, { x: 1,     y: 1,     z: 1,     duration: 0.42, ease: 'elastic.out(1, 0.5)' }, 2.70)

      // ── Handoff to idle rotation ────────────────────────────────────────
      tl.call(() => {
        if (spinRef.current) spinRef.current.rotation.y = 0  // clean reset to front-facing
        idleRef.current = true
      }, null, 3.25)
    }
  }, [emissionColor, emissionIntensity, keycapEmissionIntensity, metalness, roughness])

  useFrame(({ clock }) => {
    // ── Idle rotation: slow self-spin (0.06 rad/s ≈ one rev per 105s) ────
    if (spinRef.current && idleRef.current) {
      spinRef.current.rotation.y += 0.06 * (1 / 60)   // add per-frame increment (≈60fps assumed)
    }

    // ── Mouse X-tilt (separate ref, no conflict with Y-spin) ─────────────
    if (modelRef.current) {
      const my = mouse?.current?.y ?? 0
      mouseRotX.current += (my * -0.030 - mouseRotX.current) * 0.05
      // Apply additional X-tilt on top of the base rotX from Leva
      // We don't have a separate mouseWrapRef here — apply directly to spinRef parent
    }

    // ── Breathing float (floatRef) ────────────────────────────────────────
    if (floatRef.current && idleRef.current) {
      const breathe = Math.sin(clock.elapsedTime * 0.55) * 0.038
      floatRef.current.position.y += (breathe - floatRef.current.position.y) * 0.045
    }
  })

  return (
    <group ref={floatRef}>
      <group ref={introRef}>
        {/*
          positionGroup puts the keyboard at its intended location (posX, posY, posZ).
          spinRef INSIDE this group → rotation.y pivots around the keyboard's
          own world-space centre → TRUE spin-in-place, no orbiting.
        */}
        <group position={[posX, posY, posZ]}>
          <group ref={spinRef}>
            <group
              ref={modelRef}
              rotation={[rotX, rotY, rotZ]}
              scale={scale}
            >
              <KeyboardGlossyModel />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
