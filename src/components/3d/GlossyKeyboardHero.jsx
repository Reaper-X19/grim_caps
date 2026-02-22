/**
 * GlossyKeyboardHero — Cinematic Hero Keyboard (v4 — SPIN)
 *
 * ANIMATION:
 *   Intro: keyboard rises from below + SPINS fast on Y-axis (coin-flip entry)
 *   Landing: spin decelerates dramatically when it thuds
 *   After landing: slow continuous Y-rotation (showroom turntable, ~30s/rev)
 *   Breathing: gentle Y-float runs independently on floatRef
 *   Mouse parallax: very subtle X-tilt (Y is controlled by spin)
 *
 * LAYER STACK (no conflicts):
 *   floatRef   → useFrame: breathing Y only
 *   introRef   → GSAP: rise + squash — never breathe
 *   spinRef    → useFrame: Y-spin only (speed lerps from fast → slow)
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
  const groupRef     = useRef()     // Leva controls
  const mouseWrapRef = useRef()     // useFrame: mouse X-tilt only
  const spinRef      = useRef()     // useFrame: Y-spin only
  const introRef     = useRef()     // GSAP: rise + squash
  const floatRef     = useRef()     // useFrame: breathing Y only

  const readyRef       = useRef(false)
  const introDoneRef   = useRef(false)
  const spinSpeedRef   = useRef(3.8)   // rad/s — fast during intro, slows after landing
  const mouseRotX      = useRef(0)     // smoothed mouse X-tilt

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

  // Materials + GSAP intro
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

    if (!readyRef.current && introRef.current) {
      readyRef.current = true
      const intro = introRef.current

      intro.position.y = -3.5
      intro.rotation.z = -0.12
      intro.scale.set(1, 1, 1)

      gsap.timeline()
        // Rise from void
        .to(intro.position, { y: 0, duration: 1.55, ease: 'power3.out' }, 0)
        .to(intro.rotation, { z: 0, duration: 1.55, ease: 'power3.out' }, 0)
        // Landing thud on introRef — GSAP owns this, never useFrame
        .to(intro.position, { y: -0.10, duration: 0.10, ease: 'power3.in' }, 1.50)
        .to(intro.position, { y: 0,     duration: 0.55, ease: 'elastic.out(1, 0.40)' }, 1.60)
        // Squash-and-stretch on introRef.scale only
        .to(intro.scale, { x: 1.022, y: 0.960, z: 1.022, duration: 0.10, ease: 'power3.in' }, 1.50)
        .to(intro.scale, { x: 1,     y: 1,     z: 1,     duration: 0.42, ease: 'elastic.out(1, 0.5)' }, 1.60)
        // Signal landing done → spin slows, breathing starts
        .call(() => { introDoneRef.current = true }, null, 2.15)
    }
  }, [emissionColor, emissionIntensity, keycapEmissionIntensity, metalness, roughness])

  // All useFrame motion — each ref owned exclusively
  useFrame(({ clock }, delta) => {
    // ── Spin: Y rotation on spinRef ──────────────────────────────────────
    if (spinRef.current) {
      // Target speed: fast during intro (3.8 rad/s), slow after landing (0.22 rad/s)
      const targetSpeed = introDoneRef.current ? 0.22 : 3.8
      // Decelerate dramatically: snap faster when slowing down for dramatic effect
      const lerpFactor = introDoneRef.current ? 0.025 : 0.006
      spinSpeedRef.current += (targetSpeed - spinSpeedRef.current) * lerpFactor
      spinRef.current.rotation.y += spinSpeedRef.current * delta
    }

    // ── Mouse X-tilt on mouseWrapRef (Y-axis is the spin, so only X here) ──
    if (mouseWrapRef.current) {
      const my = mouse?.current?.y ?? 0
      mouseRotX.current += (my * -0.040 - mouseRotX.current) * 0.06
      mouseWrapRef.current.rotation.x = mouseRotX.current
    }

    // ── Breathing float on floatRef — only after intro done ─────────────
    if (floatRef.current && introDoneRef.current) {
      const breathe = Math.sin(clock.elapsedTime * 0.55) * 0.040
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
