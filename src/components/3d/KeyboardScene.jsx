import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import KeyboardModel from './KeyboardModel'

export default function KeyboardScene() {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        {/* Camera - positioned for optimal keyboard view */}
        <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={45} />
        
        {/* Lighting Setup - Improved for clarity */}
        <ambientLight intensity={0.8} />
        
        {/* Key Light - main illumination (no shadows to avoid stripes) */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={2.5}
        />
        
        {/* Fill Light - soften shadows and illuminate from opposite side */}
        <directionalLight
          position={[-5, 8, -5]}
          intensity={1.2}
        />
        
        {/* Top Light - illuminate from above for better key visibility */}
        <directionalLight
          position={[0, 15, 0]}
          intensity={1}
        />
        
        {/* Rim Light - edge definition with accent color */}
        <pointLight position={[0, 8, -10]} intensity={0.8} color="#00ffcc" />
        
        {/* 3D Model */}
        <Suspense fallback={null}>
          <KeyboardModel />
        </Suspense>
        
        {/* Contact Shadows for subtle depth (reduced opacity to avoid artifacts) */}
        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.25}
          scale={15}
          blur={3}
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
