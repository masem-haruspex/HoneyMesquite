// src/ProfitLoss/components/HolographicGrid.tsx
import React, { useRef, useMemo, useEffect } from 'react'; 
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../../colors';
import "./HolographicGrid.scss";

interface HolographicGridProps {
  position?: [number, number, number];
  size?: [number, number, number]; 
  color?: string;
  pulseSpeed?: number;
  lineDensity?: number;
}

const HolographicGrid: React.FC<HolographicGridProps> = ({
  position = [0, 0, 0],
  size = [10, 6, 0.1],
  color = COLORS.PRIMARY_LIGHT,
  pulseSpeed = 1,
  lineDensity = 10
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const scanlineRef = useRef<THREE.Mesh>(null);

  const gridGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const borderGeometryRef = useRef<THREE.BufferGeometry | null>(null);

  const [width, height, depth] = size;

  const gridGeometry = useMemo(() => {
    if (gridGeometryRef.current) {
      gridGeometryRef.current.dispose();
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    for (let i = 0; i <= lineDensity; i++) {
      const y = (i / lineDensity) * height - height / 2;
      const alpha = 0.2 + (i / lineDensity) * 0.8;
      vertices.push(-width/2, y, 0, width/2, y, 0);
      colors.push(alpha, alpha, alpha, alpha, alpha, alpha);
    }

    for (let i = 0; i <= lineDensity; i++) {
      const x = (i / lineDensity) * width - width / 2;
      const alpha = 0.2 + (i / lineDensity) * 0.8;
      vertices.push(x, -height/2, 0, x, height/2, 0);
      colors.push(alpha, alpha, alpha, alpha, alpha, alpha);
    }

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(colors), 3)
    );

    gridGeometryRef.current = geometry; 
    return geometry;
  }, [width, height, lineDensity]); 

  const borderGeometry = useMemo(() => {
    if (borderGeometryRef.current) {
      borderGeometryRef.current.dispose();
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -width/2, -height/2, depth/2,
      width/2, -height/2, depth/2,
      width/2, height/2, depth/2,
      -width/2, height/2, depth/2,
      -width/2, -height/2, depth/2
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    borderGeometryRef.current = geometry; 
    return geometry;
  }, [width, height, depth]);

  useEffect(() => {
    return () => {
      if (gridGeometryRef.current) {
        gridGeometryRef.current.dispose();
        gridGeometryRef.current = null;
      }
      if (borderGeometryRef.current) {
        borderGeometryRef.current.dispose();
        borderGeometryRef.current = null;
      }
    };
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * pulseSpeed) * 0.1 + 0.9;
      groupRef.current.scale.set(pulse, pulse, pulse);

      if (scanlineRef.current) {
        const material = scanlineRef.current.material as THREE.MeshBasicMaterial;
        scanlineRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * height / 2;
        material.opacity = Math.sin(clock.getElapsedTime() * 3) * 0.1 + 0.2;
      }
    }
  });

  const corners = useMemo(() => [
    [-width/2, -height/2, depth/2],
    [width/2, -height/2, depth/2],
    [width/2, height/2, depth/2],
    [-width/2, height/2, depth/2]
  ], [width, height, depth]);

  return (
    <group ref={groupRef} position={position}>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial
          vertexColors
          color={color}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <mesh ref={scanlineRef}>
        <planeGeometry args={[width * 1.1, height * 0.05]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight
        position={[0, 0, depth]}
        color={color}
        intensity={0.5}
        distance={Math.max(width, height) * 1.5}
      />

      <lineSegments geometry={borderGeometry}>
        <lineBasicMaterial
          color={color}
          linewidth={2}
          transparent
          opacity={0.8}
        />
      </lineSegments>

      {corners.map((corner, i) => (
        <mesh key={i} position={corner as any}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
};

export default HolographicGrid;
