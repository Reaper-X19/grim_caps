# Three.js Performance Optimization

Strategies for maintaining 60fps in complex 3D scenes.

## Table of Contents
1. [Render Loop Optimization](#render-loop-optimization)
2. [Geometry Optimization](#geometry-optimization)
3. [Material Optimization](#material-optimization)
4. [Draw Call Reduction](#draw-call-reduction)
5. [Memory Management](#memory-management)
6. [Mobile Optimization](#mobile-optimization)
7. [Profiling Tools](#profiling-tools)

---

## Render Loop Optimization

### Conditional Rendering
```jsx
// Only render when needed
const [needsRender, setNeedsRender] = useState(true)

useFrame(({ gl, scene, camera }) => {
  if (needsRender) {
    gl.render(scene, camera)
    setNeedsRender(false)
  }
}, 1) // Priority 1 = runs after other useFrames

// Trigger re-render on changes
useEffect(() => setNeedsRender(true), [dependency])
```

### Frame Rate Limiting
```jsx
useFrame((state, delta) => {
  // Skip frames for non-critical updates
  if (state.clock.elapsedTime % 2 < delta) {
    // Runs roughly every 2 seconds
    updateExpensiveState()
  }
})
```

### Visibility-based Updates
```jsx
function OptimizedMesh() {
  const meshRef = useRef()
  const isVisible = useRef(true)
  
  useFrame((state, delta) => {
    if (!isVisible.current) return // Early exit
    
    meshRef.current.rotation.y += delta
  })
  
  return (
    <mesh 
      ref={meshRef}
      onAfterRender={() => { isVisible.current = true }}
    >
      ...
    </mesh>
  )
}
```

---

## Geometry Optimization

### Instancing (Critical for Repeated Objects)
```jsx
// BAD: 1000 separate meshes = 1000 draw calls
{Array(1000).fill().map((_, i) => (
  <mesh key={i} position={[i, 0, 0]}>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
))}

// GOOD: InstancedMesh = 1 draw call
function OptimizedCubes({ count = 1000 }) {
  const meshRef = useRef()
  const temp = useMemo(() => new THREE.Object3D(), [])
  
  useLayoutEffect(() => {
    for (let i = 0; i < count; i++) {
      temp.position.set(i % 10, Math.floor(i / 10), 0)
      temp.updateMatrix()
      meshRef.current.setMatrixAt(i, temp.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [count])
  
  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <boxGeometry />
      <meshStandardMaterial />
    </instancedMesh>
  )
}
```

### Merge Static Geometry
```jsx
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

const mergedGeometry = useMemo(() => {
  const geometries = meshes.map(m => m.geometry.clone())
  return mergeBufferGeometries(geometries)
}, [meshes])
```

### LOD (Level of Detail)
```jsx
import { Detailed } from '@react-three/drei'

<Detailed distances={[0, 15, 30, 60]}>
  <HighPolyModel />   {/* 0-15 units */}
  <MediumPolyModel /> {/* 15-30 units */}
  <LowPolyModel />    {/* 30-60 units */}
  <Billboard />       {/* >60 units - sprite fallback */}
</Detailed>
```

### Simplify Geometry
- Target: <100k triangles total for mobile
- Use Blender Decimate modifier or Meshlab
- Remove internal faces not visible to camera

---

## Material Optimization

### Material Sharing
```jsx
// BAD: New material per mesh
<mesh><meshStandardMaterial color="red" /></mesh>
<mesh><meshStandardMaterial color="red" /></mesh>

// GOOD: Shared material
const sharedMaterial = useMemo(
  () => new THREE.MeshStandardMaterial({ color: 'red' }), 
  []
)

<mesh material={sharedMaterial} />
<mesh material={sharedMaterial} />
```

### Simple Materials When Possible
```jsx
// Performance hierarchy (fastest to slowest):
// 1. MeshBasicMaterial (no lighting)
// 2. MeshLambertMaterial (simple diffuse)
// 3. MeshPhongMaterial (specular highlights)
// 4. MeshStandardMaterial (PBR)
// 5. MeshPhysicalMaterial (advanced PBR)

// Use simpler materials for distant/background objects
```

### Texture Optimization
```jsx
// Use power-of-2 sizes: 256, 512, 1024, 2048
// Compress with KTX2 for GPU compression

import { useKTX2 } from '@react-three/drei'

// Enable mipmaps for textures viewed at varying distances
texture.generateMipmaps = true
texture.minFilter = THREE.LinearMipmapLinearFilter
```

---

## Draw Call Reduction

### Texture Atlases
```jsx
// Combine multiple textures into one atlas
// Use UV offsets to sample different regions
const material = new THREE.MeshStandardMaterial({
  map: atlasTexture
})

// Adjust UVs per mesh to sample correct region
geometry.attributes.uv.array = modifiedUVs
```

### Batching Considerations
| Technique | Draw Calls | Use Case |
|-----------|------------|----------|
| InstancedMesh | 1 | Same geometry, different transforms |
| Merged Geometry | 1 | Static objects, same material |
| Texture Atlas | Reduced | Different textures, same material |
| BatchedMesh (r159+) | 1 | Different geometries, same material |

---

## Memory Management

### Proper Disposal
```jsx
useEffect(() => {
  return () => {
    // Dispose geometries
    geometry.dispose()
    
    // Dispose materials and their maps
    material.map?.dispose()
    material.normalMap?.dispose()
    material.roughnessMap?.dispose()
    material.dispose()
    
    // Remove from scene
    scene.remove(mesh)
  }
}, [])
```

### useGLTF Dispose
```jsx
// Automatic disposal when component unmounts
<primitive object={nodes.Model} dispose={null} />

// Manual disposal for cloned materials
useEffect(() => {
  return () => {
    Object.values(materials).forEach(mat => mat.dispose())
  }
}, [materials])
```

### Texture Memory
```jsx
// Monitor texture memory
console.log(renderer.info.memory.textures)

// Dispose textures when no longer needed
texture.dispose()

// Use smaller textures
// 2048x2048 RGBA = 16MB GPU memory
// 1024x1024 RGBA = 4MB GPU memory
```

---

## Mobile Optimization

### DPR Management
```jsx
<Canvas dpr={[1, 1.5]}> {/* Clamp to 1.5 max */}
```

### Reduce Complexity
```jsx
const { viewport } = useThree()
const isMobile = viewport.width < 5

return (
  <>
    {!isMobile && <ExpensiveEffects />}
    <Model quality={isMobile ? 'low' : 'high'} />
  </>
)
```

### Shader Simplification
```glsl
// Desktop: Full PBR with multiple lights
// Mobile: Lambert + single light + no shadows

#ifdef MOBILE
  float lighting = max(dot(normal, lightDir), 0.0);
  gl_FragColor = vec4(baseColor * lighting, 1.0);
#else
  // Full PBR calculation
#endif
```

### Touch Optimization
```jsx
// Disable hover effects on touch devices
const isTouch = 'ontouchstart' in window

<mesh
  onPointerEnter={!isTouch ? handleHover : undefined}
  onPointerLeave={!isTouch ? handleUnhover : undefined}
  onClick={handleClick}
/>
```

---

## Profiling Tools

### r3f-perf
```jsx
import { Perf } from 'r3f-perf'

<Canvas>
  <Perf 
    position="top-left"
    showGraph
    minimal={false}
  />
</Canvas>
```

### Three.js Stats
```jsx
import Stats from 'three/examples/jsm/libs/stats.module'

useEffect(() => {
  const stats = new Stats()
  document.body.appendChild(stats.dom)
  
  const animate = () => {
    stats.update()
    requestAnimationFrame(animate)
  }
  animate()
  
  return () => document.body.removeChild(stats.dom)
}, [])
```

### Renderer Info
```jsx
useFrame(({ gl }) => {
  // Log once per second
  if (Math.floor(performance.now() / 1000) !== lastSecond) {
    console.log({
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      textures: gl.info.memory.textures,
      geometries: gl.info.memory.geometries
    })
  }
})
```

### Performance Budgets

| Metric | Mobile Target | Desktop Target |
|--------|--------------|----------------|
| Draw calls | <50 | <200 |
| Triangles | <100k | <500k |
| Textures total | <50MB | <200MB |
| Frame time | <16ms | <16ms |
