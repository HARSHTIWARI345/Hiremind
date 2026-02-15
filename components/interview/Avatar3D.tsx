'use client'

import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

function AvatarHead({ isSpeaking }: { isSpeaking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle breathing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02
      meshRef.current.scale.set(scale, scale, scale)

      // Speaking animation - more pronounced
      if (isSpeaking) {
        const speakScale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.05
        meshRef.current.scale.set(speakScale, speakScale, speakScale)
      }
    }
  })

  return (
    <group>
      {/* Head */}
      <mesh ref={meshRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.15, 1.6, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.15, 1.6, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>

      {/* Mouth - animated when speaking */}
      <mesh position={[0, 1.45, 0.4]}>
        <ellipseGeometry args={[0.1, isSpeaking ? 0.15 : 0.05, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1, 0.6]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
    </group>
  )
}

export default function Avatar3D({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        
        <AvatarHead isSpeaking={isSpeaking} />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  )
}
