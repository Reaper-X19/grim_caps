import { useRef, useEffect } from 'react'
import { useControls } from 'leva'
import * as THREE from 'three'
import { KeyboardGlossyModel } from './Keyboard_Glossy'

export default function GlossyKeyboardHero() {
  const groupRef = useRef()
  
  // Leva controls for position, rotation, and emission properties
  const {
    posX,
    posY,
    posZ,
    rotX,
    rotY,
    rotZ,
    scale,
    emissionColor,
    emissionIntensity,
    keycapEmissionIntensity,
    metalness,
    roughness
  } = useControls('Glossy Keyboard', {
    // Position controls - centered for hero shot
    posX: { value: 0.2, min: -10, max: 10, step: 0.1 },
    posY: { value: -0.0, min: -10, max: 10, step: 0.1 },
    posZ: { value: 2.7, min: -10, max: 10, step: 0.1 },
    
    // Rotation controls - dynamic angle for hero shot
    rotX: { value: 1.10, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotY: { value: 0.40, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotZ: { value: 0.17, min: -Math.PI, max: Math.PI, step: 0.01 },
    
    // Scale - larger for hero presence
    scale: { value: 3.5, min: 0.1, max: 6, step: 0.1 },
    
    // Emission properties - Subtle glow
    emissionColor: { value: '#00ffcc' },
    emissionIntensity: { value: 0.5, min: 0, max: 10, step: 0.1 },
    keycapEmissionIntensity: { value: 0.10, min: 0, max: 5, step: 0.05 },
    
    // Material properties - Glossy finish
    metalness: { value: 0.30, min: 0, max: 1, step: 0.05 },
    roughness: { value: 0.30, min: 0, max: 1, step: 0.05 }
  })
  
  // Apply glossy materials to keyboard
  useEffect(() => {
    if (!groupRef.current) return
    
    const emissiveColor = new THREE.Color(emissionColor)
    
    groupRef.current.traverse((child) => {
      if (child.isMesh) {
        const originalMaterial = child.material
        
        // KNOB - Glossy metallic
        if (child.name === 'Knob' || child.name === 'knob') {
          child.material = new THREE.MeshStandardMaterial({
            color: originalMaterial.color || new THREE.Color(0xCCCCCC),
            emissive: emissiveColor,
            emissiveIntensity: 0.1,
            metalness: metalness,
            roughness: roughness
          })
          child.material.needsUpdate = true
          return
        }
        
        // EMISSION STRIPS - Subtle glow
        if (child.name === 'emission_plate' || 
            child.name === 'emission_border' ||
            child.name === 'Emission_Plate' ||
            child.name === 'Emission_Border' ||
            child.name.toLowerCase().includes('emission')) {
          
          child.material = new THREE.MeshStandardMaterial({
            color: emissiveColor,
            emissive: emissiveColor,
            emissiveIntensity: emissionIntensity,
            metalness: 0,
            roughness: 0.1,
            toneMapped: false
          })
          child.material.needsUpdate = true
          return
        }
        
        // KEYCAPS - Solid glossy with original colors
        if (child.name.startsWith('K_')) {
          const originalColor = originalMaterial.color || new THREE.Color(0x333333)
          
          child.material = new THREE.MeshStandardMaterial({
            color: originalColor,
            emissive: emissiveColor,
            emissiveIntensity: keycapEmissionIntensity,
            metalness: metalness,
            roughness: roughness
          })
          child.material.needsUpdate = true
          return
        }
        
        // KEYBOARD CASE - Standard material
        child.material = new THREE.MeshStandardMaterial({
          color: originalMaterial.color || new THREE.Color(0x1A1A1A),
          metalness: metalness,
          roughness: roughness
        })
        child.material.needsUpdate = true
      }
    })
  }, [emissionColor, emissionIntensity, keycapEmissionIntensity, metalness, roughness])
  
  return (
    <group
      ref={groupRef}
      position={[posX, posY, posZ]}
      rotation={[rotX, rotY, rotZ]}
      scale={scale}
    >
      <KeyboardGlossyModel />
    </group>
  )
}
