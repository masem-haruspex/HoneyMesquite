// CashFlowTunnel.tsx
import React, { useMemo } from 'react';
import { Line, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../../colors';
import type { CashFlowForecast, ForecastActual } from '../cashFlow';
import "./CashFlowTunnel.scss";

interface CashFlowTunnelProps {
  forecasts?: CashFlowForecast[];
  forecast?: CashFlowForecast;
  actuals?: ForecastActual[];
  position?: [number, number, number];
  active?: boolean;
  highlightedForecast?: CashFlowForecast | null;
}

const CashFlowTunnel: React.FC<CashFlowTunnelProps> = ({
  forecasts,
  forecast,
  actuals,
  position = [0, 0, 0],
  active = true,
  highlightedForecast
}) => {
  const isDetailView = !!forecast && !!actuals;

  const forecastSegments = useMemo(() => {
    if (!forecasts || forecasts.length === 0) return null;

    const segments = [];
    const segmentHeight = 0.5;
    const radius = 2;
    const totalHeight = forecasts.length * segmentHeight;

    for (let i = 0; i < forecasts.length; i++) {
      const currentForecast = forecasts[i];
      const isHighlighted = highlightedForecast?.id === currentForecast.id;
      const yPos = -totalHeight / 2 + i * segmentHeight + segmentHeight / 2;
      const amount = currentForecast.projectedAmount;
      const normalizedAmount = Math.min(Math.abs(amount) / 100000, 1); 
      const color = amount < 0 ? COLORS.EXPENSE : COLORS.INCOME;
      const opacity = isHighlighted ? 0.8 : 0.4;

      segments.push(
        <Cylinder
          key={`segment-${currentForecast.id}`}
          args={[radius * normalizedAmount, radius * normalizedAmount, segmentHeight, 32]}
          position={[position[0], position[1] + yPos, position[2]]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={opacity}
            emissive={isHighlighted ? color : undefined}
            emissiveIntensity={isHighlighted ? 0.5 : 0}
          />
        </Cylinder>
      );

      segments.push(
        <Text
          key={`label-${currentForecast.id}`}
          position={[position[0] + radius + 0.5, position[1] + yPos, position[2]]}
          fontSize={0.2}
          color={COLORS.PRIMARY}
          anchorX="left"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          {currentForecast.scenario}
        </Text>
      );
    }

    segments.push(
      <Cylinder
        key="tunnel-structure"
        args={[radius * 1.1, radius * 1.1, totalHeight, 32, 1, true]}
        position={position}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color={COLORS.PRIMARY} 
          transparent 
          opacity={0.1}
          side={THREE.DoubleSide}
          wireframe
        />
      </Cylinder>
    );

    return segments;
  }, [forecasts, highlightedForecast, position]);

  const forecastActualComparison = useMemo(() => {
    if (!isDetailView || !actuals || actuals.length === 0) return null;

    const elements = [];
    const radius = 1.5;
    const segmentHeight = 0.3;
    const spacing = 0.1;

    elements.push(
      <Cylinder
        key="projected"
        args={[radius, radius, segmentHeight, 32]}
        position={[position[0], position[1] + segmentHeight/2, position[2]]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color={forecast.projectedAmount < 0 ? COLORS.EXPENSE : COLORS.INCOME} 
          transparent 
          opacity={0.6}
        />
      </Cylinder>
    );

    actuals.forEach((actual, i) => {
      const yPos = - (i + 1) * (segmentHeight + spacing) + segmentHeight/2;
      const normalizedVariance = Math.min(Math.abs(actual.variance || 0) / 100000, 1);
      const color = (actual.variance || 0) < 0 ? COLORS.EXPENSE : COLORS.INCOME;

      elements.push(
        <group key={`actual-${i}`}>
          <Cylinder
            args={[radius * (1 - normalizedVariance), radius * (1 - normalizedVariance), segmentHeight, 32]}
            position={[position[0], position[1] + yPos, position[2]]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial 
              color={actual.actualAmount < 0 ? COLORS.EXPENSE : COLORS.INCOME} 
              transparent 
              opacity={0.6}
            />
          </Cylinder>
          <Line
            points={[
              [position[0], position[1] + yPos + segmentHeight/2, position[2]],
              [position[0], position[1] + yPos - segmentHeight/2, position[2]]
            ]}
            color={color}
            lineWidth={2}
          />
        </group>
      );
    });

    return elements;
  }, [isDetailView, forecast, actuals, position]);

  if (!active) return null;

  return (
    <group>
      {isDetailView ? forecastActualComparison : forecastSegments}
    </group>
  );
};

export default CashFlowTunnel;
