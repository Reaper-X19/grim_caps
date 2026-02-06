import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Model as KeyboardGLTF } from './Keyboard'
import useConfiguratorStore from '../../store/configuratorStore'
import { 
  createKeycapMaterial, 
  updateKeycapMaterial, 
  calculateKeysBoundingBox 
} from '../../shaders/KeycapShader'

export default function KeyboardModel() {
  const groupRef = useRef()
  const { camera, raycaster, pointer, gl } = useThree()
  
  // Store for material references and textures
  const materialsRef = useRef(new Map())
  const texturesRef = useRef(new Map())
  
  // Get state from store
  const selectedKeys = useConfiguratorStore((state) => state.selectedKeys)
  const keyCustomizations = useConfiguratorStore((state) => state.keyCustomizations)
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const layers = useConfiguratorStore((state) => state.layers)
  
  const toggleKeySelection = useConfiguratorStore((state) => state.toggleKeySelection)
  const addToSelection = useConfiguratorStore((state) => state.addToSelection)
  const setSelectedKeys = useConfiguratorStore((state) => state.setSelectedKeys)
  
  // Get active layer
  const activeLayer = useMemo(() => 
    layers.find(l => l.id === activeLayerId),
    [layers, activeLayerId]
  )
  
  // Load texture for active layer
  const activeTexture = useTexture(
    activeLayer?.textureUrl || '/placeholder.png',
    (texture) => {
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
    }
  )
  
  // Handle click on keyboard
  useEffect(() => {
    const handleClick = (event) => {
      if (event.target !== gl.domElement) return
      
      raycaster.setFromCamera(pointer, camera)
      
      if (!groupRef.current) return
      
      const intersects = raycaster.intersectObjects(groupRef.current.children, true)
      
      if (intersects.length > 0) {
        const keycap = intersects.find(hit => hit.object.name && hit.object.name.startsWith('K_'))
        
        if (keycap) {
          const keyName = keycap.object.name
          
          if (event.ctrlKey || event.metaKey) {
            toggleKeySelection(keyName)
          } else if (event.shiftKey) {
            addToSelection(keyName)
          } else {
            setSelectedKeys([keyName])
          }
          
          event.stopPropagation()
        }
      }
    }
    
    gl.domElement.addEventListener('click', handleClick)
    
    return () => {
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [camera, raycaster, pointer, gl, toggleKeySelection, addToSelection, setSelectedKeys])
  
  // Apply materials and real-time updates
  useEffect(() => {
    if (!groupRef.current) return
    
    // Calculate bounding box for selected keys (for live preview)
    const selectedBounds = calculateKeysBoundingBox(groupRef.current, selectedKeys)
    
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.name && child.name.startsWith('K_')) {
        const keyName = child.name
        
        // Check if key is selected
        const isSelected = selectedKeys.includes(keyName)
        
        // Check if key has customization
        const customization = keyCustomizations[keyName]
        
        // Determine what to apply
        let shouldUseShader = false
        let textureToUse = null
        let baseColor = '#ffffff'
        let transforms = {
          zoom: 1,
          positionX: 0,
          positionY: 0,
          rotation: 0
        }
        let boundsToUse = selectedBounds
        
        // Priority 1: Key has customization (applied)
        if (customization) {
          shouldUseShader = true
          baseColor = customization.baseColor || '#ffffff'
          transforms = customization.textureTransform || transforms
          
          // CRITICAL: Use the keyGroup to calculate bounding box for unified mapping
          if (customization.keyGroup && customization.keyGroup.length > 0) {
            boundsToUse = calculateKeysBoundingBox(groupRef.current, customization.keyGroup)
          }
          
          // Load texture if exists
          if (customization.textureUrl) {
            // Check if we already have this texture loaded
            if (!texturesRef.current.has(customization.textureUrl)) {
              const loader = new THREE.TextureLoader()
              loader.load(customization.textureUrl, (texture) => {
                texture.wrapS = THREE.ClampToEdgeWrapping
                texture.wrapT = THREE.ClampToEdgeWrapping
                texturesRef.current.set(customization.textureUrl, texture)
                
                // Update all materials using this texture
                materialsRef.current.forEach((material, key) => {
                  const keyCustom = keyCustomizations[key]
                  if (keyCustom && keyCustom.textureUrl === customization.textureUrl) {
                    updateKeycapMaterial(material, { texture })
                  }
                })
              })
            } else {
              textureToUse = texturesRef.current.get(customization.textureUrl)
            }
          }
        }
        // Priority 2: Key is selected - apply active layer settings in REAL-TIME
        else if (isSelected && activeLayer) {
          shouldUseShader = true
          baseColor = activeLayer.baseColor || '#ffffff'
          transforms = activeLayer.textureTransform || transforms
          textureToUse = activeLayer.textureUrl ? activeTexture : null
          boundsToUse = selectedBounds
        }
        
        // Apply shader material
        if (shouldUseShader) {
          // Create or update shader material
          let material = materialsRef.current.get(keyName)
          
          if (!material || !material.isShaderMaterial) {
            // Create new shader material
            material = createKeycapMaterial({
              texture: textureToUse,
              baseColor: baseColor,
              boundsMin: boundsToUse.min,
              boundsMax: boundsToUse.max,
              zoom: transforms.zoom,
              offset: new THREE.Vector2(transforms.positionX, transforms.positionY),
              rotation: transforms.rotation * Math.PI / 180,
              emissive: isSelected ? new THREE.Color('#00ffcc') : new THREE.Color('#000000'),
              emissiveIntensity: isSelected ? 0.3 : 0,
            })
            
            child.material = material
            materialsRef.current.set(keyName, material)
          } else {
            // Update existing shader material
            updateKeycapMaterial(material, {
              texture: textureToUse,
              baseColor: baseColor,
              boundsMin: boundsToUse.min,
              boundsMax: boundsToUse.max,
              zoom: transforms.zoom,
              offset: new THREE.Vector2(transforms.positionX, transforms.positionY),
              rotation: transforms.rotation * Math.PI / 180,
              emissive: isSelected ? new THREE.Color('#00ffcc') : new THREE.Color('#000000'),
              emissiveIntensity: isSelected ? 0.3 : 0,
            })
          }
        } else {
          // No customization or selection - use original material
          if (!child.material.userData.isOriginal) {
            // Clone original material if not already done
            child.material = child.material.clone()
            child.material.userData.isOriginal = true
          }
          
          // Apply selection highlight to original material
          if (isSelected) {
            child.material.emissive = new THREE.Color('#00ffcc')
            child.material.emissiveIntensity = 0.3
          } else {
            child.material.emissive = new THREE.Color('#000000')
            child.material.emissiveIntensity = 0
          }
        }
        
        // Enable shadows
        child.castShadow = true
        child.receiveShadow = true
        
        child.material.needsUpdate = true
      }
    })
  }, [
    selectedKeys, 
    keyCustomizations, 
    activeLayer?.baseColor, 
    activeLayer?.textureUrl,
    activeLayer?.textureTransform,
    activeTexture
  ])
  
  return (
    <group 
      ref={groupRef} 
      scale={12} 
      position={[0, 0, 0]}
      rotation={[-0.3, 0, 0]}
    >
      <KeyboardGLTF />
    </group>
  )
}
