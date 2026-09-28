// src/3D_Objects/HoloBox.tsx
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface HoloBoxProps {
  speed?: number;
  ringSize?: number;
  ringFrequency?: number;
  ringThickness?: number;
  color?: THREE.Color;
  opacity?: number;
  wireframe?: boolean;
  size?: number;
  [key: string]: any;
}

export default function HoloBox({
  speed = 0.003,
  ringSize = 0.01,
  ringFrequency = 100.0,
  ringThickness = 0.009,
  color = new THREE.Color(0x00ff00),
  opacity = 0.4,
  wireframe = false,
  size = 0.3,
  ...props
}: HoloBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_speed: { value: speed },
        u_ringSize: { value: ringSize },
        u_ringFrequency: { value: ringFrequency },
        u_ringThickness: { value: ringThickness },
        u_color: { value: color.clone() }, 
        u_opacity: { value: opacity },
        u_boxSize: { value: size }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform float u_speed;
        uniform float u_ringSize;
        uniform float u_ringFrequency;
        uniform float u_ringThickness;
        uniform vec3 u_color;
        uniform float u_opacity;
        uniform float u_boxSize;

        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          float yPos = vPosition.y / (u_boxSize * 0.5);
          float edgeFade = 1.0 - smoothstep(0.92, 1.0, abs(yPos));
          float timeOffset = u_time * u_speed;
          float wave = sin((yPos - timeOffset) * u_ringFrequency + u_time) * 0.5 + 0.5;
          float ringIntensity = 0.0;

          float phase1 = fract((yPos - timeOffset) / (u_ringSize * 2.0));
          float distanceToRing = abs(phase1 - 0.5) * u_ringSize * 2.0;
          ringIntensity += smoothstep(
            u_ringThickness * 0.8,
            u_ringThickness * 1.2,
            u_ringSize - distanceToRing
          ) * wave;

          float phase2 = fract((yPos - timeOffset * 0.7) / (u_ringSize * 1.5));
          float distanceToRing2 = abs(phase2 - 0.5) * u_ringSize * 1.5;
          ringIntensity += smoothstep(
            u_ringThickness * 0.6,
            u_ringThickness * 1.0,
            u_ringSize * 0.75 - distanceToRing2
          ) * wave * 0.5;

          ringIntensity = clamp(ringIntensity, 0.01, 1.0);
          ringIntensity *= edgeFade;

          float glowFactor = ringIntensity * 0.2;
          vec3 finalColor = u_color * ringIntensity * 0.95;
          float alpha = min(ringIntensity * u_opacity, 0.9);
          finalColor += vec3(0.05, 0.15, 0.05) * glowFactor;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      wireframe: wireframe,
      blending: THREE.AdditiveBlending
    });

    return mat;
  }, [speed, ringSize, ringFrequency, ringThickness, color, opacity, wireframe, size]);

  useFrame((state) => {
    if (meshRef.current && material.uniforms.u_time) {
      material.uniforms.u_time.value = state.clock.getElapsedTime();
    }
  });

  useEffect(() => {
    return () => {
      if (material) {
        material.dispose();
      }
    };
  }, [material]);

  return (
    <mesh ref={meshRef} material={material} {...props}>
      <boxGeometry args={[size, size, size]} />
    </mesh>
  );
}
