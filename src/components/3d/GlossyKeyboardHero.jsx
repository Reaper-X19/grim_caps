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
    posX: { value: 0, min: -10, max: 10, step: 0.1 },
    posY: { value: 0.3, min: -10, max: 10, step: 0.1 },
    posZ: { value: 2, min: -10, max: 10, step: 0.1 },
    
    // Rotation controls - dynamic angle for hero shot
    rotX: { value: -0.2, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotY: { value: 0.15, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    
    // Scale - larger for hero presence
    scale: { value: 3.5, min: 0.1, max: 6, step: 0.1 },
    
    // Emission properties - INCREASED for prominent glow
    emissionColor: { value: '#00ffcc' },
    emissionIntensity: { value: 2.0, min: 0, max: 10, step: 0.1 },
    keycapEmissionIntensity: { value: 0.5, min: 0, max: 5, step: 0.05 },
    
    // Material properties - DARKER + GLOSSY GLASS
    metalness: { value: 0.1, min: 0, max: 1, step: 0.05 },
    roughness: { value: 0.2, min: 0, max: 1, step: 0.05 }
  })
  
  // GLASS SPOOKY EFFECT - Transparent keycaps with eerie glow
  useEffect(() => {
    if (!groupRef.current) return
    
    const emissiveColor = new THREE.Color(emissionColor)
    
    // Helper function to create glass-like colors (lighter for transparency)
    const createGlassColor = (originalColor) => {
      if (!originalColor) return new THREE.Color(0x1A3A3A)
      
      const color = originalColor.clone()
      const hsl = { h: 0, s: 0, l: 0 }
      color.getHSL(hsl)
      
      // Lighten to 70% for glass visibility (was 40%)
      hsl.l = hsl.l * 0.7
      
      // Allow brighter colors for glass effect (was 0.1)
      if (hsl.l > 0.25) {
        hsl.l = 0.25
      }
      
      color.setHSL(hsl.h, hsl.s, hsl.l)
      return color
    }
    
    groupRef.current.traverse((child) => {
      if (child.isMesh) {
        const originalMaterial = child.material
        
        // KNOB - Transparent glass effect
        if (child.name === 'Knob' || child.name === 'knob') {
          child.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0x88CCCC), // Light cyan tint
            emissive: emissiveColor,
            emissiveIntensity: 0.3, // Increased glow
            metalness: 0,
            roughness: 0.05, // Ultra glossy
            transmission: 0.85, // Very transparent
            thickness: 0.5,
            ior: 1.5, // Glass refraction
            transparent: true,
            opacity: 0.2
          })
          child.material.needsUpdate = true
          return
        }
        
        // EMISSION STRIPS - Spooky glow
        if (child.name === 'emission_plate' || 
            child.name === 'emission_border' ||
            child.name === 'Emission_Plate' ||
            child.name === 'Emission_Border' ||
            child.name.toLowerCase().includes('emission')) {
          
          child.material = new THREE.MeshStandardMaterial({
            color: emissiveColor,
            emissive: emissiveColor,
            emissiveIntensity: emissionIntensity, // Moderate glow
            metalness: 0,
            roughness: 0.05, // Very glossy
            toneMapped: false
          })
          child.material.needsUpdate = true
          return
        }
        
        // KEYCAPS - GLASS SPOOKY EFFECT
        if (child.name.startsWith('K_')) {
          const originalColor = originalMaterial.color
          const glassColor = createGlassColor(originalColor)
          
          child.material = new THREE.MeshPhysicalMaterial({
            color: glassColor, // Lighter for glass visibility
            emissive: emissiveColor,
            emissiveIntensity: 0.5, // Increased internal glow
            metalness: 0,
            roughness: 0.05, // Ultra glossy glass
            transmission: 0.6, // Strong transparency
            thickness: 0.5,
            ior: 1.5, // Glass refraction
            clearcoat: 0.3, // Extra glossy layer
            clearcoatRoughness: 0.1
          })
          child.material.needsUpdate = true
          return
        }
        
        // KEYBOARD CASE - Dark for contrast
        const originalColor = originalMaterial.color
        const darkenedColor = createGlassColor(originalColor)
        
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x0A0A0A), // Very dark for spooky contrast
          metalness: 0.4,
          roughness: 0.7
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
