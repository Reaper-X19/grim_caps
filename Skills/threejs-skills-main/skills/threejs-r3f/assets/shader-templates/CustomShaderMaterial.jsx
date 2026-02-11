/**
 * Custom Shader Material Template
 * 
 * Demonstrates how to create a custom shader in R3F using:
 * - shaderMaterial from drei
 * - extend for JSX usage
 * - useFrame for animation
 * 
 * Shader includes: time animation, UV-based coloring, basic lighting
 */

import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Custom shader material definition
 * 
 * Uniforms:
 * - uTime: elapsed time for animation
 * - uColor: base color
 * - uIntensity: effect intensity
 */
const CustomShaderMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uColor: new THREE.Color('#6366f1'),
    uIntensity: 1.0
  },
  
  // Vertex Shader
  /*glsl*/ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      
      // Optional: Add vertex animation
      vec3 pos = position;
      // pos.z += sin(pos.x * 5.0 + uTime) * 0.05;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  
  // Fragment Shader
  /*glsl*/ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uIntensity;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      // Basic lighting
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diffuse = max(dot(vNormal, lightDir), 0.0);
      
      // Fresnel effect for edge glow
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.0);
      
      // Animated gradient based on UV
      float gradient = sin(vUv.y * 10.0 - uTime * 2.0) * 0.5 + 0.5;
      
      // Combine effects
      vec3 color = uColor;
      color = mix(color, color * 1.5, gradient * 0.3);
      color = color * (0.3 + diffuse * 0.7);
      color += fresnel * uColor * uIntensity * 0.5;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
)

// Register for JSX usage
extend({ CustomShaderMaterial })

/**
 * Example component using the custom shader
 */
export function ShaderMesh({ color = '#6366f1', intensity = 1.0, ...props }) {
  const materialRef = useRef()
  
  // Animate time uniform
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime
    }
  })
  
  // Memoize color to prevent recreating on each render
  const colorValue = useMemo(() => new THREE.Color(color), [color])
  
  return (
    <mesh {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <customShaderMaterial
        ref={materialRef}
        uColor={colorValue}
        uIntensity={intensity}
        transparent
      />
    </mesh>
  )
}

export default ShaderMesh
