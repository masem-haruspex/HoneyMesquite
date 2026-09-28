// src/Vendor/components/ContractCrystalView.tsx
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import React, { useRef, useMemo, useEffect } from 'react'; 
import { COLORS } from '../../colors';
import type { VendorContract, VendorContractVarianceResponse } from '../vendor';
import { VendorService } from '../VendorService';

const ContractCrystalView = React.memo(({
  contract,
  variance,
  position = [0, 0, 0],
  scale = 1
}: {
  contract: VendorContract,
  variance?: VendorContractVarianceResponse,
  position?: [number, number, number],
  scale?: number
}) => {
  const crystalRef = useRef<THREE.Mesh>(null);

  const crystalGeometryRef = useRef<THREE.ConeGeometry | null>(null);
  const edgesGeometryRef = useRef<THREE.EdgesGeometry | null>(null);
  const particlesGeometryRef = useRef<THREE.BufferGeometry | null>(null);

  const crystalColor = useMemo(() => {
    if (!variance) return COLORS.PRIMARY;
    return variance.variancePercentage < 0 ? COLORS.INCOME : COLORS.EXPENSE;
  }, [variance]);

  const crystalGeometry = useMemo(() => {
    if (crystalGeometryRef.current) {
      crystalGeometryRef.current.dispose();
    }

    const geometry = new THREE.ConeGeometry(0.8, 1.5, 4, 1);
    geometry.rotateX(Math.PI);
    geometry.translate(0, 0.75, 0);

    crystalGeometryRef.current = geometry; 
    return geometry;
  }, []);

  const edgesGeometry = useMemo(() => {
    if (edgesGeometryRef.current) {
      edgesGeometryRef.current.dispose();
    }

    const edges = new THREE.EdgesGeometry(crystalGeometry);
    edgesGeometryRef.current = edges; 
    return edges;
  }, [crystalGeometry]);

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(30 * 3);
    for (let i = 0; i < 30 * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 4; 
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      crystalRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;

      if (variance) {
        const pulseIntensity = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
        crystalRef.current.scale.set(scale * pulseIntensity, scale * pulseIntensity, scale * pulseIntensity);
      }
    }
  });

  useEffect(() => {
    return () => {
      if (crystalGeometryRef.current) {
        crystalGeometryRef.current.dispose();
        crystalGeometryRef.current = null;
      }
      if (edgesGeometryRef.current) {
        edgesGeometryRef.current.dispose();
        edgesGeometryRef.current = null;
      }
      if (particlesGeometryRef.current) {
        particlesGeometryRef.current.dispose();
        particlesGeometryRef.current = null;
      }
    };
  }, []);

  const timeRemaining = useMemo(() => {
    const endDate = new Date(contract.contractEnd);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [contract.contractEnd]);

  const crystalOpacity = useMemo(() => {
    const maxDays = 365; 
    return Math.min(0.8, 0.2 + (timeRemaining / maxDays) * 0.6);
  }, [timeRemaining]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={crystalRef}>
          <primitive object={crystalGeometry} attach="geometry" />
          <meshPhysicalMaterial
            color={crystalColor}
            transmission={0.8}
            roughness={0.1}
            metalness={0.1}
            clearcoat={0.5}
            clearcoatRoughness={0.1}
            ior={1.5}
            thickness={0.5}
            envMapIntensity={1}
            opacity={crystalOpacity}
            transparent
          />

          <lineSegments>
            <primitive object={edgesGeometry} attach="geometry" />
            <lineBasicMaterial color={COLORS.PRIMARY_LIGHT} linewidth={1} />
          </lineSegments>
        </mesh>
      </Float>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <ringGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial
          color={COLORS.PRIMARY}
          emissive={COLORS.PRIMARY}
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
        />
      </mesh>

      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color={COLORS.PRIMARY_LIGHT}
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron-medium.otf"
      >
        {contract.serviceDescription}
      </Text>

      <group position={[0, -2, 0]}>
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.15}
          color={COLORS.PRIMARY_LIGHT}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          ${VendorService.parseAmount(contract.contractedRate).toLocaleString()}
        </Text>

        <Text
          position={[0, 0, 0]}
          fontSize={0.12}
          color={timeRemaining < 30 ? COLORS.EXPENSE : COLORS.INCOME}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          {timeRemaining} days remaining
        </Text>

        {variance && (
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.12}
            color={variance.variancePercentage < 0 ? COLORS.INCOME : COLORS.EXPENSE}
            anchorX="center"
            anchorY="middle"
            font="/fonts/orbitron-medium.otf"
          >
            {variance.variancePercentage > 0 ? '+' : ''}{variance.variancePercentage.toFixed(2)}% variance
          </Text>
        )}
      </group>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={COLORS.PRIMARY_LIGHT}
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
});

export default ContractCrystalView;
