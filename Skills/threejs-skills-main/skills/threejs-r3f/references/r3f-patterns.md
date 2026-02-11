# React Three Fiber Patterns

Comprehensive patterns and best practices for R3F development.

## Table of Contents
1. [Scene Structure](#scene-structure)
2. [Model Loading](#model-loading)
3. [Animation Patterns](#animation-patterns)
4. [Scroll Integration](#scroll-integration)
5. [Event Handling](#event-handling)
6. [State Management](#state-management)
7. [Responsive 3D](#responsive-3d)
8. [Debugging](#debugging)

---

## Scene Structure

### Standard Scene Template
```jsx
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  Float,
  ContactShadows
} from '@react-three/drei'
import { Suspense } from 'react'

function Experience() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={45} />
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
      {/* Environment for reflections */}
      <Environment preset="studio" />
      
      {/* Content */}
      <Float speed={2} rotationIntensity={0.5}>
        <Model />
      </Float>
      
      {/* Ground shadow */}
      <ContactShadows 
        position={[0, -0.5, 0]} 
        opacity={0.4} 
        blur={2} 
      />
    </>
  )
}

export default function Scene() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </div>
  )
}
```

### Multi-Scene Architecture
```jsx
// scenes/ProductScene.jsx
export function ProductScene() {
  return (
    <group>
      <ProductModel />
      <Lighting />
    </group>
  )
}

// App.jsx
function App() {
  const [activeScene, setActiveScene] = useState('product')
  
  return (
    <Canvas>
      {activeScene === 'product' && <ProductScene />}
      {activeScene === 'gallery' && <GalleryScene />}
    </Canvas>
  )
}
```

---

## Model Loading

### GLTF with Draco Compression
```jsx
import { useGLTF, useAnimations } from '@react-three/drei'

// Preload at module level
useGLTF.preload('/model.glb')

function Model({ position = [0, 0, 0] }) {
  const { nodes, materials, animations } = useGLTF('/model.glb')
  const { ref, actions } = useAnimations(animations)
  
  useEffect(() => {
    actions.Idle?.play()
  }, [actions])
  
  return (
    <group ref={ref} position={position} dispose={null}>
      <mesh 
        geometry={nodes.Body.geometry} 
        material={materials.Skin}
        castShadow
      />
    </group>
  )
}
```

### Draco Loader Setup
```jsx
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { useGLTF } from '@react-three/drei'

// Configure Draco
useGLTF.setDecoderPath('/draco/')

// Or inline decoder
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
```

### Multiple LOD Levels
```jsx
import { Detailed } from '@react-three/drei'

function OptimizedModel() {
  return (
    <Detailed distances={[0, 10, 25]}>
      <HighPolyModel />  {/* < 10 units away */}
      <MediumPolyModel /> {/* 10-25 units */}
      <LowPolyModel />    {/* > 25 units */}
    </Detailed>
  )
}
```

---

## Animation Patterns

### useFrame Best Practices
```jsx
function AnimatedMesh() {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  useFrame((state, delta) => {
    // Always use delta for frame-independent animation
    meshRef.current.rotation.y += delta * 0.5
    
    // Smooth lerp for reactive animations
    const targetScale = hovered ? 1.2 : 1
    meshRef.current.scale.lerp(
      { x: targetScale, y: targetScale, z: targetScale }, 
      0.1
    )
    
    // Time-based animations
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
  })
  
  return (
    <mesh 
      ref={meshRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}
```

### GSAP Integration
```jsx
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

function GSAPAnimatedMesh() {
  const meshRef = useRef()
  
  useGSAP(() => {
    gsap.to(meshRef.current.rotation, {
      y: Math.PI * 2,
      duration: 2,
      ease: 'power2.inOut',
      repeat: -1
    })
    
    gsap.to(meshRef.current.position, {
      y: 1,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    })
  }, [])
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

### Spring Animations
```jsx
import { useSpring, animated } from '@react-spring/three'

function SpringMesh() {
  const [active, setActive] = useState(false)
  
  const springs = useSpring({
    scale: active ? 1.5 : 1,
    rotation: active ? [0, Math.PI, 0] : [0, 0, 0],
    config: { mass: 1, tension: 170, friction: 26 }
  })
  
  return (
    <animated.mesh
      scale={springs.scale}
      rotation={springs.rotation}
      onClick={() => setActive(!active)}
    >
      <boxGeometry />
      <meshStandardMaterial color="royalblue" />
    </animated.mesh>
  )
}
```

---

## Scroll Integration

### ScrollControls Pattern
```jsx
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'

function ScrollScene() {
  return (
    <Canvas>
      <ScrollControls pages={3} damping={0.25}>
        {/* 3D content that reacts to scroll */}
        <ScrollContent />
        
        {/* HTML content overlaid */}
        <Scroll html>
          <section style={{ height: '100vh' }}>Section 1</section>
          <section style={{ height: '100vh' }}>Section 2</section>
          <section style={{ height: '100vh' }}>Section 3</section>
        </Scroll>
      </ScrollControls>
    </Canvas>
  )
}

function ScrollContent() {
  const scroll = useScroll()
  const meshRef = useRef()
  
  useFrame(() => {
    // scroll.offset: 0 to 1 overall progress
    // scroll.range(start, distance): normalized range
    
    meshRef.current.rotation.y = scroll.offset * Math.PI * 2
    meshRef.current.position.y = scroll.range(0, 0.5) * 3
  })
  
  return <mesh ref={meshRef}>...</mesh>
}
```

### GSAP ScrollTrigger Integration
```jsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function ScrollTriggeredScene() {
  const meshRef = useRef()
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '#section-2',
        start: 'top center',
        end: 'bottom center',
        onUpdate: (self) => {
          if (meshRef.current) {
            meshRef.current.rotation.y = self.progress * Math.PI
          }
        }
      })
    })
    
    return () => ctx.revert()
  }, [])
  
  return <mesh ref={meshRef}>...</mesh>
}
```

---

## Event Handling

### Pointer Events
```jsx
function InteractiveMesh() {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  
  // Change cursor on hover
  useCursor(hovered)
  
  return (
    <mesh
      onPointerEnter={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        setClicked(!clicked)
      }}
      onPointerMissed={() => setClicked(false)} // Click outside
    >
      <boxGeometry />
      <meshStandardMaterial 
        color={clicked ? 'green' : hovered ? 'hotpink' : 'orange'} 
      />
    </mesh>
  )
}
```

### Raycasting Control
```jsx
<Canvas raycaster={{ params: { Line: { threshold: 0.05 } } }}>
  {/* Only raycast specific layers */}
  <mesh layers={1} raycast={null}>  {/* Exclude from raycasting */}
    ...
  </mesh>
</Canvas>
```

---

## State Management

### Zustand Pattern (Recommended)
```jsx
import { create } from 'zustand'

const useStore = create((set) => ({
  selectedKey: null,
  setSelectedKey: (key) => set({ selectedKey: key }),
  
  keyColors: {},
  setKeyColor: (keyId, color) => 
    set((state) => ({ 
      keyColors: { ...state.keyColors, [keyId]: color } 
    })),
}))

// In component
function Keycap({ id }) {
  const { selectedKey, setSelectedKey, keyColors } = useStore()
  const isSelected = selectedKey === id
  
  return (
    <mesh onClick={() => setSelectedKey(id)}>
      <boxGeometry />
      <meshStandardMaterial color={keyColors[id] || 'white'} />
    </mesh>
  )
}
```

### Context for Scene-wide State
```jsx
const SceneContext = createContext()

function SceneProvider({ children }) {
  const [camera, setCamera] = useState(null)
  const [activeModel, setActiveModel] = useState(null)
  
  return (
    <SceneContext.Provider value={{ camera, setCamera, activeModel, setActiveModel }}>
      {children}
    </SceneContext.Provider>
  )
}
```

---

## Responsive 3D

### Viewport-responsive Sizing
```jsx
function ResponsiveModel() {
  const { viewport } = useThree()
  
  // Scale based on viewport
  const scale = Math.min(viewport.width, viewport.height) / 5
  
  return (
    <mesh scale={scale}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

### Breakpoint-based Adjustments
```jsx
function ResponsiveCamera() {
  const { viewport } = useThree()
  const isMobile = viewport.width < 5 // ~768px
  
  return (
    <PerspectiveCamera 
      makeDefault 
      position={isMobile ? [0, 0, 8] : [0, 0, 5]}
      fov={isMobile ? 60 : 45}
    />
  )
}
```

---

## Debugging

### Leva Controls
```jsx
import { useControls } from 'leva'

function DebugModel() {
  const { position, rotation, color } = useControls({
    position: { value: [0, 0, 0], step: 0.1 },
    rotation: { value: [0, 0, 0], step: 0.01 },
    color: '#ff0000'
  })
  
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
```

### Performance Monitor
```jsx
import { Perf } from 'r3f-perf'

<Canvas>
  {process.env.NODE_ENV === 'development' && (
    <Perf position="top-left" />
  )}
</Canvas>
```

### Helpers
```jsx
import { GizmoHelper, GizmoViewport, Grid } from '@react-three/drei'

<>
  <Grid infiniteGrid />
  <axesHelper args={[5]} />
  <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
    <GizmoViewport />
  </GizmoHelper>
</>
```
