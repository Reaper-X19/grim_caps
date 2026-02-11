---
name: threejs-r3f
description: Master-level 3D web development with Three.js and React Three Fiber. Use this skill when building interactive 3D experiences, WebGL scenes, custom shaders, product visualizers, scroll-based 3D animations, physics simulations, particle systems, or any 3D graphics work in web applications. Triggers on requests involving Three.js, React Three Fiber (R3F), @react-three/drei, @react-three/fiber, GLSL shaders, WebGL, 3D models (GLTF/GLB), post-processing effects, 3D lighting, PBR materials, or immersive web experiences.
---

# Three.js & React Three Fiber

Expert-level guidance for building production-ready 3D web experiences using Three.js and React Three Fiber ecosystem.

## Quick Reference

| Task | Approach |
|------|----------|
| Product viewer | GLTF model + OrbitControls + Environment lighting |
| Landing page 3D | ScrollControls + useScroll + GSAP integration |
| Custom effects | Raw shaderMaterial with GLSL |
| Physics | @react-three/cannon or @react-three/rapier |
| Particles | InstancedMesh or Points with custom shaders |

## Core Setup Pattern

```jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'

export default function Scene() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]} // Clamp pixel ratio for performance
      shadows
    >
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      <Environment preset="studio" />
      {/* Scene content */}
    </Canvas>
  )
}
```

## Decision Tree

```
Need 3D in React?
├── Simple static model → useGLTF + primitive
├── Interactive product → OrbitControls + ContactShadows + staging
├── Scroll animations → ScrollControls + useScroll
├── Custom visuals → shaderMaterial + useFrame
├── Physics → @react-three/cannon (simple) or rapier (complex)
└── Particles → InstancedMesh (thousands) or Points (millions)
```

## Essential Hooks

**useFrame** - Animation loop (runs every frame)
```jsx
useFrame((state, delta) => {
  meshRef.current.rotation.y += delta * 0.5
  // state.clock.elapsedTime for time-based animations
})
```

**useThree** - Access renderer, camera, scene
```jsx
const { viewport, camera, gl } = useThree()
// viewport.width/height in Three.js units
```

**useGLTF** - Load 3D models (auto-suspense)
```jsx
const { nodes, materials } = useGLTF('/model.glb')
return <primitive object={nodes.Mesh} />
```

## Shader Fundamentals

Basic custom material:
```jsx
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'

const MyMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#ff0000') },
  // Vertex
  `varying vec2 vUv;
   void main() {
     vUv = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  // Fragment
  `uniform float uTime;
   uniform vec3 uColor;
   varying vec2 vUv;
   void main() {
     gl_FragColor = vec4(uColor * (sin(uTime) * 0.5 + 0.5), 1.0);
   }`
)
extend({ MyMaterial })
```

For detailed GLSL patterns, see [references/shader-library.md](references/shader-library.md).

## Performance Rules

1. **Instancing** - Use InstancedMesh for repeated geometry (>100 objects)
2. **LOD** - Reduce detail at distance for complex models
3. **Frustum culling** - Default on, disable for particles
4. **Object pooling** - Reuse geometries/materials, never recreate per-frame
5. **useFrame guards** - Early return if not visible

```jsx
// Performance-optimized instancing
function Instances({ count = 1000 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  useLayoutEffect(() => {
    for (let i = 0; i < count; i++) {
      dummy.position.set(Math.random() * 10, Math.random() * 10, Math.random() * 10)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
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

For comprehensive optimization strategies, see [references/optimization.md](references/optimization.md).

## Common Pitfalls

| Issue | Solution |
|-------|----------|
| Memory leaks | Dispose geometries/materials/textures in cleanup |
| Blank canvas | Check if Canvas has height (needs parent height or explicit) |
| Model not visible | Check scale, position, camera near/far planes |
| Jittery animations | Use delta time, not fixed increments |
| Mobile performance | Lower DPR, simplify shaders, reduce draw calls |

## Disposal Pattern

```jsx
useEffect(() => {
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshStandardMaterial()
  
  return () => {
    geometry.dispose()
    material.dispose()
    // For textures: texture.dispose()
  }
}, [])
```

## Resources

### References
- [shader-library.md](references/shader-library.md) - GLSL patterns, noise functions, effects
- [r3f-patterns.md](references/r3f-patterns.md) - React Three Fiber hooks, components, patterns
- [optimization.md](references/optimization.md) - Performance strategies and profiling
- [materials-lighting.md](references/materials-lighting.md) - PBR materials, lighting setups, HDR

### Assets
- [assets/scene-template/](assets/scene-template/) - Boilerplate R3F scene setup
- [assets/shader-templates/](assets/shader-templates/) - Common shader starting points
