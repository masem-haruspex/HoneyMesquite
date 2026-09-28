// src/components/ProfitLoss/RollingYearChart.tsx
import React, { useRef, useState } from 'react';
import { Line, Text } from '@react-three/drei';
import { COLORS } from '../../colors';
import HologramDisc from '../HolographicDisc';
import * as THREE from 'three';
import './RollingYearChart.scss';

type Vector3Tuple = [number, number, number];

interface RollingYearChartProps {
  data: {
    revenue: number[];
    netIncome: number[];
    labels: string[];
  };
  position?: Vector3Tuple;
  width?: number;
  height?: number;
}

const RollingYearChart: React.FC<RollingYearChartProps> = ({
  data,
  position = [0, 0, 0],
  width = 10,
  height = 4,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    pos: Vector3Tuple;
    label: string;
    color: string;
  } | null>(null);

  const hasData = data.revenue.length > 0 || data.netIncome.length > 0;
  if (!hasData) return null;

  const maxValue = Math.max(...data.revenue, ...data.netIncome, 0.1);
  const minValue = Math.min(...data.revenue, ...data.netIncome, 0);
  const valueRange = maxValue - minValue;

  const getPointPositions = (values: number[]): Vector3Tuple[] => {
    if (values.length < 2) return [];
    return values.map((value, i) => {
      const x = (i / (values.length - 1)) * width - width / 2;
      const y = ((value - minValue) / valueRange) * height - height / 2;
      return [x, y, 0] as Vector3Tuple;
    });
  };

  const revenuePositions = getPointPositions(data.revenue);
  const netIncomePositions = getPointPositions(data.netIncome);

  const validRevenuePositions = revenuePositions.length >= 2 ? revenuePositions : [];
  const validNetIncomePositions = netIncomePositions.length >= 2 ? netIncomePositions : [];

  const axes: { points: Vector3Tuple[]; color: string; lineWidth?: number }[] = [
  {
    points: [
      [-width / 2, -height / 2, 0],
      [width / 2, -height / 2, 0],
    ] as Vector3Tuple[],
    color: COLORS.PRIMARY,
    lineWidth: 1.5,
  },
  {
    points: [
      [-width / 2, -height / 2, 0],
      [-width / 2, height / 2, 0],
    ] as Vector3Tuple[],
    color: COLORS.PRIMARY,
    lineWidth: 1.5,
  },
];

const gridLines: { points: Vector3Tuple[]; color: string; dashed?: boolean }[] = Array.from({ length: 5 }).map((_, i) => {
  const y = -height / 2 + (i * height / 4);
  return {
    points: [
      [-width / 2, y, 0],
      [width / 2, y, 0],
    ] as Vector3Tuple[],
    color: COLORS.PRIMARY_LIGHT,
    dashed: true,
  };
});

  const axisLabels = Array.from({ length: 5 }).map((_, i) => {
    const value = minValue + (i * valueRange / 4);
    return {
      text: value.toLocaleString(undefined, { maximumFractionDigits: 1 }),
      position: [-width / 2 - 0.6, -height / 2 + (i * height / 4), 0] as Vector3Tuple,
    };
  });

  return (
    <group position={position} ref={groupRef}>
      <mesh position={[-0.6, 0.2, -0.2]}>
        <planeGeometry args={[width + 2.2, height + 1.0]} />
        <meshBasicMaterial color={COLORS.SECONDARY_DARK} transparent opacity={0.6} />
      </mesh>

      {gridLines.map((line, i) => (
        <Line key={`grid-${i}`} points={line.points} color={line.color} transparent opacity={0.3} />
      ))}

      {axes.map((line, i) => (
        <Line key={`axis-${i}`} points={line.points} color={line.color} lineWidth={1.5} />
      ))}

      {validRevenuePositions.length >= 2 && (
        <Line points={validRevenuePositions} color={COLORS.INCOME} lineWidth={3} transparent opacity={0.9} />
      )}

      {validNetIncomePositions.length >= 2 && (
        <Line points={validNetIncomePositions} color={COLORS.PRIMARY} lineWidth={3} transparent opacity={0.9} />
      )}

      {[
        ...validRevenuePositions.map((pos, i) => ({
          pos,
          label: `Revenue: ${data.revenue[i].toLocaleString()}`,
          color: COLORS.INCOME,
        })),
        ...validNetIncomePositions.map((pos, i) => ({
          pos,
          label: `Net Income: ${data.netIncome[i].toLocaleString()}`,
          color: COLORS.PRIMARY,
        })),
      ].map((point, i) => (
        <mesh
          key={i}
          position={point.pos}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPoint(point);
          }}
          onPointerOut={() => setHoveredPoint(null)}
          scale={hoveredPoint?.pos === point.pos ? [1.8, 1.8, 1.8] : [1, 1, 1]}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color={point.color} transparent opacity={hoveredPoint?.pos === point.pos ? 1 : 0.8} />
        </mesh>
      ))}

      {axisLabels.map((label, i) => (
        <Text
          key={`label-${i}`}
          position={label.position}
          fontSize={0.24}
          color={COLORS.PRIMARY}
          anchorX="right"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {label.text}
        </Text>
      ))}

      <Text
        position={[width / 2 - 0.3, height / 2 + 0.5, 0]}
        fontSize={0.28}
        color={COLORS.PRIMARY}
        anchorX="right"
        anchorY="top"
        outlineWidth={0.02}
        outlineColor="black"
      >
        12-Month Trend
      </Text>

      {hoveredPoint && (
        <>
          <HologramDisc
            position={[hoveredPoint.pos[0], hoveredPoint.pos[1], hoveredPoint.pos[2] + 0.1]}
            radius={0.3}
            color={hoveredPoint.color}
          />
          <Text
            position={[hoveredPoint.pos[0], hoveredPoint.pos[1] + 0.4, hoveredPoint.pos[2] + 0.1]}
            fontSize={0.28}
            color={hoveredPoint.color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.03}
            outlineColor="black"
            fontWeight="bold"
          >
            {hoveredPoint.label}
          </Text>
        </>
      )}
    </group>
  );
};

export default React.memo(RollingYearChart);
