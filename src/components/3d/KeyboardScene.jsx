import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import KeyboardModel from './KeyboardModel'

export default function KeyboardScene() {
  // Key used to force remount the Canvas on WebGL context recovery
  const [canvasKey, setCanvasKey] = useState(0)

  const handleCreated = useCallback(({ gl }) => {
    const canvas = gl.domElement

    // Handle WebGL context loss — auto-recover instead of dying
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault() // Allow context to be restored
      console.warn('WebGL context lost, will attempt recovery...')
    })

    canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored!')
      // Force full remount of the Canvas to reinitialize all Three.js state
      setCanvasKey(prev => prev + 1)
    })
  }, [])

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Canvas
        key={canvasKey}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false // Don't fail on limited GPU
        }}
        dpr={[1, 2]}
        onCreated={handleCreated}
      >
        {/* Camera - positioned for optimal keyboard view - ZOOMED CLOSER */}
        <PerspectiveCamera makeDefault position={[0, 6, 8]} fov={50} />

        {/* Lighting Setup */}
        <ambientLight intensity={0.8} />

        {/* Key Light - main illumination */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={2.5}
        />

        {/* Fill Light - soften shadows */}
        <directionalLight
          position={[-5, 8, -5]}
          intensity={1.2}
        />

        {/* Top Light - illuminate from above */}
        <directionalLight
          position={[0, 15, 0]}
          intensity={1}
        />

        {/* Rim Light - edge definition with accent color */}
        <pointLight position={[0, 8, -10]} intensity={0.8} color="#00ffcc" />

        {/* 3D Model + Environment loaded together inside Suspense */}
        <Suspense fallback={null}>
          <KeyboardModel />

          {/* HDR Environment */}
          <Environment
            files="/hdr/studio-small.hdr"
            background={false}
            environmentIntensity={1.0}
          />
        </Suspense>

        {/* Contact Shadows for subtle depth */}
        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.25}
          scale={15}
          blur={3}
          far={4}
        />

        {/* Controls - ZOOMED CLOSER */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  )
}
