import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import KeyboardModel from './KeyboardModel'

export default function KeyboardScene() {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        {/* Camera - positioned for optimal keyboard view */}
        <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={45} />
        
        {/* Lighting Setup */}
        <ambientLight intensity={0.5} />
        
        {/* Key Light - main illumination */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* Fill Light - soften shadows */}
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.8}
        />
        
        {/* Rim Light - edge definition */}
        <pointLight position={[0, 8, -10]} intensity={1.2} color="#00ffcc" />
        
        {/* 3D Model */}
        <Suspense fallback={null}>
          <KeyboardModel />
        </Suspense>
        
        {/* Contact Shadows for realism */}
        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.5}
          scale={15}
          blur={2.5}
          far={4}
        />
        
        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={8}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
        />
        
        {/* HDR Environment for cinematic lighting */}
        <Environment
          files="/hdr/studio-small.hdr"
          background={false}
        />
      </Canvas>
    </div>
  )
}
