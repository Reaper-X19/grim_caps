import { Environment, Lightformer } from '@react-three/drei'

/**
 * CustomEnvironment — Ghostly Void Lighting
 *
 * Cool-tinted lightformers create an ethereal, spectral atmosphere.
 * The cyan/purple tints reinforce the "forged in darkness" theme
 * while keeping enough light to see the keyboard details.
 */
export default function CustomEnvironment() {
  return (
    <Environment resolution={256}>
      <group rotation={[-Math.PI / 3, 0, 0]}>
        {/* Top-down key light — cool cyan tint for spectral feel */}
        <Lightformer
          form="circle"
          intensity={2.2}
          color="#a0d8ef"
          rotation-x={Math.PI / 2}
          position={[0, 8, -9]}
          scale={10}
        />
        {/* Left fill — soft purple, like moonlight */}
        <Lightformer
          form="rect"
          intensity={1.0}
          color="#b8a9e8"
          rotation-y={Math.PI / 2}
          position={[-5, 2, -1]}
          scale={10}
        />
        {/* Right fill — cooler blue, asymmetric depth */}
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#7ec8e3"
          rotation-y={-Math.PI / 2}
          position={[10, 2, 0]}
          scale={20}
        />
        {/* Bottom rim — dark cyan, barely visible, prevents total black */}
        <Lightformer
          form="ring"
          intensity={0.5}
          color="#4af0e6"
          rotation-x={Math.PI / 2}
          position={[0, -2, 5]}
          scale={10}
        />
      </group>
    </Environment>
  )
}
