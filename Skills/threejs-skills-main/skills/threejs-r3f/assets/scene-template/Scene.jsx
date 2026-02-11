/**
 * React Three Fiber Scene Template
 * 
 * A production-ready boilerplate for R3F scenes with:
 * - Proper camera setup
 * - Environment lighting
 * - OrbitControls
 * - Suspense handling
 * - Performance optimizations
 * 
 * Usage: Copy this file as your Scene.jsx starting point
 */

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  Float,
  ContactShadows,
  useGLTF
} from '@react-three/drei'

/**
 * Loading fallback component
 * Shows while models/textures are loading
 */
function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#666" wireframe />
    </mesh>
  )
}

/**
 * Example animated mesh
 * Replace with your actual 3D content
 */
function ExampleMesh() {
  const meshRef = useRef()

  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.2} />
      </mesh>
    </Float>
  )
}

/**
 * Scene experience component
 * Contains all 3D content (lights, models, controls)
 */
function Experience() {
  return (
    <>
      {/* Camera */}
      <PerspectiveCamera 
        makeDefault 
        position={[3, 2, 5]} 
        fov={45}
        near={0.1}
        far={100}
      />

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />

      {/* Environment for reflections and ambient light */}
      <Environment preset="studio" />

      {/* Additional lighting */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* 3D Content */}
      <ExampleMesh />

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.4}
        blur={2}
        far={3}
      />
    </>
  )
}

/**
 * Main Scene component
 * Wrap in your page/layout component
 */
export default function Scene() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={['#1a1a2e']} />
        <fog attach="fog" args={['#1a1a2e', 10, 50]} />
        
        <Suspense fallback={<Loader />}>
          <Experience />
        </Suspense>
      </Canvas>
    </div>
  )
}
