// src/Departments/components/DepartmentPerformanceScatterPlot.tsx
import { Html, Text } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { COLORS } from '../../colors';
import type { DepartmentPerformance } from '../department';
import './DepartmentPerformanceScatterPlot.scss';

interface ScatterPlotProps {
  performances: DepartmentPerformance[];
  position: [number, number, number];
  departmentName: string;
}

export default function DepartmentPerformanceScatterPlot({
  performances,
  position,
  departmentName
}: ScatterPlotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const edgeGeometriesRef = useRef<THREE.BufferGeometry[]>([]);

  useEffect(() => {
    return () => {
      if (materialRef.current) {
        materialRef.current.dispose();
        materialRef.current = null;
      }
      
      edgeGeometriesRef.current.forEach(geom => geom.dispose());
      edgeGeometriesRef.current = [];
    };
  }, []);

  if (performances.length === 0) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          No performance data available
        </Text>
      </group>
    );
  }

  const maxSpend = Math.max(...performances.map(p => p.spend), 1);
  const maxRevenue = Math.max(...performances.map(p => p.revenue), 1);
  const scaleX = (value: number) => (value / maxSpend) * 6;
  const scaleY = (value: number) => (value / maxRevenue) * 6;
  const scaleZ = (value: number) => (value / 100) * 4; 

  const dates = performances.map(p => new Date(p.recordedDate).getTime());
  const minTime = Math.min(...dates);
  const maxTime = Math.max(...dates);
  const timeRange = maxTime - minTime || 1;
  const getColorByDate = (timestamp: number) => {
    const t = (timestamp - minTime) / timeRange;
    const hue = 240 + t * 180; 
    return new THREE.Color(`hsl(${hue}, 70%, 50%)`);
  };

  const avgRevenue = performances.reduce((a, b) => a + b.revenue, 0) / performances.length;
  const avgSpend = performances.reduce((a, b) => a + b.spend, 0) / performances.length;
  const avgEfficiency = performances.reduce((a, b) => a + b.efficiency, 0) / performances.length;
  const latestEff = performances[performances.length - 1]?.efficiency || 0;
  const trendArrow = performances.length > 1 && latestEff > performances[performances.length - 2].efficiency ? '↑' : '↓';

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setStartAngle(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !groupRef.current) return;
    const delta = e.clientX - startAngle;
    groupRef.current.rotation.y += delta * 0.01;
    setStartAngle(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const boxSizeX = 6;
  const boxSizeY = 6;
  const boxSizeZ = 4;

  if (!materialRef.current) {
    materialRef.current = new THREE.MeshPhysicalMaterial({
      color: 0x111133,
      transparent: true,
      opacity: 0.15,
      roughness: 0.2,
      metalness: 0.8,
      transmission: 0.9,
      thickness: 0.2,
    });
  }

  const edges = [
    [[0, 0, 0], [boxSizeX, 0, 0]],
    [[boxSizeX, 0, 0], [boxSizeX, boxSizeY, 0]],
    [[boxSizeX, boxSizeY, 0], [0, boxSizeY, 0]],
    [[0, boxSizeY, 0], [0, 0, 0]],
    [[0, 0, boxSizeZ], [boxSizeX, 0, boxSizeZ]],
    [[boxSizeX, 0, boxSizeZ], [boxSizeX, boxSizeY, boxSizeZ]],
    [[boxSizeX, boxSizeY, boxSizeZ], [0, boxSizeY, boxSizeZ]],
    [[0, boxSizeY, boxSizeZ], [0, 0, boxSizeZ]],
    [[0, 0, 0], [0, 0, boxSizeZ]],
    [[boxSizeX, 0, 0], [boxSizeX, 0, boxSizeZ]],
    [[0, boxSizeY, 0], [0, boxSizeY, boxSizeZ]],
    [[boxSizeX, boxSizeY, 0], [boxSizeX, boxSizeY, boxSizeZ]],
  ];

  if (edgeGeometriesRef.current.length === 0) {
    edgeGeometriesRef.current = edges.map(edge => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...edge[0]),
        new THREE.Vector3(...edge[1])
      ]);
      return geometry;
    });
  }

  return (
    <group position={position} ref={groupRef}>
      <Text
        position={[3, 8, 2]}
        fontSize={0.5}
        color={COLORS.PRIMARY}
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron-medium.otf"
      >
        {departmentName.toUpperCase()} PERFORMANCE
      </Text>

      <Html
        transform
        distanceFactor={10}
        position={[3, 6.5, 2]}
        style={{ width: '300px', textAlign: 'center', pointerEvents: 'none' }}
      >
        <div className="scatter-stats">
          <div>Avg Rev: <strong>${avgRevenue.toFixed(0)}</strong></div>
          <div>Avg Spend: <strong>${avgSpend.toFixed(0)}</strong></div>
          <div>Avg Eff: <strong>{avgEfficiency.toFixed(1)}%</strong> {trendArrow}</div>
        </div>
      </Html>

      <group>
        <line>
          <bufferGeometry>
            <primitive
              attach="attributes-position"
              object={new THREE.BufferAttribute(new Float32Array([0, 0, 0, 6, 0, 0]), 3)}
            />
          </bufferGeometry>
          <lineBasicMaterial color={COLORS.PRIMARY} />
        </line>
        <Text
          position={[6.5, 0, 0]}
          fontSize={0.3}
          color={COLORS.PRIMARY}
          anchorX="left"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          SPEND
        </Text>

        <line>
          <bufferGeometry>
            <primitive
              attach="attributes-position"
              object={new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, 6, 0]), 3)}
            />
          </bufferGeometry>
          <lineBasicMaterial color={COLORS.PRIMARY} />
        </line>
        <Text
          position={[0, 6.5, 0]}
          fontSize={0.3}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="top"
          font="/fonts/orbitron-medium.otf"
        >
          REVENUE
        </Text>

        <line>
          <bufferGeometry>
            <primitive
              attach="attributes-position"
              object={new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, 0, 4]), 3)}
            />
          </bufferGeometry>
          <lineBasicMaterial color={COLORS.PRIMARY} />
        </line>
        <Text
          position={[0, 0, 4.5]}
          fontSize={0.3}
          color={COLORS.PRIMARY}
          anchorX="right"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          EFFICIENCY
        </Text>
      </group>

      {performances.map((performance) => {
        const x = scaleX(performance.spend);
        const y = scaleY(performance.revenue);
        const z = scaleZ(performance.efficiency);
        const size = 0.1 + (performance.department?.headcount || 1) / 50 * 0.2;
        const color = getColorByDate(new Date(performance.recordedDate).getTime());
        
        return (
          <group
            key={performance.id}
            position={[x, y, z]}
            onPointerOver={() => setHoveredId(performance.id)}
            onPointerOut={() => setHoveredId(null)}
          >
            <mesh>
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color.clone().multiplyScalar(0.5)}
                emissiveIntensity={0.5}
                metalness={0.9}
                roughness={0.2}
              />
              <Html
                transform
                distanceFactor={10}
                center
                className={`scatter-tooltip ${hoveredId === performance.id ? 'visible' : ''}`}
                style={{ pointerEvents: 'none' }}
              >
                <div className="scatter-tooltip__content">
                  <div><strong>{new Date(performance.recordedDate).toLocaleDateString()}</strong></div>
                  <div>Spend: ${performance.spend.toFixed(2)}</div>
                  <div>Revenue: ${performance.revenue.toFixed(2)}</div>
                  <div>Efficiency: {performance.efficiency.toFixed(2)}%</div>
                  {performance.isCurrent && (
                    <div className="scatter-indicator--current">CURRENT</div>
                  )}
                </div>
              </Html>
            </mesh>
          </group>
        );
      })}

      <mesh
        position={[3, 3, 2]}
        material={materialRef.current}
        receiveShadow
      >
        <boxGeometry args={[6, 6, 4]} />
      </mesh>

      <group 
        onPointerDown={handlePointerDown} 
        onPointerMove={handlePointerMove} 
        onPointerUp={handlePointerUp} 
        onPointerLeave={handlePointerUp}
      >
        {edgeGeometriesRef.current.map((geometry, i) => (
          <line key={i}>
            <primitive attach="geometry" object={geometry} />
            <lineBasicMaterial
              color={COLORS.PRIMARY}
              linewidth={2}
            />
          </line>
        ))}
      </group>
    </group>
  );
}
