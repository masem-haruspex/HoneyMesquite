// src/Vendor/components/VendorNetworkVisualizations.tsx
import { VendorService } from "../VendorService";
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import React, { useRef, useMemo, useEffect } from 'react'; 
import { COLORS } from '../../colors';
import type { Vendor, VendorContract } from '../vendor';

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

const hexToRgb = (hex: string): ColorRGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
};

const VendorNetworkVisualization = React.memo(({
  vendor,
  contracts,
  position = [0, 0, 0],
  scale = 1
}: {
  vendor: Vendor,
  contracts: VendorContract[],
  position?: [number, number, number],
  scale?: number
}) => {
  const meshRef = useRef<THREE.Points>(null);

  const pointsGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const linesGeometryRef = useRef<THREE.BufferGeometry | null>(null);

  const primaryColor = hexToRgb(COLORS.PRIMARY);
  const incomeColor = hexToRgb(COLORS.INCOME);
  const expenseColor = hexToRgb(COLORS.EXPENSE);

  const { nodePositions, nodeColors, nodeSizes } = useMemo(() => {
    const nodeCount = 1 + contracts.length;
    const nodePositions = new Float32Array(nodeCount * 3);
    const linePositions = new Float32Array(contracts.length * 2 * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    const nodeSizes = new Float32Array(nodeCount);

    nodePositions[0] = 0;
    nodePositions[1] = 0;
    nodePositions[2] = 0;
    nodeColors[0] = primaryColor.r;
    nodeColors[1] = primaryColor.g;
    nodeColors[2] = primaryColor.b;
    nodeSizes[0] = 0.5;

    const radius = 2.5;
    const angleStep = (Math.PI * 2) / Math.max(contracts.length, 1);

    contracts.forEach((contract, i) => {
      const angle = angleStep * i;

      const nodeIndex = (i + 1) * 3;
      nodePositions[nodeIndex] = Math.cos(angle) * radius;
      nodePositions[nodeIndex + 1] = Math.sin(angle) * radius * 0.6;
      nodePositions[nodeIndex + 2] = Math.sin(angle) * radius * 0.4;

      const lineIndex = i * 6;
      linePositions[lineIndex] = 0; 
      linePositions[lineIndex + 1] = 0; 
      linePositions[lineIndex + 2] = 0; 
      linePositions[lineIndex + 3] = nodePositions[nodeIndex]; 
      linePositions[lineIndex + 4] = nodePositions[nodeIndex + 1]; 
      linePositions[lineIndex + 5] = nodePositions[nodeIndex + 2]; 

      const colorIndex = (i + 1) * 3;
      const isExpiringSoon = (
        new Date(contract.contractEnd).getTime() - Date.now() <
        30 * 24 * 60 * 60 * 1000
      );

      if (isExpiringSoon) {
        nodeColors[colorIndex] = expenseColor.r;
        nodeColors[colorIndex + 1] = expenseColor.g;
        nodeColors[colorIndex + 2] = expenseColor.b;
      } else {
        nodeColors[colorIndex] = incomeColor.r;
        nodeColors[colorIndex + 1] = incomeColor.g;
        nodeColors[colorIndex + 2] = incomeColor.b;
      }

      const amount = VendorService.parseAmount(contract.contractedRate);
      nodeSizes[i + 1] = 0.2 + Math.min(amount / 5000, 0.5);
    });

    return { nodePositions, linePositions, nodeColors, nodeSizes };
  }, [contracts, primaryColor, incomeColor, expenseColor]);

  const pointsGeometry = useMemo(() => {
    if (pointsGeometryRef.current) {
      pointsGeometryRef.current.dispose();
      pointsGeometryRef.current = null;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(nodeSizes, 1));

    pointsGeometryRef.current = geometry; 
    return geometry;
  }, [nodePositions, nodeColors, nodeSizes]);

  useEffect(() => {
    return () => {
      if (pointsGeometryRef.current) {
        pointsGeometryRef.current.dispose();
        pointsGeometryRef.current = null;
      }
      if (linesGeometryRef.current) {
        linesGeometryRef.current.dispose();
        linesGeometryRef.current = null;
      }
    };
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;

      const geometry = meshRef.current.geometry as THREE.BufferGeometry;
      const sizeAttribute = geometry.attributes.size as THREE.BufferAttribute;
      const sizes = sizeAttribute.array as Float32Array;

      for (let i = 0; i < sizes.length; i++) {
        sizes[i] = nodeSizes[i] * (1 + Math.sin(clock.getElapsedTime() * 2 + i) * 0.1);
      }
      sizeAttribute.needsUpdate = true;
    }
  });

  if (contracts.length === 0) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          No contracts available
        </Text>
      </group>
    );
  }

  return (
    <group position={position} scale={[scale, scale, scale]}>

      <Points ref={meshRef} geometry={pointsGeometry}>
        <PointMaterial
          vertexColors
          size={0.1}
          sizeAttenuation
          transparent
          alphaTest={0.01}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      <Text
        position={[0, 1.3, 0]}
        fontSize={0.3}
        color={COLORS.PRIMARY}
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron-medium.otf"
      >
        {vendor.legalName}
      </Text>

      {contracts.map((contract, i) => {
        const angle = (Math.PI * 2 / contracts.length) * i;
        const radius = 2.5;
        const x = Math.cos(angle) * radius * 0;
        const y = Math.sin(angle) * radius * 0.6 + 0.3;
        const z = Math.sin(angle) * radius * 0.4;

        const isExpiringSoon = (
          new Date(contract.contractEnd).getTime() - Date.now() <
          30 * 24 * 60 * 60 * 1000
        );

        return (
          <Text
            key={contract.id}
            position={[x, y, z]}
            fontSize={0.25}
            color={isExpiringSoon ? COLORS.EXPENSE : COLORS.INCOME}
            anchorX="center"
            anchorY="middle"
            font="/fonts/orbitron-medium.otf"
          >
            {contract.serviceDescription}
          </Text>
        );
      })}
    </group>
  );
});

export default VendorNetworkVisualization;
