import { Environment, Lightformer } from '@react-three/drei'

export default function CustomEnvironment() {
  return (
    <Environment resolution={256}>
      <group rotation={[-Math.PI / 3, 0, 0]}>
        {/* Top-down key light — subtle, not a floodlight */}
        <Lightformer form="circle" intensity={1.8} rotation-x={Math.PI / 2} position={[0, 8, -9]} scale={10} />
        {/* Side fills — low enough to add dimension without washing out */}
        <Lightformer form="rect" intensity={0.8} rotation-y={Math.PI / 2} position={[-5, 2, -1]} scale={10} />
        <Lightformer form="rect" intensity={0.8} rotation-y={-Math.PI / 2} position={[10, 2, 0]} scale={20} />
        {/* Bottom rim — barely there, just prevents total black underneath */}
        <Lightformer form="ring" intensity={0.4} rotation-x={Math.PI / 2} position={[0, -2, 5]} scale={10} />
      </group>
    </Environment>
  )
}
