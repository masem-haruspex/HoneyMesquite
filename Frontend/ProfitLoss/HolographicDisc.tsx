// src/ProfitLoss/HolographicDisc.tsx
import { useRef, useMemo, useEffect } from 'react'; 
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../colors';

interface HologramDiscProps {
  radius?: number;
  segments?: number;
  rings?: number;
  color?: string;
  position: [number, number, number];
}

export default function HologramDisc({
  radius = 1.5,
  segments = 64,
  rings = 12,
  color = COLORS.PRIMARY,
  position,
}: HologramDiscProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const g = new THREE.RingGeometry(
      radius * 0.1, 
      radius,       
      segments,
      rings
    );

    const uvs = g.attributes.uv.array as Float32Array;
    const pos = g.attributes.position.array as Float32Array;
    for (let i = 0; i < uvs.length; i += 2) {
      const idx = (i / 2) * 3;
      const x = pos[idx];
      const y = pos[idx + 1];
      const r = Math.sqrt(x * x + y * y) / radius;
      const a = (Math.atan2(y, x) + Math.PI) / (2 * Math.PI);
      uvs[i] = r;     
      uvs[i + 1] = a; 
    }
    return g;
  }, [radius, segments, rings]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: 0.6 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          float r = vUv.x;                      
          float a = vUv.y * 6.283;              
          float wave = sin(r * 30.0 - uTime * 3.0) * 0.5 + 0.5;
          float ring = smoothstep(0.0, 0.05, abs(fract(r * float(${rings}) - uTime * 0.5) - 0.5));
          float alpha = (wave * ring) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, [color, rings]);

  useFrame(({ clock }) => {
    if (material) material.uniforms.uTime.value = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.1;
    }
  });

  useEffect(() => {
    return () => {
      if (geometry) {
        geometry.dispose();
      }
      if (material) {
        material.dispose();
      }
    };
  }, [geometry, material]);

  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, 0]}>
      <primitive object={geometry} />
      <primitive object={material} />
    </mesh>
  );
}
