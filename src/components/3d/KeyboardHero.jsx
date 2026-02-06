import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function KeyboardModel() {
  const { scene } = useGLTF('/models/Keyboard_minimal.gltf')
  const modelRef = useRef()

  useFrame((state) => {
    if (modelRef.current) {
      // Gentle rotation based on scroll
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      scale={2.5} 
      position={[0, -1, 0]}
      rotation={[0.2, 0, 0]}
    />
  )
}

export default function KeyboardHero() {
  return (
    <Canvas
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={45} />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
      <Environment files="/hdr/blue-studio.hdr" />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <KeyboardModel />
    </Canvas>
  )
}
