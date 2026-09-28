// src/ProfitLoss/components/BarChart3D.tsx
import { useRef, useEffect, useState, useMemo } from 'react'; 
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { COLORS } from '../../colors';
import { gsap } from 'gsap';
import './BarChart3D.scss';

interface BarData {
  name: string;
  value: number;
  color: string;
}

interface IProps {
  data: BarData[];
  position?: [number, number, number];
  size?: [number, number, number];
  animationDuration?: number;
  hoverHeight?: number;
  onPointerOver?: (event: {
    label: string;
    value: number;
    color: string;
    position: [number, number, number];
  }) => void;
  onPointerOut?: () => void;
}

export default function BarChart3D({
  data,
  position = [0, 0, 0],
  size = [5, 3, 1],
  animationDuration = 1.5,
  hoverHeight = 1.05,
  onPointerOver: onBarHover,
  onPointerOut: onBarLeave,
}: IProps) {
  const groupRef = useRef<THREE.Group>(null);
  const barsRef = useRef<THREE.Mesh[]>([]);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [maxValue, setMaxValue] = useState(0);
  const [chartWidth, chartHeight, chartDepth] = size;

  const gridGeometriesRef = useRef<THREE.BufferGeometry[]>([]);

  useEffect(() => {
    const newMaxValue = Math.max(...data.map(item => item.value), 0.1);
    setMaxValue(newMaxValue);
  }, [data]);

  const gridLines = useMemo(() => {
    gridGeometriesRef.current.forEach(geom => geom.dispose());
    gridGeometriesRef.current = [];

    const lines = [];
    const gridColor = COLORS.PRIMARY_LIGHT;
    const gridCount = 5;

    for (let i = 0; i <= gridCount; i++) {
      const yPos = (i / gridCount) * chartHeight - chartHeight / 2;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          [-chartWidth / 2, yPos, 0, chartWidth / 2, yPos, 0],
          3
        )
      );

      gridGeometriesRef.current.push(geometry); 

      lines.push(
        <line key={`h-grid-${i}`}>
          <primitive attach="geometry" object={geometry} />
          <lineBasicMaterial color={gridColor} transparent opacity={0.5} />
        </line>
      );
    }

    const barSpacing = chartWidth / data.length;
    for (let i = 0; i <= data.length; i++) {
      const xPos = i * barSpacing - chartWidth / 2;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          [xPos, -chartHeight / 2, 0, xPos, chartHeight / 2, 0],
          3
        )
      );

      gridGeometriesRef.current.push(geometry); 

      lines.push(
        <line key={`v-grid-${i}`}>
          <primitive attach="geometry" object={geometry} />
          <lineBasicMaterial color={gridColor} transparent opacity={0.5} />
        </line>
      );
    }

    return lines;
  }, [chartWidth, chartHeight, data.length]); 

  useEffect(() => {
    return () => {
      gridGeometriesRef.current.forEach(geom => geom.dispose());
      gridGeometriesRef.current = [];
    };
  }, []);

  useEffect(() => {
    data.forEach((_, i) => {
      if (barsRef.current[i]) {
        const targetHeight = (data[i].value / maxValue) * chartHeight;
        gsap.to(barsRef.current[i].scale, {
          y: targetHeight,
          duration: animationDuration,
          ease: 'elastic.out(1, 0.5)',
        });
      }
    });
  }, [data, maxValue, chartHeight, animationDuration]);

  useEffect(() => {
    barsRef.current.forEach((bar, i) => {
      if (!bar) return;

      const targetScaleY = hoveredBar === i
        ? (data[i].value / maxValue) * chartHeight * hoverHeight
        : (data[i].value / maxValue) * chartHeight;

      gsap.to(bar.scale, {
        y: targetScaleY,
        duration: 0.3,
        ease: 'power2.out',
      });

      const material = bar.material as THREE.MeshStandardMaterial;
      gsap.to(material, {
        emissiveIntensity: hoveredBar === i ? 0.8 : 0.3,
        duration: 0.3,
      });

      if (hoveredBar === i && onBarHover) {
        const barHeight = (data[i].value / maxValue) * chartHeight;
        const xPos = bar.position.x;
        const yPos = -chartHeight / 2 + barHeight / 2;
        const zPos = bar.position.z;

        onBarHover({
          label: data[i].name,
          value: data[i].value,
          color: data[i].color,
          position: [xPos, yPos, zPos],
        });
      }
    });

    if (hoveredBar === null && onBarLeave) {
      onBarLeave();
    }
  }, [hoveredBar, data, maxValue, chartHeight, hoverHeight, onBarHover, onBarLeave]);

  const axisLabels = useMemo(() => {
    const labels = [];
    const labelCount = 5;

    for (let i = 0; i <= labelCount; i++) {
      const value = (i / labelCount) * maxValue;
      const yPos = (i / labelCount) * chartHeight - chartHeight / 2;

      labels.push(
        <Text
          key={`y-label-${i}`}
          position={[-chartWidth / 2 - 0.3, yPos, 0]}
          fontSize={0.30}
          color={COLORS.PRIMARY}
          anchorX="right"
          anchorY="middle"
        >
          {value.toLocaleString()}
        </Text>
      );
    }

    const barSpacing = chartWidth / data.length;
    data.forEach((item, i) => {
      const xPos = i * barSpacing + barSpacing / 2 - chartWidth / 2;
      labels.push(
        <Text
          key={`x-label-${i}`}
          position={[xPos, -chartHeight / 2 - 0.4, 0]}
          fontSize={0.26}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="top"
        >
          {item.name}
        </Text>
      );
    });

    return labels;
  }, [data, maxValue, chartWidth, chartHeight]);

  return (
    <group position={position} ref={groupRef}>
      <mesh position={[-0.55, -0.30, -chartDepth / 2 - 0.01]}>
        <planeGeometry args={[chartWidth + 2.25, chartHeight + 1.4]} />
        <meshStandardMaterial
          color={COLORS.SECONDARY}
          transparent
          opacity={0.6}
          metalness={0.3}
          roughness={0.9}
        />
      </mesh>

      {gridLines}

      {data.map((item, i) => {
        const barWidth = chartWidth / data.length * 0.8;
        const barSpacing = chartWidth / data.length;
        const xPos = i * barSpacing + barSpacing / 2 - chartWidth / 2;
        const initialHeight = 0.01;

        const barGeometry = useMemo(() => {
          const geom = new THREE.BoxGeometry(barWidth, 1, chartDepth);
          geom.translate(0, 0.5, 0);
          return geom;
        }, [barWidth, chartDepth]);

        return (
          <group key={i}>
            <mesh
              ref={(el) => {
                if (el) barsRef.current[i] = el;
              }}
              position={[xPos, -chartHeight / 2, 0]}
              scale={[0.9, initialHeight, 0.3]}
              onPointerOver={() => setHoveredBar(i)}
              onPointerOut={() => setHoveredBar(null)}
              castShadow
              userData={{
                label: item.name,
                value: item.value,
                color: item.color,
              }}
            >
              <primitive attach="geometry" object={barGeometry} />
              <meshStandardMaterial
                color={item.color}
                emissive={item.color}
                emissiveIntensity={0.3}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>

            {hoveredBar === i && (
              <Text
                position={[
                  xPos,
                  (item.value / maxValue) * chartHeight - chartHeight / 2 + 0.3,
                  0,
                ]}
                fontSize={0.22}
                color={COLORS.PRIMARY}
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.01}
                outlineColor="#000000"
              >
                {item.value.toLocaleString()}
              </Text>
            )}
          </group>
        );
      })}

      {axisLabels}

      <pointLight
        position={[0, chartHeight / 2, chartDepth + 1]}
        color={COLORS.PRIMARY_LIGHT}
        intensity={0.1}
        distance={chartHeight * 2}
      />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.01}
      />
    </group>
  );
}
