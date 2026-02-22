/**
 * GlossyKeyboardHero — Cinematic Hero Keyboard (v3)
 *
 * JERK FIX: Separated into 3 group layers so GSAP and useFrame NEVER
 * write to the same property on the same object:
 *   floatRef  → useFrame breathing (position.y only)
 *   introRef  → GSAP intro (position.y + rotation.z + scale)
 *   mouseRef  → useFrame mouse parallax (rotation.x/y only)
 *   groupRef  → Leva controls (position/rotation/scale final)
 *
 * INTRO (GSAP, introRef):
 *   t=0.00  rise from y=-3.5 with power3.out, z-tilt corrects
 *   t=0.10  Y-swing (rotates then settles)
 *   t=1.50  impact thud: y → -0.08, squash-stretch on scale
 *   t=1.60  elastic bounce back → y=0, scale=1
 *   After t=2.1s: breathing float starts (floatRef, separate group)
 *
 * MOUSE PARALLAX (subtle):
 *   max ±0.05 rad Y, ±0.035 rad X — barely noticeable, feels immersive
 */
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import gsap from 'gsap'
import { KeyboardGlossyModel } from './Keyboard_Glossy'
import { KEYBOARD_COLUMNS, buildMeshMap, resolveLayout } from '../playground/keyboardLayout'

// ─── Camera with mouse parallax (very subtle) ─────────────────────────────────
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

// ─── Column wave ──────────────────────────────────────────────────────────────
function useColumnWave(groupRef, {
  lift = 0.06, duration = 0.4, columnDelay = 0.042,
  interval = 5000, accentColor = '#00ffcc',
} = {}) {
  useEffect(() => {
    let timeout, tl = null
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
    timeout = setTimeout(runWave, 3000)   // after intro finishes
    return () => { clearTimeout(timeout); tl?.kill() }
  }, []) // eslint-disable-line
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GlossyKeyboardHero({ mouse }) {
  const groupRef    = useRef()    // Leva position / rotation / scale
  const mouseWrapRef= useRef()    // useFrame: mouse rotation only
  const introRef    = useRef()    // GSAP intro: y-position + scale (never breathe)
  const floatRef    = useRef()    // useFrame: breathing Y only — never GSAP
  const readyRef    = useRef(false)
  const mouseRotRef = useRef({ x: 0, y: 0 })
  const introDoneRef= useRef(false)  // breathing starts only after this is true

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

  // Apply materials + trigger intro (once)
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

    // ── Cinematic intro — ONLY touches introRef ──────────────────────────────
    if (!readyRef.current && introRef.current) {
      readyRef.current = true
      const intro = introRef.current

      // Reset to starting pose
      intro.position.y = -3.5
      intro.rotation.z = -0.14
      intro.scale.set(1, 1, 1)

      gsap.timeline()
        // Rise from below
        .to(intro.position, { y: 0, duration: 1.55, ease: 'power3.out' }, 0)
        .to(intro.rotation, { z: 0, duration: 1.55, ease: 'power3.out' }, 0)
        .from(intro.rotation, { y: -0.28, duration: 1.35, ease: 'power2.out' }, 0.1)
        // ── Landing thud ──
        .to(intro.position, { y: -0.10, duration: 0.10, ease: 'power3.in' }, 1.50)
        .to(intro.position, { y: 0,     duration: 0.55, ease: 'elastic.out(1, 0.40)' }, 1.60)
        // Squash-and-stretch: ONLY on introRef.scale, not on groupRef.scale
        .to(intro.scale, { x: 1.020, y: 0.962, z: 1.020, duration: 0.10, ease: 'power3.in'  }, 1.50)
        .to(intro.scale, { x: 1,     y: 1,     z: 1,     duration: 0.42, ease: 'elastic.out(1, 0.5)' }, 1.60)
        // Signal that breathing can start
        .call(() => { introDoneRef.current = true }, null, 2.15)
    }
  }, [emissionColor, emissionIntensity, keycapEmissionIntensity, metalness, roughness])

  // Mouse parallax → mouseWrapRef.rotation (NEVER touches position or scale)
  // Breathing → floatRef.position.y (NEVER touches introRef)
  useFrame(({ clock }) => {
    // Mouse rotation
    if (mouseWrapRef.current) {
      const mx = mouse?.current?.x ?? 0
      const my = mouse?.current?.y ?? 0
      mouseRotRef.current.x += (my * -0.035 - mouseRotRef.current.x) * 0.06
      mouseRotRef.current.y += (mx *  0.050 - mouseRotRef.current.y) * 0.06
      mouseWrapRef.current.rotation.x = mouseRotRef.current.x
      mouseWrapRef.current.rotation.y = mouseRotRef.current.y
    }

    // Breathing — separate floatRef, NEVER touched by GSAP
    if (floatRef.current && introDoneRef.current) {
      const breathe = Math.sin(clock.elapsedTime * 0.55) * 0.038
      floatRef.current.position.y += (breathe - floatRef.current.position.y) * 0.045
    }
  })

  useColumnWave(waveEnabled ? groupRef : { current: null }, {
    lift: 0.06, duration: 0.40, columnDelay: 0.042,
    interval: 5000, accentColor: emissionColor,
  })

  return (
    // floatRef → breathing (useFrame, position.y only)
    <group ref={floatRef}>
      {/* introRef → GSAP intro (position.y, rotation.z, scale) */}
      <group ref={introRef}>
        {/* mouseWrapRef → mouse rotation (rotation.x/y only) */}
        <group ref={mouseWrapRef}>
          {/* groupRef → Leva controls */}
          <group ref={groupRef} position={[posX, posY, posZ]} rotation={[rotX, rotY, rotZ]} scale={scale}>
            <KeyboardGlossyModel />
          </group>
        </group>
      </group>
    </group>
  )
}
