import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Line, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { COLORS } from '../../colors';
import HologramDisc from '../HolographicDisc';
import './LineChart.scss';

const vec3 = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

interface LineChartProps {
  position?: [number, number, number];
  width?: number;
  height?: number;
  data: {
    name: string;
    values: number[];
    color: string;
  }[];
  labels: string[];
  animateLines?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  position = [0, 0, 0],
  width = 8,
  height = 4,
  data,
  labels,
  animateLines = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    pos: [number, number, number];
    label: string;
    color: string;
  } | null>(null);

  const maxValue = Math.max(...data.flatMap(d => d.values));
  const minValue = Math.min(...data.flatMap(d => d.values));
  const valueRange = maxValue - minValue || 1;
  const pointCount = data[0]?.values.length || 0;

  const [drawProgress, setDrawProgress] = useState<number[]>([]);
  useFrame(() => {
    if (animateLines && drawProgress.length === 0) {
      setDrawProgress(data.map(() => 0));
    }
    setDrawProgress(prev => prev.map(p => (p < 1 ? Math.min(p + 0.02, 1) : p)));
  });

  const getPointPositions = (values: number[], seriesIndex: number) => {
    const zOffset = (seriesIndex - data.length / 2) * 0.1;
    return values.map((value, i) => {
      const x = (i / (pointCount - 1 || 1)) * width - width / 2;
      const y = ((value - minValue) / valueRange) * height - height / 2;
      return vec3(x, y, zOffset);
    });
  };

  const axes = [
    {
      points: [vec3(-width / 2, -height / 2, 0), vec3(width / 2, -height / 2, 0)],
      color: COLORS.PRIMARY,
      lineWidth: 1.5
    },
    {
      points: [vec3(-width / 2, -height / 2, 0), vec3(-width / 2, height / 2, 0)],
      color: COLORS.PRIMARY,
      lineWidth: 1.5
    }
  ];

  const gridLines = [
    ...Array.from({ length: 5 }).map((_, i) => {
      const y = -height / 2 + (i * height / 4);
      return {
        points: [vec3(-width / 2, y, 0), vec3(width / 2, y, 0)],
        color: COLORS.PRIMARY_LIGHT,
        lineWidth: 0.5,
        dashed: true
      };
    }),
    ...Array.from({ length: pointCount }).map((_, i) => {
      const x = -width / 2 + (i * width / (pointCount - 1 || 1));
      return {
        points: [vec3(x, -height / 2, 0), vec3(x, height / 2, 0)],
        color: COLORS.PRIMARY_LIGHT,
        lineWidth: 0.5,
        dashed: true
      };
    })
  ];

  const axisLabels = [
    ...Array.from({ length: 5 }).map((_, i) => {
      const value = minValue + (i * valueRange / 4);
      return {
        text: value.toLocaleString(undefined, { maximumFractionDigits: 1 }),
        position: vec3(-width / 2 - 0.6, -height / 2 + (i * height / 4), 0),
        size: 0.22,
        color: COLORS.PRIMARY
      };
    }),
    ...labels.map((label, i) => {
      const x = -width / 2 + (i * width / (pointCount - 1 || 1));
      return {
        text: label,
        position: vec3(x, -height / 2 - 0.4, 0),
        size: 0.22,
        color: COLORS.PRIMARY
      };
    })
  ];

  const seriesElements = data.map((series, seriesIdx) => {
    const positions = getPointPositions(series.values, seriesIdx);
    const visiblePoints = positions.slice(0, Math.floor(drawProgress[seriesIdx] * positions.length));

    return (
      <group key={`series-${seriesIdx}`}>
        {visiblePoints.length > 1 && (
          <Line
            points={visiblePoints}
            color={series.color}
            lineWidth={3}
            transparent
            opacity={0.9}
            dashed={false}
          />
        )}

        {positions.map((pos, i) => {
          const value = series.values[i];
          const label = `${series.name}: ${value.toLocaleString()}`;
          return (
            <mesh
              key={`marker-${i}`}
              position={pos}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredPoint({ pos, label, color: series.color });
              }}
              onPointerOut={() => setHoveredPoint(null)}
              scale={hoveredPoint?.pos === pos ? [1.8, 1.8, 1.8] : [1, 1, 1]}
            >
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial
                color={series.color}
                transparent
                opacity={hoveredPoint?.pos === pos ? 1 : 0.8}
              />
            </mesh>
          );
        })}
      </group>
    );
  });

  return (
    <group position={position} ref={groupRef} dispose={null}>
      <mesh position={[-0.5, 0, -0.2]}>
        <planeGeometry args={[width + 1.6, height + 1.2]} />
        <meshBasicMaterial
          color={COLORS.SECONDARY_DARK}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>

      {gridLines.map((line, i) => (
        <Line
          key={`grid-${i}`}
          points={line.points}
          color={line.color}
          lineWidth={line.lineWidth}
          dashed={line.dashed}
          dashSize={0.1}
          gapSize={0.05}
          transparent
          opacity={0.5}
        />
      ))}

      {axes.map((line, i) => (
        <Line
          key={`axis-${i}`}
          points={line.points}
          color={line.color}
          lineWidth={line.lineWidth}
        />
      ))}

      {seriesElements}

      {axisLabels.map((label, i) => (
        <Text
          key={`label-${i}`}
          position={label.position}
          fontSize={label.size}
          color={label.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {label.text}
        </Text>
      ))}

      <Text
        position={vec3(width / 2 - 0.3, height / 2 + 0.5, 0)}
        fontSize={0.28}
        color={COLORS.PRIMARY}
        anchorX="right"
        anchorY="top"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {data.map(s => s.name).join(' • ')}
      </Text>

      {hoveredPoint && (
        <HologramDisc
          position={[hoveredPoint.pos[0] + 0.01, hoveredPoint.pos[1], hoveredPoint.pos[2] + 0.1]}
          radius={0.28}
          color={hoveredPoint.color}
        />
      )}

      {hoveredPoint && (
        <Text
          position={[hoveredPoint.pos[0], hoveredPoint.pos[1] + 0.35, hoveredPoint.pos[2] + 0.1]}
          fontSize={0.26}
          color={hoveredPoint.color}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.03}
          outlineColor="black"
          fontWeight="bold"
        >
          {hoveredPoint.label}
        </Text>
      )}
    </group>
  );
};

export default React.memo(LineChart);
