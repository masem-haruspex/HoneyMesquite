import { Html, Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from '../../colors';
import type { BudgetVsActualResponse } from '../budget';
import { Vector2 } from 'three';
import '../Budget.scss';

interface BudgetVisualizationProps {
  item: BudgetVsActualResponse;
}

const BudgetVisualization = ({ item }: BudgetVisualizationProps) => {
  const scale = 0.00001; 
  const varianceColor = item.variance >= 0 ? COLORS.INCOME : COLORS.EXPENSE;
  const percentageUsed = item.budgetedAmount !== 0 ? (item.actualAmount / item.budgetedAmount) * 100 : 0;

  const arcPoints = useMemo(() => {
  const points = [];
  const totalAngle = (percentageUsed / 100) * Math.PI * 2;
  const segments = Math.min(Math.ceil(totalAngle / (Math.PI * 2)) * 50, 200); 

  for (let i = 0; i <= segments; i++) {
    const t = i / 50; 
    const angle = -Math.PI / 2 + t * Math.PI * 2;
    const radius = 2 + (t * 0.3); 
    points.push(
      new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0)
    );
  }
  return points;
}, [percentageUsed]);

  const arcColor =
    percentageUsed < 80
      ? COLORS.INCOME
      : percentageUsed < 120
        ? COLORS.WARNING
        : COLORS.EXPENSE;

  
  const budgetHeight = Math.min(item.budgetedAmount * scale, 1.0); 
  const varianceHeight = Math.min(Math.abs(item.variance) * scale, 1.0);

  return (
    <group>
      <group position={[4, -3, 0]}>
        <mesh position={[0, budgetHeight / 2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, budgetHeight, 8]} />
          <meshStandardMaterial
            color={COLORS.PRIMARY}
            emissive={COLORS.PRIMARY}
            emissiveIntensity={0.9}
            transparent
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>

        <mesh position={[0, budgetHeight + varianceHeight / 2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, varianceHeight, 8]} />
          <meshStandardMaterial
            color={varianceColor}
            emissive={varianceColor}
            emissiveIntensity={0.9}
            transparent
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>

        {item.variance !== 0 && (
          <mesh
            position={[0, budgetHeight + varianceHeight + 0.2, 0]}
            rotation={[Math.PI / 2, 0, 0]} 
          >
            <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
            <meshStandardMaterial
              color={varianceColor}
              emissive={varianceColor}
              emissiveIntensity={1.5}
            />
          </mesh>
        )}
      </group>

      <group position={[2, 2.5, -1.5]}>
        <mesh>
          <torusGeometry args={[2, 0.1, 16, 100]} />
          <meshStandardMaterial
            color={COLORS.SECONDARY}
            transparent
            opacity={0.3}
            roughness={0.5}
          />
        </mesh>

        <Line
          points={arcPoints}
          color={arcColor}
          lineWidth={4}
          transparent
          opacity={1}
          depthWrite={false}
          resolution={new Vector2(window.innerWidth, window.innerHeight)}
        />

        <Html center position={[0, 0, 0.5]} transform>
          <div style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
            {percentageUsed.toFixed(0)}%
          </div>
        </Html>

        <Html center position={[0, -1.2, 0.5]} transform style={{ fontSize: '0.7rem', color: 'white' }}>
          <div>Percent of Budget Used</div>
        </Html>
      </group>

      <Html transform center position={[-3, 2.7, 0.5]} style={{ fontSize: '0.8rem', color: 'white', fontWeight: 'bold' }}>
        <div>{item.categoryName}</div>
        <div style={{ color: '#88ff88', fontSize: '0.7rem' }}>{item.quarter}</div>
      </Html>

      <Html transform center position={[-3, 1.3, 0.5]} style={{ fontSize: '0.7rem', color: 'white' }}>
        <div>Budget: ${item.budgetedAmount.toLocaleString()}</div>
        <div>Actual: ${item.actualAmount.toLocaleString()}</div>
      </Html>

      <Html transform center position={[-3, 0, 0.5]} style={{ fontSize: '0.8rem', color: varianceColor, fontWeight: 'bold' }}>
        <div>
          {item.variance >= 0 ? '+' : ''}${Math.abs(item.variance).toLocaleString()} {item.variance >= 0 ? 'OVER' : 'UNDER'}
        </div>
      </Html>

      <Html transform center style={{ width: '360px', fontSize: '0.9rem' }} position={[-1.8, -3, 0]} scale={0.8}>
        <div className="budget-detail__info">
          <div className="glow-effect glow-effect--primary" />
          <div className="budget-detail__row">
            <span className="budget-detail__label">Category:</span>
            <span className="budget-detail__value">{item.categoryName}</span>
          </div>
          <div className="budget-detail__row">
            <span className="budget-detail__label">Quarter:</span>
            <span className="budget-detail__value">{item.quarter}</span>
          </div>
          <div className="budget-detail__row">
            <span className="budget-detail__label">Budget:</span>
            <span className="budget-detail__value">${item.budgetedAmount.toLocaleString()}</span>
          </div>
          <div className="budget-detail__row">
            <span className="budget-detail__label">Actual:</span>
            <span className="budget-detail__value">${item.actualAmount.toLocaleString()}</span>
          </div>
          <div className="budget-detail__row">
            <span className="budget-detail__label">Variance:</span>
            <span className="budget-detail__value" style={{ color: varianceColor }}>
              ${Math.abs(item.variance).toLocaleString()} {item.variance >= 0 ? 'over' : 'under'}
            </span>
          </div>
        </div>
      </Html>

      <Html transform center position={[4, -4.5, 0.5]} style={{ fontSize: '0.7rem', color: 'white' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: COLORS.PRIMARY, borderRadius: '50%' }}></div>
            <span>Budget</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: varianceColor, borderRadius: '50%' }}></div>
            <span>Variance</span>
          </div>
          <div style={{ marginTop: '0.5rem' }}>Budget vs Actual</div>
        </div>
      </Html>
    </group>
  );
};

export default BudgetVisualization;
