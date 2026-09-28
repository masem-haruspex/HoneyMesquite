// src/ProfitLoss/components/PieChart3D.tsx
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { COLORS } from '../../colors';
import "./PieChart3D.scss";

interface PieChart3DProps {
  data: {
    value: number;
    color: string;
    name: string;
  }[];
  position?: [number, number, number];
  size?: number;
  thickness?: number;
  bevelSize?: number;
  hoverScale?: number;
}

const PieChart3D: React.FC<PieChart3DProps> = ({
  data,
  position = [0, 0, 0],
  size = 1,
  thickness = 0.2,
  bevelSize = 0.00,
  hoverScale = 1.1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const geometriesRef = useRef<THREE.ExtrudeGeometry[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  useEffect(() => {
    return () => {
      geometriesRef.current.forEach(geom => {
        if (geom) geom.dispose();
      });
      geometriesRef.current = [];
    };
  }, [data, size, thickness, bevelSize]); 

  const createSegmentGeometry = (startAngle: number, arcAngle: number) => {
    const shape = new THREE.Shape();
    const outerRadius = size;
    const innerRadius = size * 0.6;
    const bevelRadius = size * bevelSize;

    shape.moveTo(0, 0);
    shape.lineTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);

    const bevelStartAngle = startAngle + arcAngle * 0.1;
    const bevelEndAngle = startAngle + arcAngle * 0.9;

    shape.absarc(0, 0, outerRadius, startAngle, bevelStartAngle, false);

    for (let angle = bevelStartAngle; angle <= bevelEndAngle; angle += 0.1) {
      const radius = outerRadius - bevelRadius * Math.sin((angle - bevelStartAngle) / (bevelEndAngle - bevelStartAngle) * Math.PI);
      shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }

    shape.absarc(0, 0, outerRadius, bevelEndAngle, startAngle + arcAngle, false);
    shape.lineTo(Math.cos(startAngle + arcAngle) * innerRadius, Math.sin(startAngle + arcAngle) * innerRadius);
    shape.lineTo(0, 0);

    const extrudeSettings = {
      steps: 1,
      depth: thickness,
      bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    return geometry;
  };

  const segments = useMemo(() => {
    let cumulativeAngle = 0;
    const newGeometries: THREE.ExtrudeGeometry[] = [];

    const renderedSegments = data.map((item, i) => {
      const angle = (item.value / totalValue) * Math.PI * 2;
      const midAngle = cumulativeAngle + angle / 2;

      const geometry = createSegmentGeometry(cumulativeAngle, angle);
      newGeometries.push(geometry);

      const labelRadius = size * 0.7;
      const labelPosition: [number, number, number] = [
        Math.cos(midAngle) * labelRadius,
        Math.sin(midAngle) * labelRadius,
        thickness * 1.1
      ];

      cumulativeAngle += angle;

      return (
        <group key={i}>
          <mesh
            position={position}
            onPointerOver={() => setHoveredIndex(i)}
            onPointerOut={() => setHoveredIndex(null)}
            scale={[
              hoveredIndex === i ? hoverScale : 1,
              hoveredIndex === i ? hoverScale : 1,
              hoveredIndex === i ? hoverScale : 1
            ]}
          >
            <primitive object={geometry} attach="geometry" />
            <meshStandardMaterial
              color={item.color}
              emissive={item.color}
              emissiveIntensity={0.3}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          <Text
            position={[
              position[0] + labelPosition[0],
              position[1] + labelPosition[1],
              position[2] + labelPosition[2]
            ]}
            fontSize={size * 0.12}
            color={COLORS.PRIMARY}
            anchorX="center"
            anchorY="middle"
            outlineWidth={size * 0.015}
            outlineColor="#000000"
          >
            {`${item.name}: ${Math.round((item.value / totalValue) * 100)}%`}
          </Text>
        </group>
      );
    });

    geometriesRef.current = newGeometries;

    return renderedSegments;
  }, [data, totalValue, size, thickness, bevelSize, position, hoveredIndex, hoverScale]);

  return (
    <group ref={groupRef}>
      <pointLight
        position={position}
        color={COLORS.PRIMARY_LIGHT}
        intensity={0.5}
        distance={size * 2}
      />

      {segments}

    </group>
  );
};

export default PieChart3D;
