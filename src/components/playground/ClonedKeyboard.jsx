/**
 * ClonedKeyboard
 *
 * Creates a fully independent copy of the keyboard model for each
 * playground animation instance. Critically, it replaces every GLTF
 * material with a new MeshStandardMaterial that:
 *   1. Preserves the original color from the GLTF material
 *   2. Uses metalness=0.30 so it is visible under directional light
 *      WITHOUT requiring an environment cubemap
 *
 * The original GLTF materials are highly metallic (metalness ~0.8-1.0)
 * and appear pitch-black without a fully-rendered environment map.
 * By using metalness=0.30, directional + ambient light provides solid
 * illumination while the original hues are faithfully preserved.
 *
 * Emissive is initialised to black so each scene can add glow effects
 * on top without any setup code.
 */
import { useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Material name → special handling
const EMISSION_NAMES = ['emission_plate', 'emission_border', 'Emission_Plate', 'Emission_Border']

export default function ClonedKeyboard(props) {
  const { scene, materials } = useGLTF('/keyboardcolormodified.gltf')

  const [clone] = useState(() => {
    // Deep-clone the scene graph (true = recursive)
    const c = scene.clone(true)

    // Replace every material with a new MeshStandardMaterial that
    // keeps the original color but uses safe metalness/roughness values
    c.traverse((child) => {
      if (!child.isMesh || !child.material) return

      const orig = child.material

      // Identify emission strips — keep them bright
      const isEmission =
        EMISSION_NAMES.includes(child.name) ||
        (orig.name && orig.name.toLowerCase().includes('emission'))

      if (isEmission) {
        const emissColor = orig.color ? orig.color.clone() : new THREE.Color('#00F0FF')
        child.material = new THREE.MeshStandardMaterial({
          color:             emissColor,
          emissive:          emissColor,
          emissiveIntensity: 0.15,
          metalness: 0,
          roughness: 0.15,
          toneMapped: false,
        })
      } else {
        // Preserve the GLTF color; use safe metalness so directional
        // light illuminates the mesh without an envmap
        const color = orig.color ? orig.color.clone() : new THREE.Color('#888888')
        child.material = new THREE.MeshStandardMaterial({
          color,
          emissive:          new THREE.Color(0, 0, 0),
          emissiveIntensity: 0,
          metalness: 0.12,
          roughness: 0.55,
        })
      }
    })

    return c
  })

  return <primitive object={clone} {...props} />
}
