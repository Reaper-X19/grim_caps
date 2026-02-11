# Materials & Lighting Guide

Comprehensive guide to PBR materials, lighting setups, and visual fidelity in Three.js/R3F.

## Table of Contents
1. [PBR Materials](#pbr-materials)
2. [Material Properties](#material-properties)
3. [Environment Lighting](#environment-lighting)
4. [Light Types](#light-types)
5. [Studio Lighting Setups](#studio-lighting-setups)
6. [Shadows](#shadows)
7. [Post-Processing](#post-processing)

---

## PBR Materials

### MeshStandardMaterial (Recommended)
```jsx
<meshStandardMaterial
  color="#ffffff"
  roughness={0.5}        // 0=mirror, 1=matte
  metalness={0.0}        // 0=dielectric, 1=metal
  map={colorTexture}
  normalMap={normalTexture}
  roughnessMap={roughnessTexture}
  metalnessMap={metalnessTexture}
  aoMap={aoTexture}      // Ambient occlusion
  envMapIntensity={1}
/>
```

### MeshPhysicalMaterial (Advanced PBR)
```jsx
<meshPhysicalMaterial
  // Standard properties
  color="#ffffff"
  roughness={0.1}
  metalness={0.0}
  
  // Physical properties
  clearcoat={1.0}           // Car paint, lacquer
  clearcoatRoughness={0.1}
  
  transmission={1.0}        // Glass, water
  thickness={0.5}
  ior={1.5}                 // Index of refraction
  
  sheen={1.0}               // Fabric, velvet
  sheenColor="#ff88ff"
  sheenRoughness={0.5}
  
  iridescence={1.0}         // Soap bubbles, oil slicks
  iridescenceIOR={1.3}
/>
```

### Common Material Presets

| Material | Roughness | Metalness | Special |
|----------|-----------|-----------|---------|
| Plastic (glossy) | 0.2 | 0 | - |
| Plastic (matte) | 0.8 | 0 | - |
| Metal (polished) | 0.1 | 1 | - |
| Metal (brushed) | 0.4 | 1 | - |
| Rubber | 0.9 | 0 | - |
| Glass | 0.0 | 0 | transmission=1 |
| Car paint | 0.5 | 0.3 | clearcoat=1 |
| Fabric | 0.9 | 0 | sheen=0.5 |
| Ceramic | 0.3 | 0 | - |
| Wood | 0.6 | 0 | - |

---

## Material Properties

### Texture Maps Explained

| Map | Purpose | Format |
|-----|---------|--------|
| map (diffuse) | Base color | sRGB |
| normalMap | Surface detail without geometry | Linear |
| roughnessMap | Roughness variation | Linear (grayscale) |
| metalnessMap | Metal/non-metal areas | Linear (grayscale) |
| aoMap | Baked ambient occlusion | Linear (grayscale) |
| emissiveMap | Self-illumination | sRGB |
| displacementMap | Actual geometry deformation | Linear |

### Texture Setup
```jsx
import { useTexture } from '@react-three/drei'

function TexturedMesh() {
  const [colorMap, normalMap, roughnessMap] = useTexture([
    '/textures/color.jpg',
    '/textures/normal.jpg',
    '/textures/roughness.jpg'
  ])
  
  // Ensure proper color space
  colorMap.colorSpace = THREE.SRGBColorSpace
  
  // Enable repeating
  colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping
  
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial 
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
      />
    </mesh>
  )
}
```

### Normal Map Intensity
```jsx
<meshStandardMaterial
  normalMap={normalTexture}
  normalScale={new THREE.Vector2(1, 1)} // Adjust intensity
/>
```

---

## Environment Lighting

### Environment Presets (drei)
```jsx
import { Environment } from '@react-three/drei'

// Built-in presets
<Environment preset="studio" />    // Product photography
<Environment preset="sunset" />    // Warm outdoor
<Environment preset="dawn" />      // Soft morning
<Environment preset="night" />     // Dark with stars
<Environment preset="apartment" /> // Interior
<Environment preset="city" />      // Urban reflections
<Environment preset="forest" />    // Green natural
<Environment preset="warehouse" /> // Industrial
```

### Custom HDR
```jsx
import { Environment, useEnvironment } from '@react-three/drei'

<Environment
  files="/hdri/studio.hdr"
  background={false}  // Only for reflections
  blur={0.5}
/>

// Or as background
<Environment
  files="/hdri/sunset.hdr"
  background
  ground={{ height: 15, radius: 60, scale: 100 }}
/>
```

### Lightformers (Custom Studio Lights)
```jsx
import { Environment, Lightformer } from '@react-three/drei'

<Environment>
  {/* Key light - main source */}
  <Lightformer 
    position={[5, 5, 2]} 
    scale={[10, 5, 1]} 
    intensity={2}
    color="white"
  />
  
  {/* Fill light - soften shadows */}
  <Lightformer 
    position={[-5, 2, -2]} 
    scale={[5, 5, 1]} 
    intensity={0.5}
    color="#ffe0d0"
  />
  
  {/* Rim light - edge definition */}
  <Lightformer 
    position={[0, 5, -5]} 
    scale={[10, 2, 1]} 
    intensity={1}
    color="#d0e0ff"
  />
</Environment>
```

---

## Light Types

### Ambient Light
```jsx
<ambientLight intensity={0.3} color="#ffffff" />
```
- Uniform light from all directions
- No shadows
- Use sparingly as base illumination

### Directional Light (Sun)
```jsx
<directionalLight 
  position={[10, 10, 5]}
  intensity={1.5}
  castShadow
  shadow-mapSize-width={2048}
  shadow-mapSize-height={2048}
  shadow-camera-far={50}
  shadow-camera-left={-10}
  shadow-camera-right={10}
  shadow-camera-top={10}
  shadow-camera-bottom={-10}
/>
```

### Point Light
```jsx
<pointLight 
  position={[0, 5, 0]}
  intensity={100}  // Note: r155+ uses physical units
  distance={20}    // Falloff distance
  decay={2}        // Physical falloff
  castShadow
/>
```

### Spot Light
```jsx
<spotLight
  position={[0, 10, 0]}
  angle={Math.PI / 6}
  penumbra={0.5}
  intensity={200}
  castShadow
  target-position={[0, 0, 0]}
/>
```

### Rect Area Light (Soft Box)
```jsx
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'

<rectAreaLight
  position={[0, 5, 5]}
  width={10}
  height={10}
  intensity={5}
  color="#ffffff"
  rotation={[-Math.PI / 4, 0, 0]}
/>
```

---

## Studio Lighting Setups

### Three-Point Lighting
```jsx
function StudioLighting() {
  return (
    <>
      {/* Key Light - Main, strongest */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        castShadow
      />
      
      {/* Fill Light - Softer, opposite side */}
      <directionalLight
        position={[-5, 3, 0]}
        intensity={0.5}
      />
      
      {/* Rim/Back Light - Edge definition */}
      <directionalLight
        position={[0, 5, -5]}
        intensity={0.8}
      />
      
      {/* Ambient fill */}
      <ambientLight intensity={0.2} />
    </>
  )
}
```

### Product Photography Setup
```jsx
function ProductLighting() {
  return (
    <>
      <Environment preset="studio" />
      
      {/* Accent light for highlights */}
      <spotLight
        position={[3, 5, 3]}
        intensity={100}
        angle={Math.PI / 8}
        penumbra={0.8}
        castShadow
      />
      
      {/* Soft ground reflection */}
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.5}
        blur={2.5}
        far={4}
      />
      
      {/* Neutral background */}
      <color attach="background" args={['#f0f0f0']} />
    </>
  )
}
```

### Dramatic/Moody Lighting
```jsx
function DramaticLighting() {
  return (
    <>
      {/* Single strong key with deep shadows */}
      <spotLight
        position={[5, 8, 3]}
        intensity={300}
        angle={Math.PI / 5}
        penumbra={0.5}
        castShadow
        shadow-bias={-0.001}
      />
      
      {/* Minimal fill */}
      <ambientLight intensity={0.05} color="#1a1a2e" />
      
      {/* Colored rim */}
      <pointLight
        position={[-3, 2, -3]}
        intensity={20}
        color="#4fc3f7"
      />
    </>
  )
}
```

---

## Shadows

### Shadow Configuration
```jsx
<Canvas shadows={{ type: THREE.PCFSoftShadowMap }}>
  <directionalLight
    castShadow
    shadow-mapSize={[2048, 2048]}
    shadow-camera-near={0.5}
    shadow-camera-far={50}
    shadow-camera-left={-10}
    shadow-camera-right={10}
    shadow-camera-top={10}
    shadow-camera-bottom={-10}
    shadow-bias={-0.0001}
  />
  
  <mesh castShadow>...</mesh>
  <mesh receiveShadow>...</mesh>
</Canvas>
```

### Contact Shadows (Performant)
```jsx
import { ContactShadows } from '@react-three/drei'

<ContactShadows
  position={[0, 0, 0]}
  opacity={0.5}
  scale={10}
  blur={2}
  far={4}
  resolution={256}
  color="#000000"
/>
```

### Accumulative Shadows (Soft)
```jsx
import { AccumulativeShadows, RandomizedLight } from '@react-three/drei'

<AccumulativeShadows
  position={[0, 0, 0]}
  temporal
  frames={100}
  alphaTest={0.85}
  opacity={0.8}
  scale={10}
>
  <RandomizedLight
    amount={8}
    radius={5}
    ambient={0.5}
    intensity={1}
    position={[5, 5, -5]}
  />
</AccumulativeShadows>
```

---

## Post-Processing

### Effect Composer Setup
```jsx
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'

<EffectComposer>
  <Bloom 
    luminanceThreshold={0.9}
    luminanceSmoothing={0.9}
    intensity={0.5}
  />
  <Vignette 
    offset={0.3} 
    darkness={0.5} 
  />
</EffectComposer>
```

### Common Effects

| Effect | Use Case | Performance |
|--------|----------|-------------|
| Bloom | Glowing lights, HDR feel | Medium |
| Vignette | Focus attention center | Low |
| Depth of Field | Tilt-shift, cinematic | High |
| SSAO | Ambient occlusion | High |
| Chromatic Aberration | Lens effect | Low |
| Noise | Film grain, vintage | Low |
| ToneMapping | HDR to SDR | Low |

### Selective Bloom
```jsx
import { Selection, Select, EffectComposer, Bloom } from '@react-three/postprocessing'

<Selection>
  <EffectComposer>
    <Bloom luminanceThreshold={0} intensity={0.5} />
  </EffectComposer>
  
  <Select enabled>
    <mesh>{/* This mesh will bloom */}</mesh>
  </Select>
  
  <mesh>{/* This mesh won't bloom */}</mesh>
</Selection>
```

### Color Grading
```jsx
import { ToneMapping, LUT } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

<EffectComposer>
  <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  <LUT lut={lutTexture} />
</EffectComposer>
```
