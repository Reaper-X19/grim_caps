import { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
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
  const originalMaterialsRef = useRef(new Map()) // Store original materials from GLTF
  const boundingBoxCache = useRef(new WeakMap()) // Cache for calculated bounding boxes

  // Get state from store
  const selectedKeys = useConfiguratorStore((state) => state.selectedKeys)
  const selectionLocked = useConfiguratorStore((state) => state.selectionLocked)
  const selectionMode = useConfiguratorStore((state) => state.selectionMode)
  const keyCustomizations = useConfiguratorStore((state) => state.keyCustomizations)
  const activeLayerId = useConfiguratorStore((state) => state.activeLayerId)
  const layers = useConfiguratorStore((state) => state.layers)

  const toggleKeySelection = useConfiguratorStore((state) => state.toggleKeySelection)
  const setSelectedKeys = useConfiguratorStore((state) => state.setSelectedKeys)
  const updateLayer = useConfiguratorStore((state) => state.updateLayer)

  // Get active layer
  const activeLayer = useMemo(() =>
    layers.find(l => l.id === activeLayerId),
    [layers, activeLayerId]
  )

  // Manually load active layer texture — avoids useTexture hook which causes
  // WebGL context loss on hard reload due to race conditions with placeholder loading
  const [activeTexture, setActiveTexture] = useState(null)
  const activeTextureUrlRef = useRef(null)

  useEffect(() => {
    const url = activeLayer?.textureUrl
    if (!url) {
      setActiveTexture(null)
      activeTextureUrlRef.current = null
      return
    }
    // Skip reload if same URL
    if (url === activeTextureUrlRef.current) return
    activeTextureUrlRef.current = url

    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (texture) => {
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        setActiveTexture(texture)
      },
      undefined,
      (err) => {
        console.warn('Failed to load active layer texture:', err)
        setActiveTexture(null)
      }
    )
  }, [activeLayer?.textureUrl])

  // Handle click on keyboard
  useEffect(() => {
    const handleClick = (event) => {
      if (event.target !== gl.domElement) return

      // Only allow selection when in selection mode and not locked
      if (!selectionMode || selectionLocked) return

      raycaster.setFromCamera(pointer, camera)

      if (!groupRef.current) return

      const intersects = raycaster.intersectObjects(groupRef.current.children, true)

      if (intersects.length > 0) {
        const keycap = intersects.find(hit => hit.object.name && hit.object.name.startsWith('K_'))

        if (keycap) {
          const keyName = keycap.object.name

          // Always use toggle behavior for intuitive on/off clicking
          toggleKeySelection(keyName)

          event.stopPropagation()
        }
      }
    }

    gl.domElement.addEventListener('click', handleClick)

    return () => {
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [camera, raycaster, pointer, gl, toggleKeySelection, selectionMode, selectionLocked])

  // Apply materials and real-time updates
  useEffect(() => {
    if (!groupRef.current) return

    // Calculate bounding box for selected keys (for live preview)
    const selectedBounds = calculateKeysBoundingBox(groupRef.current, selectedKeys)

    // Store bounding box in active layer for persistence
    if (selectedKeys.length > 0 && activeLayerId) {
      updateLayer(activeLayerId, { boundingBox: selectedBounds })
    }

    groupRef.current.traverse((child) => {
      if (child.isMesh && child.name && child.name.startsWith('K_')) {
        const keyName = child.name

        // Store original material on first encounter
        if (!originalMaterialsRef.current.has(keyName)) {
          originalMaterialsRef.current.set(keyName, child.material.clone())
        }

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

          // Use saved bounding box if available, otherwise calculate from keyGroup with caching
          if (customization.boundingBox) {
            boundsToUse = customization.boundingBox
          } else if (customization.keyGroup && customization.keyGroup.length > 0) {
            // Check cache first to avoid expensive recalculation every frame
            const groupRef = customization.keyGroup
            if (boundingBoxCache.current.has(groupRef)) {
              boundsToUse = boundingBoxCache.current.get(groupRef)
            } else {
              boundsToUse = calculateKeysBoundingBox(groupRef.current, customization.keyGroup)
              boundingBoxCache.current.set(groupRef, boundsToUse)
            }
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
          textureToUse = (activeLayer.textureUrl && activeTexture) ? activeTexture : null
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
              // ONLY show highlight during active selection mode (not when locked after applying)
              emissive: (isSelected && selectionMode && !selectionLocked) ? new THREE.Color('#00ffcc') : new THREE.Color('#000000'),
              emissiveIntensity: (isSelected && selectionMode && !selectionLocked) ? 0.3 : 0,
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
              // ONLY show highlight during active selection mode (not when locked after applying)
              emissive: (isSelected && selectionMode && !selectionLocked) ? new THREE.Color('#00ffcc') : new THREE.Color('#000000'),
              emissiveIntensity: (isSelected && selectionMode && !selectionLocked) ? 0.3 : 0,
            })
          }
        } else {
          // No customization or selection - restore original material
          // CRITICAL: Restore original material to preserve keycap colors

          if (child.material.isShaderMaterial) {
            // If currently using shader material, restore original
            const originalMaterial = originalMaterialsRef.current.get(keyName)
            if (originalMaterial) {
              child.material = originalMaterial.clone()
              // Clear any shader material reference
              materialsRef.current.delete(keyName)
            }
          }

          // Apply selection highlight ONLY if in active selection mode (not locked)
          if (isSelected && selectionMode && !selectionLocked) {
            // Ensure we have a cloned material to modify
            if (!child.material.userData.isModified) {
              child.material = child.material.clone()
              child.material.userData.isModified = true
            }
            child.material.emissive = new THREE.Color('#00ffcc')
            child.material.emissiveIntensity = 0.3
          } else {
            // Not in active selection - ensure emissive is cleared
            if (child.material.userData.isModified) {
              // Restore completely original material
              const originalMaterial = originalMaterialsRef.current.get(keyName)
              if (originalMaterial) {
                child.material = originalMaterial.clone()
              }
            } else {
              // Just ensure emissive is off
              child.material.emissive = new THREE.Color('#000000')
              child.material.emissiveIntensity = 0
            }
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
    activeTexture,
    selectionMode,
    selectionLocked
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
