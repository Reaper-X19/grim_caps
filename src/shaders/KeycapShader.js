import * as THREE from 'three'

// Vertex shader - passes world position and UV to fragment shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    
    // Calculate world position
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    // Calculate world normal for lighting
    vNormal = normalize(normalMatrix * normal);
    
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

// Fragment shader - maps texture based on world position across selected keys
const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec3 uBaseColor;
  uniform vec2 uBoundsMin;
  uniform vec2 uBoundsMax;
  uniform float uZoom;
  uniform vec2 uOffset;
  uniform float uRotation;
  uniform bool uHasTexture;
  uniform vec3 uEmissive;
  uniform float uEmissiveIntensity;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  
  void main() {
    // Start with base color
    vec3 color = uBaseColor;
    
    if (uHasTexture) {
      // Map world position (XZ plane) to UV coordinates (0-1 range)
      // This creates a unified texture across all selected keys
      vec2 uv = (vWorldPosition.xz - uBoundsMin) / (uBoundsMax - uBoundsMin);
      
      // Flip Y coordinate to fix inversion (OpenGL vs image coordinate system)
      uv.y = 1.0 - uv.y;
      
      // Apply zoom (centered)
      uv = (uv - 0.5) / uZoom + 0.5;
      
      // Apply position offset (scaled down for minor adjustments)
      // Slider values are -10 to 10, we scale by 0.01 to get -0.1 to 0.1
      uv += uOffset * 0.01;
      
      // Apply rotation around center
      if (uRotation != 0.0) {
        float s = sin(uRotation);
        float c = cos(uRotation);
        vec2 centered = uv - 0.5;
        uv = vec2(
          c * centered.x - s * centered.y,
          s * centered.x + c * centered.y
        ) + 0.5;
      }
      
      // Clamp UV coordinates to prevent repetition (0-1 range only)
      uv = clamp(uv, 0.0, 1.0);
      
      // Sample texture only if within valid bounds
      vec4 texColor = texture2D(uTexture, uv);
      
      // Mix texture with base color
      color = mix(color, texColor.rgb, texColor.a);
    }
    
    // Simple lighting (ambient + directional)
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 ambient = vec3(0.3);
    vec3 lighting = ambient + diff * 0.7;
    
    color *= lighting;
    
    // Add emissive (for selection highlight)
    color += uEmissive * uEmissiveIntensity;
    
    gl_FragColor = vec4(color, 1.0);
  }
`

/**
 * Create a custom shader material for keycaps
 * @param {Object} options - Material options
 * @returns {THREE.ShaderMaterial}
 */
export function createKeycapMaterial(options = {}) {
  const {
    texture = null,
    baseColor = '#ffffff',
    boundsMin = new THREE.Vector2(0, 0),
    boundsMax = new THREE.Vector2(1, 1),
    zoom = 1,
    offset = new THREE.Vector2(0, 0),
    rotation = 0,
    emissive = new THREE.Color(0x000000),
    emissiveIntensity = 0,
  } = options

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture: { value: texture },
      uBaseColor: { value: new THREE.Color(baseColor) },
      uBoundsMin: { value: boundsMin },
      uBoundsMax: { value: boundsMax },
      uZoom: { value: zoom },
      uOffset: { value: offset },
      uRotation: { value: rotation },
      uHasTexture: { value: texture !== null },
      uEmissive: { value: emissive },
      uEmissiveIntensity: { value: emissiveIntensity },
    },
    side: THREE.DoubleSide,
  })

  return material
}

/**
 * Update material uniforms
 * @param {THREE.ShaderMaterial} material
 * @param {Object} updates
 */
export function updateKeycapMaterial(material, updates) {
  if (!material || !material.uniforms) return

  if (updates.texture !== undefined) {
    material.uniforms.uTexture.value = updates.texture
    material.uniforms.uHasTexture.value = updates.texture !== null
  }

  if (updates.baseColor !== undefined) {
    material.uniforms.uBaseColor.value = new THREE.Color(updates.baseColor)
  }

  if (updates.boundsMin !== undefined) {
    material.uniforms.uBoundsMin.value = updates.boundsMin
  }

  if (updates.boundsMax !== undefined) {
    material.uniforms.uBoundsMax.value = updates.boundsMax
  }

  if (updates.zoom !== undefined) {
    material.uniforms.uZoom.value = updates.zoom
  }

  if (updates.offset !== undefined) {
    material.uniforms.uOffset.value = updates.offset
  }

  if (updates.rotation !== undefined) {
    material.uniforms.uRotation.value = updates.rotation
  }

  if (updates.emissive !== undefined) {
    material.uniforms.uEmissive.value = updates.emissive
  }

  if (updates.emissiveIntensity !== undefined) {
    material.uniforms.uEmissiveIntensity.value = updates.emissiveIntensity
  }

  material.uniformsNeedUpdate = true
}

/**
 * Calculate bounding box for a set of keys in world space
 * @param {THREE.Group} keyboardGroup - The keyboard group
 * @param {string[]} keyNames - Array of key names
 * @returns {Object} { min: Vector2, max: Vector2 }
 */
export function calculateKeysBoundingBox(keyboardGroup, keyNames) {
  if (!keyboardGroup || keyNames.length === 0) {
    return {
      min: new THREE.Vector2(0, 0),
      max: new THREE.Vector2(1, 1),
    }
  }

  let minX = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxZ = -Infinity

  keyboardGroup.traverse((child) => {
    if (child.isMesh && keyNames.includes(child.name)) {
      // CRITICAL FIX: Calculate actual geometry bounds, not just center point
      // Get the bounding box of the geometry
      if (!child.geometry.boundingBox) {
        child.geometry.computeBoundingBox()
      }
      
      const bbox = child.geometry.boundingBox
      
      // Transform the 8 corners of the bounding box to world space
      const corners = [
        new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z),
        new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.max.z),
        new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z),
        new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.max.z),
        new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z),
        new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.max.z),
        new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.min.z),
        new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z),
      ]
      
      // Transform each corner to world space and update bounds
      corners.forEach(corner => {
        const worldCorner = corner.applyMatrix4(child.matrixWorld)
        minX = Math.min(minX, worldCorner.x)
        minZ = Math.min(minZ, worldCorner.z)
        maxX = Math.max(maxX, worldCorner.x)
        maxZ = Math.max(maxZ, worldCorner.z)
      })
    }
  })

  // Add small padding to ensure texture covers keys properly
  const padding = 0.001
  minX -= padding
  minZ -= padding
  maxX += padding
  maxZ += padding

  return {
    min: new THREE.Vector2(minX, minZ),
    max: new THREE.Vector2(maxX, maxZ),
  }
}

