import { Environment, Lightformer } from '@react-three/drei'

export default function CustomEnvironment() {
  return (
    <Environment resolution={512}>
      <group rotation={[-Math.PI / 3, 0, 0]}>
        <Lightformer form="circle" intensity={2} rotation-x={Math.PI / 2} position={[0, 8, -9]} scale={10} />
        <Lightformer form="rect" intensity={1.2} rotation-y={Math.PI / 2} position={[-5, 2, -1]} scale={10} />
        <Lightformer form="rect" intensity={1.2} rotation-y={-Math.PI / 2} position={[10, 2, 0]} scale={20} />
        <Lightformer form="ring" intensity={0.8} rotation-x={Math.PI / 2} position={[0, -2, 5]} scale={10} />
      </group>
    </Environment>
  )
}
